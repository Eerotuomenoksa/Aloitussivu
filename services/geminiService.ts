
import { NewsItem } from "../types";
import { getFirebaseAppCheckToken } from "../firebaseClient";

/**
 * Palvelu, joka hoitaa keskustelun tekoälyavustajan kanssa.
 */
type GeminiTask = 'assistant' | 'summarizeNews';

const getGeminiFunctionUrl = () => {
  const explicitUrl = import.meta.env.VITE_GEMINI_CHAT_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return '';
  return `https://europe-west1-${projectId}.cloudfunctions.net/geminiChat`;
};

const requestGemini = async (
  prompt: string,
  history: { role: string; content: string }[],
  task: GeminiTask
) => {
  const url = getGeminiFunctionUrl();
  if (!url) throw new Error('Gemini Cloud Function URL puuttuu.');
  const appCheckToken = await getFirebaseAppCheckToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (appCheckToken) {
    headers['X-Firebase-AppCheck'] = appCheckToken;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, history, task }),
  });

  if (!response.ok) throw new Error(`Gemini Cloud Function failed (${response.status}).`);
  const data = await response.json() as { text?: string };
  return data.text ?? '';
};

export const getGeminiAssistant = async (prompt: string, history: {role: string, content: string}[]) => {
  try {
    return await requestGemini(prompt, history, 'assistant') || "Pahoittelut, en pystynyt vastaamaan juuri nyt.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tapahtui virhe yhteydessä avustajaan. Yritäthän hetken kuluttua uudelleen.";
  }
};

/**
 * Tiivistää uutiset ikäihmille sopivaksi yhteenvedoksi.
 */
export const summarizeNews = async (news: NewsItem[]) => {
  const newsContext = news.map(n => `- ${n.title}: ${n.summary}`).join('\n');
  const prompt = `Tiivistä seuraavat uutisotsikot lyhyeksi ja selkeäksi (noin 2-3 lausetta) tekstiksi ikäihmisten aloitussivulle:\n${newsContext}`;

  try {
    return await requestGemini(prompt, [], 'summarizeNews') || "Uutistiivistelmä ei ole saatavilla juuri nyt.";
  } catch (error) {
    console.error("Summarize News Error:", error);
    return "Uutistiivistelmän lataaminen epäonnistui.";
  }
};
