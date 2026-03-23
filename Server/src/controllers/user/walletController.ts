import type{ IWalletService } from "../../domain/models/application/interface/IWalletService.js";
import type { ActionTarget } from "../../domain/models/application/repository/IWalletRepository.js";
import type { ConvertDTO } from "../../data/DTO/AppDTO.js";

import { LogService } from "../../services/systemLogService.js";

export class WalletController {
    constructor(private service: IWalletService) {}

    getAll = async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const result = await this.service.getAllByUserId(userId as string);
            return res.status(200).json(result);
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.getAll] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.getAll.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('getAll error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
    getById = async (req: any, res: any) =>{
        try{
            const userId = req.user.id;
            const {id } = req.query;
            const result = await this.service.getById(userId, id);
            return res.status(200).json(result);
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.getById] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.getById.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('getWallet error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    create = async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const { actionType } = req.params;
            const {walletHash,handleBy, encryptedNewBalance} = req.body;
            if(encryptedNewBalance){
                const result = await this.service.create(actionType as ActionTarget, walletHash, userId, encryptedNewBalance);
                return res.status(200).json({ status: result });
            }
            const result = await this.service.create(actionType as ActionTarget, handleBy, walletHash, userId);
            return res.status(200).json({ status: result });
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.create] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.create.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('create error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    update = async (req: any, res: any) => {
        try {
            const { actionType } = req.params;
            const{walletHash,handleBy, userId} = req.body
            const dto = { ...walletHash, userId };
            const result = await this.service.update(actionType as ActionTarget,handleBy, dto);
            return res.status(200).json({ status: result });
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.update] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.update.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('update error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
    delete = async (req: any, res: any) => {
        try {
            const { actionType, walletId } = req.params;
            const userId = req.user.id;
            const result = await this.service.delete(
                actionType as ActionTarget,
                walletId,
                userId as string
            );
            return res.status(200).json({ status: result });
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.delete] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.delete.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('delete error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    getHistory = async (req: any, res: any) => {
        try {
            const { actionType, walletId } = req.params;
            const result = await this.service.getHistory(
                actionType as 'saving' | 'debt',
                walletId
            );
            return res.status(200).json(result);
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.getHistory] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.getHistory.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('getHistory error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    createTransaction = async (req: any, res: any) => {
        try {
            const { actionType } = req.params;
            const dto = req.body;
            const result = await this.service.createTransaction(
                actionType as 'saving' | 'debt',
                dto
            );
            if(result) return res.status(200).json({ status: result });
            return res.status(500).json({ status: false, message: "Server error" });
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.createTransaction] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.createTransaction.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('createTransaction error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    deleteHistoryTransaction = async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const { wTransactionId, newBalanceHashed, paymentWalletId, encrytedNewWalletBalace } = req.body;
            const { actionType, walletId } = req.params;

            const result = await this.service.deleteTransaction(actionType, {
            wTransactionId, walletId, newBalanceHashed,
            paymentWalletId, encrytedNewWalletBalace, userId
            });

            return res.status(200).json({ status: result });
        } catch (error: any) {
            await LogService.write({
            message: `deleteHistoryTransaction error: ${error.message}`,
            actor_type: 'system', type: 'error', status: 'failure',
            actionDetail: 'wallet.delete_transaction.error',
            actorId: req.user?.id, ipAddress: req.ip,
            metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('deleteHistoryTransaction error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    convert = async (req: any, res: any) => {
        try {
            const dto: ConvertDTO = req.body;
            console.log(dto)
            const result = await this.service.convert(dto);
            return res.status(200).json({ status: result });
        } catch (error: any) {
            await LogService.write({
                message: `[WalletController.convert] error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'wallet.convert.error',
                actorId: req.user?.id, ipAddress: req.ip,
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('convert error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
}