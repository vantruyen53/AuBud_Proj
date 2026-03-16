import type{ IWalletService } from "../domain/models/application/interface/IWalletService.js";
import type { ActionTarget } from "../domain/models/application/repository/IWalletRepository.js";
import type { ConvertDTO } from "../data/DTO/AppDTO.js";

export class WalletController {
    constructor(private service: IWalletService) {}

    getAll = async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const result = await this.service.getAllByUserId(userId as string);
            return res.status(200).json(result);
        } catch (error: any) {
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
            console.error('getWallet error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    create = async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const { actionType } = req.params;
            const {walletHash, encryptedNewBalance} = req.body;
            if(encryptedNewBalance){
                const result = await this.service.create(actionType as ActionTarget, walletHash, userId, encryptedNewBalance);
                return res.status(200).json({ status: result });
            }
            const result = await this.service.create(actionType as ActionTarget, walletHash, userId);
            return res.status(200).json({ status: result });
        } catch (error: any) {
            console.error('create error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    update = async (req: any, res: any) => {
        try {
            const { actionType } = req.params;
            const{walletHash, userId} = req.body
            const dto = { ...walletHash, userId };
            const result = await this.service.update(actionType as ActionTarget, dto);
            return res.status(200).json({ status: result });
        } catch (error: any) {
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
            console.error('delete error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    // Mở rộng sau
    getHistory = async (req: any, res: any) => {
        try {
            const { actionType, walletId } = req.params;
            const result = await this.service.getHistory(
                actionType as 'saving' | 'debt',
                walletId
            );
            // console.log('======================')
            // console.log(result)
            return res.status(200).json(result);
        } catch (error: any) {
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
            console.error('createTransaction error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    deleteHistoryTransaction = async (req: any, res: any) => {
        const userId = req.user.id;
        const {wTransactionId, newBalanceHashed, paymentWalletId, encrytedNewWalletBalace}=req.body;
        const {actionType,walletId}=req.params;
         console.log('===================================')
        console.log('actionType: ',actionType)
        console.log('itemId: ', wTransactionId)
        console.log('===================================')
        console.log('foreign id: ',walletId)
        console.log('newBalance: ', newBalanceHashed)
         console.log('===================================')
        console.log('walletId: ', paymentWalletId)
        console.log('newBalance: ', encrytedNewWalletBalace)

        const result = await this.service.deleteTransaction(actionType, {wTransactionId,walletId, newBalanceHashed, paymentWalletId,encrytedNewWalletBalace, userId})

        return res.status(200).json({ status: result });
    }

    convert = async (req: any, res: any) => {
        try {
            const dto: ConvertDTO = req.body;
            console.log(dto)
            const result = await this.service.convert(dto);
            return res.status(200).json({ status: result });
        } catch (error: any) {
            console.error('convert error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
}