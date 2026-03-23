// chat.service.ts
import { callGemini } from './LLMService.js';
import type { GeminiResponse } from './LLMService.js';
import { buildSystemPrompt } from '../../chat/system.prompt.js';
import tools from '../../chat/system.tools.js';
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
      usageStatsRepository.incrementPrompt().catch(() => {});
    }

    const systemPrompt = buildSystemPrompt({
      wallets: wallets.map(w => `${w.name} (ID: ${w.id}, số dư: ${w.balance}đ)`).join(', '),
      categories: categories.map(c => `${c.name} (ID: ${c.id}, loại: ${c.type})`).join(', '),
      today
    });

    const fullMessage = context ? `${message}\n\nData context:\n${context}` : message;

    const response = await callGemini({ systemPrompt, tools, message: fullMessage });
    return response;
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