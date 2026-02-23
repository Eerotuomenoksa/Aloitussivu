
import { GoogleGenAI } from "@google/genai";
import { NewsItem } from "../types";

/**
 * Palvelu, joka hoitaa keskustelun tekoälyavustajan kanssa.
 */
export const getGeminiAssistant = async (prompt: string, history: {role: string, content: string}[]) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    return "Tekoälyavustaja ei ole vielä aktivoitu. Katso ohjeet 'Tietoa'-painikkeen alta (API-avaimen hankinta).";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const formattedContents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: formattedContents,
      config: {
        systemInstruction: "Olet ystävällinen ja avulias suomenkielinen tekoälyavustaja, joka on suunniteltu auttamaan ikäihmisiä. Käytä selkeää suomen kieltä, vältä vaikeita teknisiä termejä ja vastaa rauhallisesti ja kannustavasti. Jos et tiedä vastausta, sano se rehellisesti ja ohjaa tarvittaessa SeniorSurf-palveluun.",
        temperature: 0.7,
      },
    });

    return response.text || "Pahoittelut, en pystynyt vastaamaan juuri nyt.";
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key")) {
      return "Virhe API-avaimessa. Tarkistathan, että se on syötetty oikein ohjeiden mukaan.";
    }
    return "Tapahtui virhe yhteydessä avustajaan. Yritäthän hetken kuluttua uudelleen.";
  }
};

/**
 * Tiivistää uutiset ikäihmille sopivaksi yhteenvedoksi.
 */
export const summarizeNews = async (news: NewsItem[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return "Tekoäly ei ole käytössä (API-avain puuttuu).";

  const ai = new GoogleGenAI({ apiKey });
  
  const newsContext = news.map(n => `- ${n.title}: ${n.summary}`).join('\n');
  const prompt = `Tiivistä seuraavat uutisotsikot lyhyeksi ja selkeäksi (noin 2-3 lausetta) tekstiksi ikäihmisten aloitussivulle:\n${newsContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Olet avulias uutisten tiivistäjä. Käytä erittäin selkeää suomen kieltä.",
        temperature: 0.5,
      }
    });

    return response.text || "Uutistiivistelmä ei ole saatavilla juuri nyt.";
  } catch (error) {
    console.error("Summarize News Error:", error);
    return "Uutistiivistelmän lataaminen epäonnistui.";
  }
};
