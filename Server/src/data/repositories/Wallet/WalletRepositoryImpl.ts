// repositories/WalletRepository.ts
import type{ Pool, RowDataPacket } from 'mysql2/promise';
import type{ IWalletRepository } from '../../../domain/models/application/repository/IWalletRepository.js';
import type{ WalletEntity } from '../../../domain/entities/appEntities.js';
import type{ CreateWalletDTO, UpdateWalletDTO } from '../../DTO/AppDTO.js';

export class WalletRepository implements IWalletRepository {
    constructor(private pool: Pool) {}

    async findAllByUserId(userId: string): Promise<WalletEntity[]> {
        const sql = `
            SELECT id, name, balance
            FROM wallet
            WHERE user_id = ? AND status != 'deleted'
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [userId]);
        return rows.map(r => ({
            id:      r.id,
            name:    r.name,
            balance: r.balance,
        }));
    }

    async findById(userId:string, id:string): Promise<WalletEntity | null>{
        const sql = `
            SELECT id, name, balance
            FROM wallet
            WHERE user_id = ? AND id = ? AND status != 'deleted' 
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [userId, id]);
        if (!rows.length) return null;
        return rows[0] as WalletEntity;
    }

    async create(dto: CreateWalletDTO): Promise<boolean> {
        const sql = `INSERT INTO wallet (id, name, balance, create_at, user_id, status)
            VALUES (?, ?, ?, ?, ?, ?) `;
        const id = crypto.randomUUID();
        const [result] = await this.pool.execute(sql, [
            id, dto.name, dto.balance, dto.createdAt, dto.userId, dto.status
        ]);
        return (result as any).affectedRows > 0;
    }

    async update(dto: UpdateWalletDTO): Promise<boolean> {
        const sql = `
            UPDATE wallet
            SET name = ?, balance = ?
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await this.pool.execute(sql, [
            dto.name, dto.balance, dto.id, dto.userId
        ]);
        return (result as any).affectedRows > 0;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const sql = `
            UPDATE wallet SET status = 'deleted'
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await this.pool.execute(sql, [id, userId]);
        return (result as any).affectedRows > 0;
    }
}