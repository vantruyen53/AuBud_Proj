import type { WalletEntity } from '../domain/entities/appEntities.js';
import { LogService } from '../services/systemLogService.js';

class ChatRequestDto {
  message: string;
  context?: string;
  wallets: WalletEntity[];
}

const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /ignore all instructions/i,
  /you are now/i,
  /forget your instructions/i,
  /system prompt/i,
  /act as/i,
];

const sanitizeString = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '')          
    .replace(/[<>{}`]/g, '')        
    .trim();
};

export const validateChatBody = (req: any, res: any, next: any) => {
  const { message, wallets } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ message: 'Message không được để trống' });
  }

  if (message.length > 500) {
    return res.status(400).json({ message: 'Message không được vượt quá 500 ký tự' });
  }

  if (!Array.isArray(wallets)) {
    return res.status(400).json({ message: 'Wallets không hợp lệ' });
  }

  if (wallets.length > 50) {
    return res.status(400).json({ message: 'Danh sách ví không hợp lệ' });
  }

  next();
};

export const sanitizeChatInput = (req: any, res: any, next: any) => {
  const { message, context, wallets } = req.body as ChatRequestDto;
  const userId = req.user?.id;

  // ── Kiểm tra prompt injection — security event ──────────
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      LogService.write({
        message: `Prompt injection attempt detected from user: ${userId ?? 'unknown'}`,
        actor_type: userId ? 'user' : 'system',
        type: 'warning',
        status: 'failure',
        actionDetail: 'ai.prompt_injection.detected',
        actorId: userId,
        ipAddress: req.ip,
        metaData: {
          // Chỉ lưu pattern nào match, không lưu raw message
          matchedPattern: pattern.toString(),
          messageLength: message.length,
          userAgent: req.headers['user-agent'] ?? '',
        } as any,
      }).catch(err => console.error('[ChatMiddleware] Failed to write log:', err));

      return res.status(400).json({ message: 'Yêu cầu không hợp lệ' });
    }
  }

  // Sanitize — không log, đây là xử lý bình thường
  req.body.message = sanitizeString(message);
  if (context) req.body.context = sanitizeString(context);
  req.body.wallets = wallets.map(w => ({ ...w, name: sanitizeString(w.name) }));

  next();
};;