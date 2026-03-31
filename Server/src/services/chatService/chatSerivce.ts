// chat.service.ts
import { callGemini } from './LLMService.js';
import type { GeminiResponse } from './LLMService.js';
import { buildSystemPrompt } from '../../AI/system.prompt.js';
import tools from '../../AI/system.tools.js';
import { usageStatsRepository } from '../../data/repositories/usageStatsRepoImpl.js';
import pool from '../../config/dbConfig.js';
import { CategoryRepository } from '../../data/repositories/CategoryRepository.js';
import datetime from '../../utils/helpers/datetime.js';
import { LogService } from '../systemLogService.js';

interface ChatServiceParams {
  userId: string;
  message: string;
  context?: string;
  wallets: { id: number; name: string; balance: number }[];
  isFollowUp:boolean,
}

const categoryRepo = new CategoryRepository(pool)

export const chatService = async ({ userId, message, context, wallets, isFollowUp = false }: ChatServiceParams): Promise<GeminiResponse> => {
  try {
    const today = datetime();
    const categories = await categoryRepo.getAllCategory(userId);

    if (!isFollowUp) {
      console.log("==========increat promt | chatService========")
      usageStatsRepository.incrementPrompt().catch((err) => console.error(err));
    }

    const systemPrompt = buildSystemPrompt({
      wallets: wallets.map(w => `${w.name} (ID: ${w.id}, số dư: ${w.balance}đ)`).join(', '),
      categories: categories.map(c => `${c.name} (ID: ${c.id}, loại: ${c.type})`).join(', '),
      today
    });

    const fullMessage = context ? `${message}\n\nData context:\n${context}` : message;

    const response = await callGemini('chat', { systemPrompt, tools, message: fullMessage });
    return response as GeminiResponse;
  } catch (error: any) {
    // callGemini đã log lỗi Gemini rồi
    // Chỉ log nếu lỗi xảy ra ngoài callGemini (VD: categoryRepo, buildSystemPrompt,...)
    if (error.actionDetail !== 'ai.gemini.call.failed') {
      await LogService.write({
        message: `chatService unexpected error: ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'ai.chat.service.error',
        actorId: userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
    }
    throw error;
  }
};