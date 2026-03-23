import { LogService } from "../services/systemLogService.js";

export function ValidationTransaction(req:any, res:any, next:any){
    const body = req.body;
    const userId = req.user.id; 

    const requiredFields=['amount', 'categoryId', 'title', 'walletId']

    const missing=requiredFields.filter(f=>!body[f])

    if(missing.length>0){
        LogService.write({
            message: `Transaction validation failed for userId: ${userId}`,
            actor_type: 'user',
            type: 'warning',
            status: 'failure',
            actionDetail: 'validation.transaction.missing_fields',
            actorId: userId as string,
            ipAddress: req.ip as string,
            metaData: {
                missingFields: missing,
            } as any,
            }).catch(err => console.error('[TransactionMiddleware] Failed to write log:', err));
        return res.status(400).json({ 
            status: false, 
            message: `Missing required fields: ${missing.join(', ')}` 
        });
    }
    
    next();
}