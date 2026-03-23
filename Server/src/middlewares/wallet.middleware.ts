import type { ActionTarget } from "../domain/models/application/repository/IWalletRepository.js";
import type{ Request, Response, NextFunction } from "express";
import { LogService } from "../services/systemLogService.js";

const VALID_TARGETS: ActionTarget[] = ['wallet', 'saving', 'debt'];
const VALID_HISTORY_TARGETS = ['saving', 'debt'];

// Validate actionType từ params
export function validateActionType(req: Request, res: Response, next: NextFunction) {
    const { actionType } = req.params;

    if (!actionType || !VALID_TARGETS.includes(actionType as ActionTarget)) {
        return res.status(400).json({ 
            status: false, 
            message: `Invalid actionType. Must be one of: ${VALID_TARGETS.join(', ')}` 
        });
    }
    next();
}

export function validateHistoryActionType(req: Request, res: Response, next: NextFunction) {
    const { actionType } = req.params;

    if (!VALID_HISTORY_TARGETS.includes(actionType as ActionTarget)) {
        console.log('Invalid actionType for history. Must be: saving | debt')
        return res.status(400).json({ 
            status: false, 
            message: `Invalid actionType for history. Must be: saving | debt` 
        });
    }
    next();
}

// Validate body theo actionType
export function validateWalletBody(req: Request, res: Response, next: NextFunction) {
  const { actionType } = req.params;
  const { walletHash } = req.body;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ status: false, message: 'userId is required' });
  }

  const requiredFields: Record<string, string[]> = {
    wallet: ['name', 'balance', 'createdAt'],
    saving: ['name', 'target', 'createdAt'],
    debt:   ['name', 'type', 'partnerName', 'totalAmount', 'createdAt', 'paymentWalletId'],
  };

  const missing = requiredFields[actionType as ActionTarget]?.filter(f => !walletHash[f]) ?? [];
  if (missing.length > 0) {
    LogService.write({
      message: `Wallet validation failed for userId: ${userId}`,
      actor_type: 'user',
      type: 'warning',
      status: 'failure',
      actionDetail: 'validation.wallet.missing_fields',
      actorId: userId as string,
      ipAddress: req.ip as string,
      metaData: {
        actionType,
        missingFields: missing,
      } as any,
    }).catch(err => console.error('[WalletMiddleware] Failed to write log:', err));

    return res.status(400).json({ status: false, message: `Missing required fields: ${missing.join(', ')}` });
  }

  req.body.userId = userId;
  next();
}

//Transaction của ví như ghi trả nợ, ghi tiền bỏ tiết kiệm, không phải transaction của sending-income
export function validateTransactionBody(req: Request, res: Response, next: NextFunction) {
  const { actionType } = req.params;
  const body = req.body;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ status: false, message: 'userId is required' });
  }

  const requiredFields: Record<string, string[]> = {
    saving: ['walletId', 'amount', 'createdAt', 'type', 'saving_book_id'],
    debt:   ['debtId', 'type', 'amount', 'walletId', 'createdAt'],
  };

  const missing = requiredFields[actionType as ActionTarget]?.filter(f => !body[f]) ?? [];
  if (missing.length > 0) {
    LogService.write({
      message: `Wallet transaction validation failed for userId: ${userId}`,
      actor_type: 'user',
      type: 'warning',
      status: 'failure',
      actionDetail: 'validation.wallet_transaction.missing_fields',
      actorId: userId as string,
      ipAddress: req.ip as string,
      metaData: {
        actionType,
        missingFields: missing,
      } as any,
    }).catch(err => console.error('[WalletMiddleware] Failed to write log:', err));

    return res.status(400).json({ status: false, message: `Missing required fields: ${missing.join(', ')}` });
  }

  req.body.userId = userId;
  next();
}


//Chuyển tiền từ ví này sang ví kia
export function validateConvertBody(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.query;
  const body = req.body;

  if (!userId) {
    return res.status(400).json({ status: false, message: 'userId is required' });
  }

  const requiredFields = ['fromWalletId', 'toWalletId', 'amount'];
  const missing = requiredFields.filter(f => !body[f]);
  if (missing.length > 0) {
    LogService.write({
      message: `Convert wallet validation failed for userId: ${userId}`,
      actor_type: 'user',
      type: 'warning',
      status: 'failure',
      actionDetail: 'validation.wallet_convert.missing_fields',
      actorId: userId as string,
      ipAddress: req.ip as string,
      metaData: { missingFields: missing } as any,
    }).catch(err => console.error('[WalletMiddleware] Failed to write log:', err));

    return res.status(400).json({ status: false, message: `Missing required fields: ${missing.join(', ')}` });
  }

  if (body.fromWalletId === body.toWalletId) {
    LogService.write({
      message: `Convert wallet failed: same source and destination for userId: ${userId}`,
      actor_type: 'user',
      type: 'warning',
      status: 'failure',
      actionDetail: 'validation.wallet_convert.same_wallet',
      actorId: userId as string,
      ipAddress: req.ip as string,
      metaData: { walletId: body.fromWalletId } as any,
    }).catch(err => console.error('[WalletMiddleware] Failed to write log:', err));

    return res.status(400).json({ status: false, message: 'fromWalletId and toWalletId must be different' });
  }

  req.body.userId = userId;
  next();
}