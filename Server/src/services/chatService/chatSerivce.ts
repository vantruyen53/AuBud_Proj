// chat.service.ts
import { callGemini } from './LLMService.js';
import type { GeminiResponse } from './LLMService.js';
import { buildSystemPrompt } from '../../chat/system.prompt.js';
import tools from '../../chat/system.tools.js';
import { usageStatsRepository } from '../../data/repositories/usageStatsRepoImpl.js';
import pool from '../../config/dbConfig.js';
import { CategoryRepository } from '../../data/repositories/CategoryRepository.js';
import datetime from '../../utils/helpers/datetime.js';

interface ChatServiceParams {
  userId: string;
  message: string;
  context?: string;
  wallets: { id: number; name: string; balance: number }[];
}

const categoryRepo = new CategoryRepository(pool)

export const chatService = async ({ userId, message, context, wallets }: ChatServiceParams):Promise<GeminiResponse> => {

  const today = datetime();
  // lấy categories từ DB (không mã hoá, lấy thẳng ở server)
  const categories = await categoryRepo.getAllCategory(userId);

  // tăng usage_stats, không await vì không ảnh hưởng đến luồng chính
  usageStatsRepository.incrementPrompt().catch(() => {});

  // build system prompt với context của user
  const systemPrompt = buildSystemPrompt({
    wallets: wallets.map(w => `${w.name} (ID: ${w.id}, số dư: ${w.balance}đ)`).join(', '),
    categories: categories.map(c => `${c.name} (ID: ${c.id}, loại: ${c.type})`).join(', '),
    today
  });

  // build message gửi lên Gemini
  // nếu có context (lần gọi thứ 2 — sau khi client giải mã transaction data)
  // thì đính kèm vào message
  const fullMessage = context
    ? `${message}\n\nDữ liệu liên quan:\n${context}`
    : message;

  // gọi Gemini
  const response = await callGemini({ systemPrompt, tools, message: fullMessage });

  return response;
};