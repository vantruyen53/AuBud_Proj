import { IsString, IsOptional, MaxLength, MinLength, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { WalletEntity } from '../domain/entities/appEntities.js';

class ChatRequestDto {
//   @IsString()
//   @MinLength(1, { message: 'Message không được để trống' })
//   @MaxLength(500, { message: 'Message không được vượt quá 500 ký tự' })
  message: string;

//   @IsOptional()
//   @IsString()
//   @MaxLength(2000, { message: 'Context không được vượt quá 2000 ký tự' })
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

  // kiểm tra prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return res.status(400).json({ message: 'Yêu cầu không hợp lệ' });
    }
  }

  // sanitize
  req.body.message = sanitizeString(message);
  if (context) {
    req.body.context = sanitizeString(context);
  }

  req.body.wallets = wallets.map(w => ({
    ...w,
    name: sanitizeString(w.name),
  }));

  next();
};