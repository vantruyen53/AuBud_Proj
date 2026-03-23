import type { WalletScreenEntity, WalletEntity } from "../../../entities/appEntities.js";
import type { ActionTarget } from "../repository/IWalletRepository.js";
import type { ConvertDTO } from "../../../../data/DTO/AppDTO.js";

export interface IWalletService {
    getAllByUserId(userId: string): Promise<WalletScreenEntity>;
    getById(userId: string, id:string): Promise<WalletEntity>;
    create(target: ActionTarget,handleBy:'bot'|'user', dto: any, userId:string, encryptedNewBalance?:string): Promise<boolean>;
    update(target: ActionTarget,handleBy:'bot'|'user', dto: any): Promise<boolean>;
    delete(target: ActionTarget, id: string, userId: string): Promise<boolean>;
    // Mở rộng sau
    getHistory(target: 'saving' | 'debt', parentId: string): Promise<any[]>;
    createTransaction(target: 'saving' | 'debt', dto: any): Promise<boolean>;
    deleteTransaction(target: 'saving' | 'debt', dto: any): Promise<boolean>;
    convert(dto: ConvertDTO): Promise<boolean>;
}