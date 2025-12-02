// Polyfill/Bridge to make Vercel/Vite env variables work with the required `process.env.API_KEY`
// This must run before any function tries to use it.
if (typeof process === 'undefined') {
  // @ts-ignore
  globalThis.process = { env: {} };
}
// Use Vite's way of accessing env vars and bridge it to process.env
// Cast to `any` to prevent TypeScript errors in environments where import.meta is not standard
const viteApiKey = (import.meta as any).env?.VITE_API_KEY;
if (viteApiKey) {
  process.env.API_KEY = viteApiKey;
}


import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("MISSING_API_KEY");
  }
  return key;
}

export const generateBackgroundImage = async (
  title: string,
  description: string,
  stylePrompt: string,
  aspectRatio: string = "16:9"
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Create a stunning, high-quality YouTube thumbnail background image.
      SCENE DESCRIPTION: ${description}
      VISUAL STYLE: ${stylePrompt}
      CRITICAL INSTRUCTIONS:
      1. NO TEXT. Do not write any words, letters, or logos.
      2. Aspect Ratio ${aspectRatio}.
      3. Composition should have open space (negative space) for text overlay.
      4. High contrast, vibrant lighting.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: aspectRatio } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("A IA retornou uma resposta vazia. Tente um prompt diferente.");

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message.includes('API key not valid')) {
       throw new Error("MISSING_API_KEY");
    }
    // Re-throw the error to be caught by the App component
    throw error;
  }
};

export const generateImagePromptFromTitle = async (title: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Based on the YouTube Video Title: "${title}", write a detailed visual description for a thumbnail background image.
      Focus on: Lighting, Atmosphere, Key Elements, Emotion.
      Keep it concise (under 40 words) and optimized for an AI image generator. 
      Output ONLY the description in English.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("Error generating prompt:", error);
    // Silently fail but don't crash the app if prompt generation fails
    return "";
  }
};

export const suggestTitles = async (description: string): Promise<string[]> => {
  return [];
}