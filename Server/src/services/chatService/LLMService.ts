import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface CallGeminiParams {
  systemPrompt: string;
  tools: object[];
  message: string;
}

export interface GeminiResponse {
  type: 'advice' | 'command' | 'reply';
  message: string;
  command: {
    function: string;
    dto: Record<string, unknown>;
  } | null;
}

export const callGemini = async ({ systemPrompt, message }: CallGeminiParams): Promise<GeminiResponse> => {
  try {
    console.log('=== callGemini start, message:', message);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });

    const raw =  response.text;
    console.log('[Gemini] Gemini raw:', raw);

    if (!raw) throw new Error('Gemini trả về response rỗng');

    try {
      return JSON.parse(raw) as GeminiResponse;
    } catch {
      return { type: 'reply', message: raw, command: null };
    }
  } catch (error) {
    console.log('=== callGemini ERROR:', error); // ← bắt lỗi ở đây
    throw error;
  }
};