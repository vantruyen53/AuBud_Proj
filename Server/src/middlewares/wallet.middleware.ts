import type { ActionTarget } from "../domain/models/application/repository/IWalletRepository.js";
import type{ Request, Response, NextFunction } from "express";
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
    const {walletHash} = req.body;
    const { userId } = req.query;

    // userId luôn bắt buộc
    if (!userId) {
        return res.status(400).json({ status: false, message: 'userId is required' });
    }

    // Kiểm tra các field bắt buộc theo từng loại
    const requiredFields: Record<string, string[]> = {
        wallet: ['name', 'balance', 'createdAt'],
        saving: ['name', 'target', 'createdAt'],
        debt:   ['name', 'type', 'partnerName', 'totalAmount','createdAt','paymentWalletId'],
    };

    const missing = requiredFields[actionType as ActionTarget]?.filter(f => !walletHash[f]) ?? [];
    if (missing.length > 0) {
        return res.status(400).json({ 
            status: false, 
            message: `Missing required fields: ${missing.join(', ')}` 
        });
    }

    // Gắn userId vào body để repo dùng
    req.body.userId = userId;
    next();
}

export function validateTransactionBody(req: Request, res: Response, next: NextFunction) {
    const { actionType } = req.params;
    const body = req.body;
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ status: false, message: 'userId is required' });
    }

    const requiredFields: Record<string, string[]> = {
        saving: ['walletId', 'amount', 'createdAt', 'type', 'saving_book_id'],
        debt:   ['debtId', 'type', 'amount', 'walletId', 'createdAt', ],
    };

    const missing = requiredFields[actionType as ActionTarget]?.filter(f => !body[f]) ?? [];
    if (missing.length > 0) {
        return res.status(400).json({ 
            status: false, 
            message: `Missing required fields: ${missing.join(', ')}` 
        });
    }

    req.body.userId = userId;
    next();
}

export function validateConvertBody(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.query;
    const body = req.body;
    console.log('Start validateConvertBody')
    if (!userId) {
        return res.status(400).json({ status: false, message: 'userId is required' });
    }

    const requiredFields = ['fromWalletId', 'toWalletId', 'amount'];
    const missing = requiredFields.filter(f => !body[f]);
    if (missing.length > 0) {
        return res.status(400).json({ 
            status: false, 
            message: `Missing required fields: ${missing.join(', ')}` 
        });
    }

    if (body.fromWalletId === body.toWalletId) {
        return res.status(400).json({ 
            status: false, 
            message: 'fromWalletId and toWalletId must be different' 
        });
    }

    req.body.userId = userId;
    next();
}