
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Analizza l'audio fisico caricato
 */
export const analyzeAudioToPrompt = async (base64Audio: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Audio } },
          {
            text: `Act as a world-class art director and synesthete. 
            Analyze this audio file and describe its atmosphere, rhythm, and energy in an artistic visual prompt.
            The prompt must be in ENGLISH, describing an abstract or surreal scene. 
            Provide ONLY the final prompt of approximately 60 words.`,
          },
        ],
      },
    ],
  });
  return response.text?.trim() || "";
};

/**
 * Analizza un URL YouTube tramite Google Search Grounding
 */
export const analyzeYoutubeUrlToPrompt = async (url: string): Promise<{ text: string, sources: any[] }> => {
  const ai = getAI();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find information about this YouTube video: ${url}. 
    Analyze the musical genre, lyrics, mood, and visual aesthetics of the music video if present.
    Act as a synesthete and create an artistic prompt in ENGLISH (max 60 words) that visually represents this specific song.
    Describe textures, colors, and lighting. Output ONLY the prompt.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text?.trim() || "",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateSynesthesiaImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1" },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Unable to generate image.");
};
