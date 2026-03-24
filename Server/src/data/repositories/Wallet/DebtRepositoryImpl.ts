import type{IDebtRepository} from '../../../domain/models/application/repository/IWalletRepository.js';
import type { Pool,RowDataPacket } from "mysql2/promise";
import type{DebtEntity, DebtHistoryEntity} from '../../../domain/entities/appEntities.js';
import type { CreateDebtDTO, UpdateDebtDTO,CreateDebtTransactionDTO } from "../../DTO/AppDTO.js";
import { LogService } from '../../../services/systemLogService.js';

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

    async create(dto: CreateDebtDTO,handleBy:'bot'|'user', userId:string, encryptedNewBalance:string): Promise<boolean> {
        // console.log('target:', target)
        // console.log('dto: ', dto)
        // console.log('userId: ', userId)
        // console.log('encryptedNewBalance: ', encryptedNewBalance)
        const conn = await this.pool.getConnection();
        try{
            const sql = `
                INSERT INTO debts 
                    (id, user_id, name, type, partner_name, total_amount, remaining, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const id = crypto.randomUUID();
            const [result] = await conn.execute(sql, [
                id, userId, dto.name, dto.type,
                dto.partnerName, dto.totalAmount,dto.remaining as string, dto.status
            ]);

            const updateWalletBalance=`UPDATE wallet SET balance = ?  WHERE id = ? AND user_id = ?`
            const [uResult] =await conn.execute(updateWalletBalance, [encryptedNewBalance, dto.paymentWalletId as string, userId])

            await conn.commit();

            if((result as any).affectedRows > 0 && (uResult as any).affectedRows > 0)
                return true
            else return false;
        }catch (error:any) {
            await conn.rollback();
            await LogService.write({
                message: `DebtRepository.create failed: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'debt_repo.create.error',
                metaData: { error: error.message, stack: error.stack, userId } as any,
            });
            console.error("Create Transaction Error:", error);
            return false;
        } finally {
            conn.release();
        }
    }

    async update(dto: UpdateDebtDTO): Promise<boolean> {
        try{
            const sql = `
                UPDATE debts
                SET name = ?, partner_name = ?, total_amount = ?, remaining = ?
                WHERE id = ? AND user_id = ?
            `;
            const [result] = await this.pool.execute(sql, [
                dto.name, dto.partnerName, dto.totalAmount,
                dto.remaining as string, dto.id, dto.userId
            ]);
            return (result as any).affectedRows > 0;
        } catch(err:any){
            await LogService.write({
                message: `DebtRepository.update failed: ${err.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'debt_repo.update.error',
                metaData: { error: err.message, stack: err.stack } as any,
            });
            console.error(err)
            return false;
        }
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
           SELECT dh.id, w.name as wallet_name, dh.wallet_id, dh.debt_id, dh.types, dh.amount, dh.created_at as createdAt , dh.note
            FROM debt_history dh
            LEFT JOIN wallet w ON dh.wallet_id = w.id
            WHERE dh.debt_id = ? AND dh.status != 'deleted'
            ORDER BY dh.created_at DESC
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [debtId]);
        return rows.map(r => ({
            id:         r.id,
            walletId:   r.wallet_id,
            walletName: r.wallet_name,
            foreignId:  r.debt_id,
            amount:     r.amount,
            createdAt:  r.createdAt,
            note:       r.note,
            type:       r.types
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
        }catch (error:any) {
            await conn.rollback();
            await LogService.write({
                message: `DebtRepository.createHistory failed: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'debt_repo.create_history.error',
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error("Create Transaction Error:", error);
            return false;
        } finally {
            conn.release();
        }
    }

    async deleteHistory(dto: any): Promise<boolean> {
        const conn = await this.pool.getConnection();
        console.log(dto)
        try{
            await conn.beginTransaction();

            const deleteSql = `UPDATE debt_history SET status = ? where id = ? and debt_id = ?`
            const [dResult] = await this.pool.execute(deleteSql, ['deleted', dto.wTransactionId, dto.walletId])

            const updateSql = `UPDATE debts SET remaining = ? where id = ? AND user_id = ?`
            const [uResult] = await this.pool.execute(updateSql, [dto.newBalanceHashed, dto.walletId, dto.userId])

            //bakcup balance for wallet that used for payment, bank or cash,...
            const backupBalanceSq = `UPDATE wallet SET balance = ? where id = ? AND user_id = ? `
            const [bResult] = await this.pool.execute(backupBalanceSq, [dto.encrytedNewWalletBalace, dto.paymentWalletId, dto.userId])

            if((dResult as any).affectedRows > 0 && (uResult as any).affectedRows > 0 && (bResult as any).affectedRows > 0)
                return true
            else
                return false

        }catch (error:any) {
            await conn.rollback();
             await LogService.write({
                message: `DebtRepository.deleteHistory failed: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'debt_repo.delete_history.error',
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error("Delete Transaction Error:", error);
            return false;
        } finally {
            conn.release();
        }
    }
}