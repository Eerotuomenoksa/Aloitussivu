
import { GoogleGenAI } from "@google/genai";
import { NewsItem } from "../types";

/**
 * Palvelu, joka hoitaa keskustelun tekoälyavustajan kanssa.
 * Käyttää Gemini-mallia vastauksien tuottamiseen.
 */
export const getGeminiAssistant = async (prompt: string, history: {role: string, content: string}[]) => {
  // Alustetaan AI-asiakas käyttäen named parameteria ja process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
        systemInstruction: "Olet ystävällinen ja avulias suomenkielinen tekoälyavustaja, joka on suunniteltu auttamaan ikäihmisiä. Käytä selkeää suomen kieltä, vältä vaikeita teknisiä termejä ja vastaa rauhallisesti ja kannustavasti. Ohjaa käyttäjää tarvittaessa käyttämään vasemman reunan pikalinkkejä (esim. Sää, Terveys, Julkiset palvelut). Emme enää näytä uutisvirtaa, joten älä mainitse sitä.",
        temperature: 0.7,
      },
    });

    // Luetaan generoitu teksti .text-ominaisuudesta
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
  // Alustetaan AI-asiakas käyttäen named parameteria.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

    // Luetaan generoitu teksti .text-ominaisuudesta
    return response.text || "Uutistiivistelmä ei ole saatavilla juuri nyt.";
  } catch (error) {
    console.error("Summarize News Error:", error);
    return "Uutistiivistelmän lataaminen epäonnistui.";
  }
};
