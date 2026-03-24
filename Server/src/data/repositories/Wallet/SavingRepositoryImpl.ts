import type { Pool,RowDataPacket } from "mysql2/promise";
import type{ISavingRepository} from '../../../domain/models/application/repository/IWalletRepository.js';
import type{SavingEntity, SavingHistoryEntity} from '../../../domain/entities/appEntities.js';
import type { CreateSavingDTO, UpdateSavingDTO,CreateSavingTransactionDTO } from "../../DTO/AppDTO.js";
import { LogService } from "../../../services/systemLogService.js";

export class SavingRepository implements ISavingRepository {
    constructor(private pool: Pool) {}

    async findAllByUserId(userId: string): Promise<SavingEntity[]> {
        const sql = `
            SELECT id, name, balance, target
            FROM savings_book
            WHERE user_id = ? AND status != 'deleted'
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [userId]);
        return rows.map(r => ({
            id:      r.id,
            name:    r.name,
            balance: r.balance,
            target:  r.target,
        }));
    }

    async findById(userId:string, id:string): Promise<SavingEntity | null>{
         const sql = `
            SELECT id, name, balance, target
            FROM savings_book
            WHERE user_id = ? AND id = ? AND status != 'deleted'
        `;   
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [userId, id]);
        if (!rows.length) return null;
            return rows[0] as SavingEntity;
    }

    async create(dto: CreateSavingDTO,handleBy:'bot'|'user', userId:string): Promise<boolean> {
        const sql = `
            INSERT INTO savings_book (id, user_id, name, balance, target, create_at, last_access, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const id = crypto.randomUUID();
        console.log('dto: ', dto)
        console.log('userId: ', userId)
        console.log('id: ', id)
        const [result] = await this.pool.execute(sql, [
            id, userId, dto.name, dto.balance, dto.target,
            dto.createdAt, dto.createdAt, dto.status
        ]);
        return (result as any).affectedRows > 0;
    }

    async update(dto: UpdateSavingDTO): Promise<boolean> {
        const sql = `
            UPDATE savings_book
            SET name = ?, balance = ?, target = ?, last_access = NOW()
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await this.pool.execute(sql, [
            dto.name, dto.balance, dto.target, dto.id, dto.userId
        ]);
        return (result as any).affectedRows > 0;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const sql = `
            UPDATE savings_book SET status = 'deleted'
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await this.pool.execute(sql, [id, userId]);
        return (result as any).affectedRows > 0;
    }

    async findHistory(savingId: string): Promise<SavingHistoryEntity[]> {
        const sql = `
            SELECT sh.id, sh.wallet_id, w.name as wallet_name, sh.amount,
                   sh.create_at AS createdAt, sh.note, sh.saving_book_id
            FROM savings_history sh
            LEFT JOIN wallet w ON sh.wallet_id = w.id
            WHERE sh.saving_book_id = ? AND type != 'deleted'
            ORDER BY sh.create_at DESC
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [savingId]);
        return rows.map(r => ({
            id:         r.id, 
            walletId:   r.wallet_id,
            walletName: r.wallet_name,
            amount:     r.amount,
            createdAt:  r.createdAt,
            note:       r.note,
            foreignId:  r.saving_book_id,
        }));
    }

    async createHistory(dto: CreateSavingTransactionDTO): Promise<boolean> {
        const conn = await this.pool.getConnection();
        try{
            await conn.beginTransaction();

            const sql = `
                INSERT INTO savings_history 
                    (id, user_id, wallet_id, amount, create_at, note, type, saving_book_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const id = crypto.randomUUID();
            const [result] = await conn.execute(sql, [
                id, dto.userId, dto.walletId, dto.amount,
                dto.createdAt, dto.note ?? '', dto.type, dto.saving_book_id
            ]);

            const updateSavingBalance = `UPDATE savings_book SET balance = ? , last_access = ?  WHERE id = ? AND user_id = ?`
            await conn.execute(updateSavingBalance,[dto.newBalance, dto.createdAt, dto.saving_book_id, dto.userId])

            const updateWalletBalance=`UPDATE wallet SET balance = ?  WHERE id = ? AND user_id = ?`;
            await conn.execute(updateWalletBalance, [dto.encryptedNewBalance, dto.walletId, dto.userId])

            await conn.commit();

            return (result as any).affectedRows > 0;
        }catch (error:any) {
            await conn.rollback();
            await LogService.write({
                message: `SavingRepository.createHistory failed: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'saving_repo.create_history.error',
                metaData: { error: error.message, stack: error.stack } as any,
            });
  console.error("Create Transaction Error:", error);
            console.error("Create Transaction Error:", error);
            return false;
        } finally {
            conn.release();
        }
    }

    async deleteHistory(dto: any): Promise<boolean> {
        const conn = await this.pool.getConnection();
        try{
            await conn.beginTransaction();

            const deleteSql = `UPDATE savings_history SET type = ? where id = ? and saving_book_id = ? `
            const [dResult] = await this.pool.execute(deleteSql, ['deleted', dto.wTransactionId, dto.walletId])

            const updateSql = `UPDATE savings_book SET balance = ? where id = ? AND user_id = ? `
            const [uResult] = await this.pool.execute(updateSql, [dto.newBalanceHashed, dto.walletId, dto.userId])

            //bakcup balance for wallet that used for payment, bank or cash,...
            const backupBalanceSq = `UPDATE wallet SET balance = ? where id = ? AND user_id = ? `
            const [bResult] = await this.pool.execute(backupBalanceSq, [dto.encrytedNewWalletBalace, dto.paymentWalletId, dto.userId])

            if((dResult as any).affectedRows > 0 && (uResult as any).affectedRows > 0 && (bResult as any).affectedRows > 0 )
                return true
            else
                return false

        }catch (error:any) {
            await conn.rollback();
            await LogService.write({
                message: `SavingRepository.deleteHistory failed: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'saving_repo.delete_history.error',
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error("Create Transaction Error:", error);
            return false;
        } finally {
            conn.release();
        }
    }
}
