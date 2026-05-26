import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI } from '@google/genai';
import { getAllowedOrigins } from './cors';

type ChatMessage = {
  role: string;
  content: string;
};

const ASSISTANT_INSTRUCTION = 'Olet ystävällinen ja avulias suomenkielinen tekoälyavustaja, joka on suunniteltu auttamaan ikäihmisiä. Käytä selkeää suomen kieltä, vältä vaikeita teknisiä termejä ja vastaa rauhallisesti ja kannustavasti. Jos et tiedä vastausta, sano se rehellisesti ja ohjaa tarvittaessa SeniorSurf-palveluun.';
const NEWS_INSTRUCTION = 'Olet avulias uutisten tiivistäjä. Käytä erittäin selkeää suomen kieltä.';

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
