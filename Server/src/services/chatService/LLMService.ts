import { GoogleGenAI } from '@google/genai';
import { LogService } from '../systemLogService.js';
import type { GeminiBudgetResponse } from '../applicationService/BudgetService.js';

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

export const callGemini = async (type:'chat' | 'budget'='chat', { systemPrompt, message }: CallGeminiParams): Promise<GeminiResponse | GeminiBudgetResponse> => {
  const start = Date.now();
  try {
    console.log('=== callGemini start, message:', message);
     await LogService.write({
      message: 'Gemini API call initiated',
      actor_type: 'system',
      type: 'ai',
      status: 'pending',
      actionDetail: 'ai.gemini.call',
      metaData: { messageLength: message.length } as any,
    });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });

    const raw =  response.text;
    const duration = Date.now() - start;
    console.log('[Gemini] Gemini raw:', raw);

    if (!raw) throw new Error('Gemini trả về response rỗng');

    await LogService.write({
      message: 'Gemini API response received successfully',
      actor_type: 'system',
      type: 'ai',
      status: 'success',
      actionDetail: 'ai.gemini.response',
      metaData: { durationMs: duration, responseLength: raw.length } as any,
    });

    try {
      if(type==='chat')
        return JSON.parse(raw) as GeminiResponse;
      else
        return JSON.parse(raw) as GeminiBudgetResponse;
    } catch {
      if(type==='chat')
        return { type: 'reply', message: raw, command: null };
      else       
        return { message: 'Some thing went wrong', budgets: [] };
    }
  } catch (error:any) {
    const duration = Date.now() - start;
    await LogService.write({
      message: `Gemini API call failed: ${error.message}`,
      actor_type: 'system',
      type: 'ai',
      status: 'failure',
      actionDetail: 'ai.gemini.call.failed',
      metaData: {
        error: error.message,
        durationMs: duration,
        // Không log systemPrompt hay message — có thể chứa data nhạy cảm
      } as any,
    });
    console.log('=== callGemini ERROR:', error); // ← bắt lỗi ở đây
    throw error;
  }
};