import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper robusto para encontrar a API Key em qualquer ambiente (Vite, Next, Create React App)
const getApiKey = (): string => {
  // 1. Tenta VITE (Padrão para este projeto no Vercel)
  // Usamos 'as any' para evitar erros de TS se os tipos do Vite não estiverem configurados
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  
  // 2. Tenta REACT_APP (Padrão antigo)
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_KEY) {
    return process.env.REACT_APP_API_KEY;
  }

  // 3. Tenta Padrão Node/Next (process.env.API_KEY)
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }

  return "";
};

export const generateBackgroundImage = async (
  title: string,
  description: string,
  stylePrompt: string,
  aspectRatio: string = "16:9"
): Promise<string> => {
  
  const apiKey = getApiKey();

  if (!apiKey) {
    // Lança um erro específico que o App.tsx vai reconhecer para mostrar a tela de ajuda
    throw new Error("MISSING_KEY");
  }

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
    
    // Tratamento de erros específicos
    const msg = (error.message || "").toLowerCase();
    
    if (msg.includes("missing_key")) {
      throw error; // Repassa o erro de chave para o App tratar
    }
    
    if (msg.includes("key") || msg.includes("api")) {
       throw new Error("MISSING_KEY"); // Força o erro de chave se a API reclamar
    }

    if (msg.includes("safety")) {
      throw new Error("O conteúdo solicitado foi bloqueado por filtros de segurança. Use termos mais leves.");
    }
    if (msg.includes("429") || msg.includes("quota")) {
      throw new Error("Muitas solicitações. Aguarde um momento.");
    }
    
    throw error;
  }
};

export const generateImagePromptFromTitle = async (title: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("MISSING_KEY");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
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
    if (error.message?.includes("KEY")) throw new Error("MISSING_KEY");
    return "";
  }
};

export const suggestTitles = async (description: string): Promise<string[]> => {
  return [];
}