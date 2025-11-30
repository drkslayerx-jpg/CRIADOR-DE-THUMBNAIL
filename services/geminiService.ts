import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper to find the key in various likely environment locations
const getApiKey = (): string | undefined => {
  // Check standard Node/Vercel Server env
  if (process.env.API_KEY) return process.env.API_KEY;
  
  // Check Create React App / Vercel Frontend env
  if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
  
  // Check Vite env (common in modern stacks)
  if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
  
  // Check Next.js public env
  if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;

  return undefined;
};

export const generateBackgroundImage = async (
  title: string,
  description: string,
  stylePrompt: string,
  aspectRatio: string = "16:9"
): Promise<string> => {
  
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Optimized prompt to focus purely on visual composition
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
    
    if (error.message === "MISSING_API_KEY") {
      throw error;
    }
    
    if (error.message?.includes("SAFETY")) {
      throw new Error("O conteúdo solicitado foi bloqueado por filtros de segurança. Use termos mais leves.");
    }
    if (error.message?.includes("429")) {
      throw new Error("Muitas solicitações. Aguarde um momento.");
    }
    // Propagate generic errors
    throw error;
  }
};

export const generateImagePromptFromTitle = async (title: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_API_KEY");

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
    return "";
  }
};

export const suggestTitles = async (description: string): Promise<string[]> => {
  return [];
}