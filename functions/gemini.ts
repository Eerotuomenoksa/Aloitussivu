import { onRequest, type Request } from 'firebase-functions/v2/https';
import { GoogleGenAI } from '@google/genai';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAllowedOrigins } from './cors';

type ChatMessage = {
  role: string;
  content: string;
};

const ASSISTANT_INSTRUCTION = 'Olet ystävällinen ja avulias suomenkielinen tekoälyavustaja, joka on suunniteltu auttamaan ikäihmisiä. Käytä selkeää suomen kieltä, vältä vaikeita teknisiä termejä ja vastaa rauhallisesti ja kannustavasti. Jos et tiedä vastausta, sano se rehellisesti ja ohjaa tarvittaessa SeniorSurf-palveluun.';
const NEWS_INSTRUCTION = 'Olet avulias uutisten tiivistäjä. Käytä erittäin selkeää suomen kieltä.';
const ALLOWED_TASKS = new Set(['assistant', 'summarizeNews']);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const isValidHistory = (history: unknown): history is ChatMessage[] => (
  Array.isArray(history)
  && history.length <= 20
  && history.every((item) => (
    item
    && typeof item === 'object'
    && typeof (item as ChatMessage).role === 'string'
    && typeof (item as ChatMessage).content === 'string'
    && (item as ChatMessage).content.length <= 4000
  ))
);

const getAdminAppCheck = () => {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getAppCheck();
};

const getClientKey = (req: Request) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return firstForwarded?.split(',')[0]?.trim() || req.ip || 'unknown';
};

const isRateLimited = (clientKey: string) => {
  const now = Date.now();
  const current = rateLimitBuckets.get(clientKey);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
};

const verifyAppCheck = async (req: Request) => {
  const token = req.header('X-Firebase-AppCheck');
  if (!token) return false;

  try {
    await getAdminAppCheck().verifyToken(token);
    return true;
  } catch (error) {
    console.warn('Gemini App Check verification failed:', error);
    return false;
  }
};

export const geminiChat = onRequest(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 60,
    cors: getAllowedOrigins(),
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    if (isRateLimited(getClientKey(req))) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    if (!await verifyAppCheck(req)) {
      res.status(401).json({ error: 'Invalid App Check token' });
      return;
    }

    const { prompt, history = [], task = 'assistant' } = req.body as {
      prompt?: unknown;
      history?: unknown;
      task?: unknown;
    };

    if (typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 4000) {
      res.status(400).json({ error: 'Invalid prompt' });
      return;
    }

    if (!isValidHistory(history)) {
      res.status(400).json({ error: 'Invalid history' });
      return;
    }

    if (typeof task !== 'string' || !ALLOWED_TASKS.has(task)) {
      res.status(400).json({ error: 'Invalid task' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Not configured' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const isNewsSummary = task === 'summarizeNews';
    const contents = [
      ...history.map((message) => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      })),
      { role: 'user', parts: [{ text: prompt }] },
    ];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: isNewsSummary ? NEWS_INSTRUCTION : ASSISTANT_INSTRUCTION,
          temperature: isNewsSummary ? 0.5 : 0.7,
        },
      });

      res.status(200).json({ text: response.text || '' });
    } catch (error) {
      console.error('Gemini function error:', error);
      res.status(500).json({ error: 'Gemini request failed' });
    }
  }
);
