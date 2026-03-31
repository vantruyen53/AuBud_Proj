import type { ITransactionRepository } from "../../domain/models/application/repository/ITransactionRepo.js";
import type { IUserRepository } from "../../domain/models/auth/IUserRepository.js";
import UserRepositoris from "./auth/UserRepositoryImpl.js";
import type {
  CreateTransactionDTO,
  TransactionQueryDTO,
  UpdateTransactionDTO,
} from "../DTO/AppDTO.js";
import type {
  ITransaction,
  ServerResult,IMonthlySummary
} from "../../domain/entities/appEntities.js";
import datetime from "../../utils/helpers/datetime.js";
import type { Pool } from "mysql2/promise";
import crypto from "crypto";
import { usageStatsRepository } from '../../data/repositories/usageStatsRepoImpl.js';
import { LogService } from "../../services/systemLogService.js";

export class TransactionRepository implements ITransactionRepository {
  private userRepo: IUserRepository
  private datetime = datetime();
  constructor(private readonly pool: Pool) {
    this.userRepo = new UserRepositoris(pool)
  }

  async find(userId: string,query: TransactionQueryDTO): Promise<ITransaction[]> {
    const { day, month, year, categoryId,endDate,startDate, handleBy } = query;

    let sql;
    const params: any[] = [userId];

    if(endDate && startDate){
      sql = `SELECT id, amount, note, title, user_id AS userId, wallet_id AS walletId, category_id AS categoryId, created_at AS createdAt
      FROM transaction
      WHERE user_id = ? AND status = 'completed' AND type = 'sending' AND DATE(created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }else{
      sql = `
        SELECT 
          t.id,
          t.amount,
          t.note,
          t.title,
          t.type,
          t.status,
          t.user_id        AS userId,
          t.wallet_id      AS walletId,
          t.category_id    AS categoryId,
          t.budget_id      AS budgetId,
          t.created_at     AS createdAt, 
          c.name           AS categoryName,
          c.icon_name      AS iconName,
          c.icon_color     AS iconColor,
          c.type           AS categoryType,
          c.library        AS library,
          w.name           AS walletName
        FROM transaction t
        JOIN category c ON t.category_id = c.id
        JOIN wallet w ON t.wallet_id = w.id
        WHERE t.user_id = ? AND t.status = 'completed'
      `;

      // Lọc theo ngày
      if (day && month && year) {
        sql += ` AND DATE(t.created_at) = ?`;
        params.push(`${year}-${month}-${day}`);
      } 
      // Lọc theo tháng
      else if (month && year) {
        sql += ` AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?`;
        params.push(month, year);
      }
      // Lọc theo năm
      else if (year) {
        sql += ` AND YEAR(t.created_at) = ?`;
        params.push(year);
      }
      // Lọc theo category
      if (categoryId) {
        sql += ` AND t.category_id = ?`;
        params.push(categoryId);
      }

      sql += ` ORDER BY t.created_at DESC`;
    }

    const [rows]: any = await this.pool.execute(sql, params);

    return rows as ITransaction[];
  }

  async getMonthlySpendingSummary(userId: string,day: number,month: number,year: number): 
  Promise<{ currentPeriod: IMonthlySummary[]; lastPeriod: IMonthlySummary[] }>{
    
    try{
      const lastMonth = month === 1 ? 12 : month - 1;
      const lastYear  = month === 1 ? year - 1 : year;

      const sql = `
        SELECT 
          t.id,
          t.amount,        
          t.type,          
          t.created_at AS createdAt
        FROM transaction t
        WHERE 
          t.user_id = ?
          AND t.status = 'completed'
          AND t.type = 'sending'
          AND (
            (MONTH(t.created_at) = ? AND YEAR(t.created_at) = ? AND DAY(t.created_at) <= ?)
            OR
            (MONTH(t.created_at) = ? AND YEAR(t.created_at) = ? AND DAY(t.created_at) <= ?)
          )
        ORDER BY t.created_at DESC
      `;

      const params = [
        userId,
        month, year, day,
        lastMonth, lastYear, day
      ];

      const [rows]: any = await this.pool.execute(sql, params);
      const all: IMonthlySummary[] = rows
      // Tách 2 mảng để trả về
      const currentPeriod = all.filter(t => {
        const d = new Date(t.createdAt);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      const lastPeriod = all.filter(t => {
        const d = new Date(t.createdAt);
        return d.getMonth() + 1 === lastMonth && d.getFullYear() === lastYear;
      });

      return { currentPeriod, lastPeriod };
    } catch (error:any) {
       await LogService.write({
        message: `getMonthlySpendingSummary failed: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction_repo.monthly_summary.error',
        actorId: userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error("Create Transaction Error:", error);
      return {
        currentPeriod: [],
        lastPeriod: []
      };
    }
  }

  async create(userId: string,data: CreateTransactionDTO,newEncryptedBalance:string): Promise<ServerResult> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();

      if(data.handle==='user')
        usageStatsRepository.incrementManual().catch(() => {});

      const id = crypto.randomUUID();
      const insertSql = `
        INSERT INTO transaction (id, category_id, amount, user_id, wallet_id, created_at, note,budget_id, status, title, type, handle_by)
        VALUES (?, ?, ?, ?, ?, ?, ?,?, 'completed', ?, ?, ?)
      `;
      await conn.execute(insertSql, [
        id,
        data.categoryId,
        data.amount,
        userId,
        data.walletId,
        data.createdAt ?? this.datetime,
        data.note ?? null,
        data?.budgetId ?? null,
        data.title,
        data.type,
        data.handle ?? 'user'
      ]);

      const updateBalanceSql = `
          UPDATE wallet SET balance = ? WHERE id = ? AND user_id = ?`;
      await conn.execute(updateBalanceSql, [newEncryptedBalance,data.walletId,userId]);

      const increaseCountCategorySql = ` 
          UPDATE category SET usageCount = usageCount + 1 
          WHERE id = ?
        `;
      await conn.execute(increaseCountCategorySql, [data.categoryId]);


      await this.userRepo.updateLastInput(userId, conn);

      await conn.commit();
      return {
        status: true,
        message: "Add successfully",
      };
    } catch (error:any) {
        await conn.rollback();
        await LogService.write({
          message: `TransactionRepository.create failed: ${error.message}`,
          actor_type: 'system', type: 'error', status: 'failure',
          actionDetail: 'transaction_repo.create.error',
          actorId: userId,
          metaData: { error: error.message, stack: error.stack } as any,
        });
        console.error("Create Transaction Error:", error);
        return {
          status: false,
          message: "Add failure",
        };
    } finally {
      conn.release();
    }
  }

  async update(userId: string,data: UpdateTransactionDTO): Promise<ServerResult> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      
      if(data.handle==='user')
        usageStatsRepository.incrementManual().catch(() => {});

      const merged = {
        id: data.id,
        categoryId:  data.categoryId as string,
        amount: data.amount as string,
        type: data.type as string,
        walletId: data.walletId as string,
        createdAt: data.createdAt as string,
        note: data.note ?? '',
        title: data.title as string,
        budgetId:data.budgetId??'',

        oldWalletId:data.oldWalletId,
        oldBalance:data.oldBalance,
        newWalletId:data.newWalletId,
        newBalance:data.newBalance,
      };
      // 3. CẬP NHẬT thông tin giao dịch mới vào bảng transaction
      const updateSql = `
      UPDATE transaction 
      SET category_id = ?, amount = ?, wallet_id = ?, note = ?, title = ?, created_at = ?
      WHERE id = ? AND user_id = ?
    `;
      await conn.execute(updateSql, [
        merged.categoryId,
        merged.amount,
        merged.walletId,
        merged.note,
        merged.title,
        merged.createdAt ?? this.datetime,
        merged.id,
        userId,
      ]);

      //Cập nhật số lại số dư cho ví cũ
      const backupBalanceSql = `
      UPDATE wallet SET balance = ? WHERE id = ? AND user_id = ?
    `;
      await conn.execute(backupBalanceSql, [
        merged.oldBalance,
        merged.oldWalletId,
        userId,
      ]);

      //Cập nhật số dư cho ví mới
      const updateBalanceSql = `
        UPDATE wallet SET balance = ? WHERE id = ? AND user_id = ?
      `;
      await conn.execute(updateBalanceSql, [
        merged.newBalance,
        merged.newWalletId,
        userId,
      ]);

      await conn.commit();
      return {
        status: true,
        message: "Update successfully",
      };
    } catch (error:any) {
      await conn.rollback();
      await LogService.write({
        message: `TransactionRepository.update failed: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction_repo.update.error',
        actorId: userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error("Update Transaction Error:", error);
      return {
        status: false,
        message: "Update failure",
      };
    } finally {
      conn.release();
    }
  }

  async delete(userId: string, id: string, newBackupBalance:string, handleBy:'bot'|'user'): Promise<ServerResult> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();

      if(handleBy==='user')
        usageStatsRepository.incrementManual().catch(() => {});

      const getTxSql = `SELECT wallet_id FROM transaction WHERE id = ? AND user_id = ? AND status = 'completed'`;
      const [tx]: any = await conn.execute(getTxSql, [id, userId]);
      if (tx.length === 0) throw new Error("Transaction not found");

      const { wallet_id } = tx[0];

      // Update status sang 'deleted'
      await conn.execute(
        `UPDATE transaction SET status = 'deleted' WHERE id = ? AND user_id = ?`,
        [id, userId],
      );

      // Hoàn tác số dư: Nếu xóa khoản Thu -> Trừ tiền ví. Nếu xóa khoản Chi -> Cộng lại tiền vào ví.
      const updateBalanceSql = `
        UPDATE wallet SET balance = ? WHERE id = ? AND user_id = ?
      `;
      await conn.execute(updateBalanceSql, [
        newBackupBalance,
        wallet_id,
        userId,
      ]);

      await conn.commit();
      return {
        status: true,
        message: "Delete successfully",
      };
    } catch (error:any) {
      await conn.rollback();
       await LogService.write({
        message: `TransactionRepository.delete failed: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction_repo.delete.error',
        actorId: userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error("Delete Transaction Error:", error);
      return {
        status: false,
        message: "Delete failure",
      };
    } finally {
      conn.release();
    }
  }
}
