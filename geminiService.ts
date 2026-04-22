
import { GoogleGenAI, Type } from "@google/genai";

// Helper to get fresh AI instance to ensure process.env.API_KEY is latest
const getAI = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to convert an image URL (Unsplash or Data URL) to base64 for Gemini API.
 * This is crucial because Gemini inlineData requires raw base64 data, not URLs.
 */
async function imageUrlToBase64(url: string): Promise<{ data: string, mimeType: string }> {
  // If it's already a data URL
  if (url.startsWith('data:image/')) {
    const match = url.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }

  // If it's a remote URL, we need to fetch it
  try {
    // Unsplash and most CDNs allow cross-origin fetching for images
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve({ data: base64String, mimeType: blob.type || 'image/jpeg' });
      };
      reader.onerror = () => reject(new Error("Failed to read image blob"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    // Fallback: if we can't fetch it due to CORS, we can't send it to Gemini
    throw new Error("Could not process this image for AI editing. Try using an uploaded image or a CORS-friendly URL.");
  }
}

export const generateProjectSchedule = async (projectType: string, constraints: string): Promise<any> => {
  const ai = getAI();
  try {
    const prompt = `
      Act as a senior construction project manager.
      Create a detailed project schedule for a "${projectType}" project.
      Constraints: ${constraints}.
      Return a JSON array of phases. Each phase has a 'phase' (name), 'durationWeeks' (number), and 'details' (string).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phase: { type: Type.STRING },
              durationWeeks: { type: Type.NUMBER },
              details: { type: Type.STRING },
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Project Schedule Error:", error);
    return [];
  }
};

export const askAIArchitect = async (question: string, context: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}\n\nUser Question: ${question}\n\nAnswer as a professional architect. Keep it concise, poetic yet technical.`,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error communicating with the AI service.";
  }
};

export const enhanceDocumentContent = async (blocks: any[]): Promise<any> => {
  const ai = getAI();
  
  // Only target text-heavy blocks
  const textBlocks = blocks.filter(b => ['p', 'h1', 'h2', 'h3', 'blockquote'].includes(b.type) && b.content.trim().length > 0)
    .map(b => ({ id: b.id, type: b.type, content: b.content }));

  if (textBlocks.length === 0) return null;

  const prompt = `
    You are a world-class architectural writer for publications like AD, Dezeen, or Detail. 
    Rewrite the following content blocks to be significantly MORE DETAILED, LONGER, and EVOCATIVE.
    
    Instruction for each block:
    - Paragraphs (p): ELABORATE on the concepts. Use professional terminology like "spatial choreography", "tectonic integrity", "material honesty", and "atmospheric resonance". Each paragraph should be 2-3 times longer than the original draft.
    - Headings (h1, h2, h3): Transform into visionary, authoritative titles.
    - Quotes (blockquote): Refine into profound architectural manifestos.
    
    Language: Match the input language (Vietnamese or English).
    Return exactly a JSON array of objects with the same IDs and the new 'enhanced_content'.
    
    Blocks:
    ${JSON.stringify(textBlocks)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              enhanced_content: { type: Type.STRING }
            },
            required: ["id", "enhanced_content"]
          }
        }
      }
    });

    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    return null;
  }
};

export const editImageWithAI = async (imageUrl: string, prompt: string): Promise<string | null> => {
  const ai = getAI();
  try {
    // Convert URL to base64 for API compatibility
    const { data, mimeType } = await imageUrlToBase64(imageUrl);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: `As a professional architectural visualizer, modify this image based on: ${prompt}. Ensure high-end rendering quality, realistic textures, and architecturally sound logic. Output ONLY the resulting image.` },
        ],
      },
    });

    // Iterate to find the image part in the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    return null;
  }
};

export const generateSlideLayout = async (blocks: any[], style: string, documentTitle: string = "Project Presentation"): Promise<any> => {
  const ai = getAI();
  const blockMap = new Map(blocks.map(b => [b.id, b]));
  const simplifiedContent = blocks.map(b => ({ 
    id: b.id, 
    type: b.type,
    content_preview: b.type === 'image' ? '[[IMAGE ASSET]]' : b.content.replace(/<[^>]*>?/gm, '').substring(0, 100) 
  }));

  const prompt = `
    Organize the following content into a high-end editorial A3 Landscape Presentation.
    Title: "${documentTitle}"
    Style: ${style}.
    Return a JSON structure for professional slides.
    
    Content:
    ${JSON.stringify(simplifiedContent)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  layout: { type: Type.STRING },
                  title: { type: Type.STRING },
                  elements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                         id: { type: Type.STRING },
                         type: { type: Type.STRING },
                         text_override: { type: Type.STRING } 
                      },
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"slides":[]}');
    if (parsed.slides) {
      parsed.slides.forEach((slide: any) => {
        if (slide.elements) {
           slide.elements = slide.elements.map((el: any) => {
             if (el.id) {
                const originalBlock = blockMap.get(el.id);
                if (originalBlock) return { ...originalBlock };
             }
             if (el.text_override) return { type: el.type || 'p', content: el.text_override };
             return null;
           }).filter((el: any) => el !== null);
        }
      });
    }
    return parsed;
  } catch (error) {
    console.error("Gemini Layout Error:", error);
    return { slides: [] };
  }
};
