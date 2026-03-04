import type{ IWalletService } from "../domain/models/application/interface/IWalletService.js";
import type { ActionTarget } from "../domain/models/application/repository/IWalletRepository.js";
import type { ConvertDTO } from "../data/DTO/AppDTO.js";

export class WalletController {
    constructor(private service: IWalletService) {}

    getAll = async (req: any, res: any) => {
        try {
            const { userId } = req.query ;
            const result = await this.service.getAllByUserId(userId as string);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error('getAll error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
    getById = async (req: any, res: any) =>{
        try{
            const { userId, id } = req.query;
            const result = await this.service.getById(userId, id);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error('getWallet error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    create = async (req: any, res: any) => {
        try {
            const { actionType } = req.params;
            const dto = req.body;
            const result = await this.service.create(actionType as ActionTarget, dto);
            return res.status(200).json({ status: result });
        } catch (error: any) {
            console.error('create error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    update = async (req: any, res: any) => {
        try {
            const { actionType, walletId } = req.params;
            const dto = { ...req.body, id:walletId };
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
            const { userId } = req.query;
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
            const { actionType, id:walletId } = req.params;
            const result = await this.service.getHistory(
                actionType as 'saving' | 'debt',
                walletId
            );
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