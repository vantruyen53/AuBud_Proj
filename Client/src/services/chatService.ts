// service/chatService.ts
import { apiFetch } from "./auth/apiService";

interface GeminiResponse {
  type: 'advice' | 'command' | 'reply';
  message: string;
  command: {
    function: string;
    dto: Record<string, unknown>;
  } | null;
}

export class ChatBotService {
  async post(message: string,wallets: any[],context?: string, isFollowUp: boolean = false): Promise<GeminiResponse | null> {
    try {
      const response = await apiFetch('/chat', {
        method: "POST",
        body: JSON.stringify({ message, wallets, context, isFollowUp }),
      });

      if (!response.ok) return null;

      const data: GeminiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('ChatBotService error:', error);
      return null;
    }
  }
}