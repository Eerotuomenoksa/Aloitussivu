
import { GoogleGenAI } from "@google/genai";
import { NewsItem } from "../types";

const getApiKey = () => {
  return (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';
};

/**
 * Palvelu, joka hoitaa keskustelun tekoälyavustajan kanssa.
 */
export const getGeminiAssistant = async (prompt: string, history: {role: string, content: string}[]) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API_KEY puuttuu!");
    return "Avustaja ei ole juuri nyt käytettävissä (API-avain puuttuu).";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const formattedHistory = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...formattedHistory,
        { parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "Olet ystävällinen ja avulias suomenkielinen tekoälyavustaja, joka on suunniteltu auttamaan ikäihmisiä. Käytä selkeää suomen kieltä, vältä vaikeita teknisiä termejä ja vastaa rauhallisesti ja kannustavasti.",
        temperature: 0.7,
      },
    });

    return response.text || "Pahoittelut, en pystynyt vastaamaan juuri nyt.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tapahtui virhe yhteydessä avustajaan. Yritäthän hetken kuluttua uudelleen.";
  }
};

/**
 * Tiivistää uutiset ikäihmisille sopivaksi yhteenvedoksi.
 */
export const summarizeNews = async (news: NewsItem[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Uutistiivistelmä ei ole käytettävissä.";

  const ai = new GoogleGenAI({ apiKey });
  
  const newsContext = news.map(n => `- ${n.title}: ${n.summary}`).join('\n');
  const prompt = `Tiivistä seuraavat uutisotsikot lyhyeksi ja selkeäksi tekstiksi ikäihmisille:\n${newsContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Olet avulias ja selkeäsanainen uutisten tiivistäjä. Tee lyhyt, selkeä ja ystävällinen tiivistelmä päivän uutisista.",
        temperature: 0.5,
      }
    });

    return response.text || "Uutistiivistelmä ei ole saatavilla juuri nyt.";
  } catch (error) {
    console.error("Summarize News Error:", error);
    return "Uutistiivistelmän lataaminen epäonnistui.";
  }
};
