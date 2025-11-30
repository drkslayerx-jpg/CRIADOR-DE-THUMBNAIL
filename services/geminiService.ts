import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper para encontrar a chave em qualquer lugar (Vite, Vercel, React, Node)
const getApiKey = (): string => {
  // 1. Tenta ler do Vite (Padrão Moderno - VERCEL USA ESTE)
  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env.VITE_API_KEY) {
      return meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // ignore
  }

  // 2. Tenta ler do Process (Padrão Node/Legacy)
  // O Polyfill no index.html garante que process.env exista para não travar
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
  }

  throw new Error("MISSING_KEY");
};

export const generateBackgroundImage = async (
  title: string,
  description: string,
  stylePrompt: string,
  aspectRatio: string = "16:9"
): Promise<string> => {
  
  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch (e) {
    throw new Error("MISSING_KEY");
  }

  // Initialize AI only when needed to prevent load-time crashes
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Create a stunning, high-quality YouTube thumbnail background image.
    
    SCENE DESCRIPTION: ${description}
    
    VISUAL STYLE: ${stylePrompt}
    
    CRITICAL INSTRUCTIONS:
    1. NO TEXT. Do not write any words, letters, or logos.
    2. Aspect Ratio ${aspectRatio}.
    3. Composition should have open space (negative space) in the center or side for overlay text.
    4. High contrast, vibrant lighting.
  `;

  console.log("Generating with prompt:", prompt, "Ratio:", aspectRatio);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    console.log("Response:", response);

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("A IA retornou uma resposta vazia. Tente simplificar sua descrição.");

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Catch common "Key missing" errors from Google and convert to our standard
    if (error.message?.toLowerCase().includes("api key") || error.status === 403) {
      throw new Error("MISSING_KEY");
    }
    
    throw error;
  }
};

export const generateImagePromptFromTitle = async (title: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Based on the YouTube Video Title: "${title}", write a detailed visual description for a thumbnail background image.
      
      Focus on:
      - Lighting and Atmosphere (e.g., dramatic, neon, sunny)
      - Key Elements (e.g., characters, objects, environment)
      - Emotion (e.g., scary, exciting, happy)
      
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
    if (error.message === "MISSING_KEY") return ""; // Silent fail for magic prompt
    return "";
  }
};

export const suggestTitles = async (description: string): Promise<string[]> => {
  return [];
}