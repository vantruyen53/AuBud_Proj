import type{IDebtRepository} from '../../../domain/models/application/repository/IWalletRepository.js';
import type { Pool,RowDataPacket } from "mysql2/promise";
import type{DebtEntity, DebtHistoryEntity} from '../../../domain/entities/appEntities.js';
import type { CreateDebtDTO, UpdateDebtDTO,CreateDebtTransactionDTO } from "../../DTO/AppDTO.js";

export class DebtRepository implements IDebtRepository {
    constructor(private pool: Pool) {}

    async findAllByUserId(userId: string): Promise<DebtEntity[]> {
        const sql = `
            SELECT id, name, type, partner_name, total_amount, remaining, create_at
            FROM debts
            WHERE user_id = ? AND status != 'deleted'
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [userId]);
        return rows.map(r => ({
            id:          r.id,
            name:        r.name,
            type:        r.type,
            partnerName: r.partner_name,
            totalAmount: r.total_amount,
            remaining:   r.remaining,
            createdAt:   r.create_at,
        }));
    }

    async findById(userId:string, id:string): Promise<DebtEntity | null>{
        const sql = `
            SELECT id, name, type, partner_name, total_amount, remaining, create_at
            FROM debts
            WHERE user_id = ? AND id = ? AND status != 'deleted'
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [userId, id]);
        if (!rows.length) return null;
        return rows[0] as DebtEntity;
    }

    async create(dto: CreateDebtDTO): Promise<boolean> {
        const sql = `
            INSERT INTO debts 
                (id, user_id, name, type, partner_name, total_amount, remaining, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const id = crypto.randomUUID();
        const [result] = await this.pool.execute(sql, [
            id, dto.userId, dto.name, dto.type,
            dto.partnerName, dto.totalAmount,dto.remaining ?? dto.totalAmount, dto.status
        ]);
        return (result as any).affectedRows > 0;
    }

    async update(dto: UpdateDebtDTO): Promise<boolean> {
        const sql = `
            UPDATE debts
            SET name = ?, partner_name = ?, total_amount = ?, remaining = ?
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await this.pool.execute(sql, [
            dto.name, dto.partnerName, dto.totalAmount,
            dto.remaining, dto.id, dto.userId
        ]);
        return (result as any).affectedRows > 0;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const sql = `
            UPDATE debts SET status = 'deleted'
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await this.pool.execute(sql, [id, userId]);
        return (result as any).affectedRows > 0;
    }

    async findHistory(debtId: string): Promise<DebtHistoryEntity[]> {
        const sql = `
            SELECT id, debt_id, action_type, amount, create_at, note
            FROM debt_history
            WHERE debt_id = ?
            ORDER BY create_at DESC
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [debtId]);
        return rows.map(r => ({
            id:        r.id,
            debtId:    r.debt_id,
            type:      r.action_type,
            amount:    r.amount,
            createdAt: r.create_at,
            note:      r.note,
        }));
    }

    async createHistory(dto: CreateDebtTransactionDTO): Promise<boolean> {
        const conn = await this.pool.getConnection();
        try{
            await conn.beginTransaction();

            const sql = `
                INSERT INTO debt_history 
                    (id, debt_id, types, amount, created_at, note, user_id, status, wallet_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const id = crypto.randomUUID();
            const [result] = await conn.execute(sql, [
                    id, dto.debtId, dto.type, dto.amount, dto.createdAt, 
                dto?.note ?? '', dto.userId, 'completed', dto.walletId
            ]);

            const updateRemaing=`UPDATE debts SET remaining = ? WHERE id = ? AND user_id = ?`
            await conn.execute(updateRemaing,[dto.newRemaining, dto.debtId, dto.userId])
            
            const updateWalletBalance=`UPDATE wallet SET balance = ?  WHERE id = ? AND user_id = ?`
            await conn.execute(updateWalletBalance, [dto.encryptedNewBalance, dto.walletId, dto.userId])

            await conn.commit();
            return (result as any).affectedRows > 0;
        }catch (error) {
            await conn.rollback();
            console.error("Create Transaction Error:", error);
            return false;
        } finally {
            conn.release();
        }
    }
}