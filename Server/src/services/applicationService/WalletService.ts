import type{ IWalletService } from "../../domain/models/application/interface/IWalletService.js";
import type { IWalletRepositoryFactory,ActionTarget } from "../../domain/models/application/repository/IWalletRepository.js";
import type { WalletScreenEntity } from "../../domain/entities/appEntities.js";
import type { ConvertDTO } from "../../data/DTO/AppDTO.js";
import type { WalletEntity } from "../../domain/entities/appEntities.js";
import  type{ Pool } from "mysql2/promise";
import pool from "../../config/dbConfig.js";

export class WalletService implements IWalletService {
    private p:Pool = pool
    constructor(private factory: IWalletRepositoryFactory) {}

    async getAllByUserId(userId: string): Promise<WalletScreenEntity> {
        const [wallets, savings, debts, groupFunds] = await Promise.all([
            this.factory.getRepo('wallet').findAllByUserId(userId),
            this.factory.getRepo('saving').findAllByUserId(userId),
            this.factory.getRepo('debt').findAllByUserId(userId),
            this.factory.getGroupFundRepo().findAllByUserId(userId),
        ]);
        return { wallets, savings, debts, groupFunds };
    }

    async getById(userId: string, id:string): Promise<WalletEntity>{
        const result = await this.factory.getRepo('wallet').findById(userId, id)
        return result;
    }

    async create(target: ActionTarget, dto: any): Promise<boolean> {
        return await this.factory.getRepo(target).create(dto);
    }

    async update(target: ActionTarget, dto: any): Promise<boolean> {
        return await this.factory.getRepo(target).update(dto);
    }

    async delete(target: ActionTarget, id: string, userId: string): Promise<boolean> {
        return await this.factory.getRepo(target).delete(id, userId);
    }

    async getHistory(target: 'saving' | 'debt', parentId: string): Promise<any[]> {
        return await this.factory.getExtendedRepo(target).findHistory(parentId);
    }

    async createTransaction(target: 'saving' | 'debt', dto: any): Promise<boolean> {
        if(target==='debt'){
            dto.newRemaining = dto.encryptedNewRemaingOrBalance;
            delete dto.encryptedNewRemaingOrBalance;
        }
        else{
            dto.newBalance = dto.encryptedNewRemaingOrBalance;
            delete dto.encryptedNewRemaingOrBalance;
        }

        return await this.factory.getExtendedRepo(target).createHistory(dto);
    }

    async convert(dto: ConvertDTO): Promise<boolean> {
        const conn =await this.p.getConnection();
        try {
            await conn.beginTransaction();

            const id = crypto.randomUUID();
            const [result] = await conn.execute(`INSERT INTO convert_history (id, user_id, fromWalletId, toWalletId, createdAt, note, amount)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, dto.userId, dto.fromWalletId, dto.toWalletId, dto.createdAt, dto?.note??'', dto.amount]
            )

            await conn.execute(`UPDATE wallet SET balance = ? WHERE id = ? AND user_id = ?`,
                [dto.fromWalletNewBalance, dto.fromWalletId, dto.userId]
            );
            await conn.execute(
                `UPDATE wallet SET balance =  ? WHERE id = ? AND user_id = ?`,
                [dto.toWalletNewBalance, dto.toWalletId, dto.userId]
            );

            await conn.commit();
            return (result as any).affectedRows > 0;
        } catch (err) {
            await conn.rollback();
            console.error('Convert failed:', err);
            return false;
        } finally {
            conn.release();
        }
    }
}