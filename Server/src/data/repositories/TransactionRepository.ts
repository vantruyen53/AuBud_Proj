import type { ITransactionRepository } from "../../domain/models/application/repository/ITransactionRepo.js";
import type {
  CreateTransactionDTO,
  TransactionQueryDTO,
  UpdateTransactionDTO,
} from "../DTO/AppDTO.js";
import type {
  ITransaction,
  ServerResult,
} from "../../domain/entities/appEntities.js";
import type { Pool } from "mysql2/promise";
import crypto from "crypto";

export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly pool: Pool) {}

  async find(
    userId: string,
    query: TransactionQueryDTO,
  ): Promise<ITransaction[]> {
    const { day, month, year, categoryId } = query;

    let sql = `
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
    const params: any[] = [userId];

    if (day && month && year) {
      sql += ` AND DATE(t.created_at) = ?`;
      params.push(`${year}-${month}-${day}`);
    } else if (month && year) {
      sql += ` AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?`;
      params.push(month, year);
    }
    // Lọc theo năm
    else if (year) {
      sql += ` AND YEAR(t.created_at) = ?`;
      params.push(year);
    }
    if (categoryId) {
      sql += ` AND t.category_id = ?`;
      params.push(categoryId);
    }

    sql += ` ORDER BY t.created_at DESC`;

    const [rows]: any = await this.pool.execute(sql, params);

    // Giả lập trả về data
    return rows as ITransaction[];
  }

  async create(userId: string,data: CreateTransactionDTO,newEncryptedBalance:string): Promise<ServerResult> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();

      const id = crypto.randomUUID();
      const insertSql = `
        INSERT INTO transaction (id, category_id, amount, user_id, wallet_id, created_at, note,budget_id, status, title, type)
        VALUES (?, ?, ?, ?, ?, ?, ?,?, 'completed', ?, ?)
      `;
      await conn.execute(insertSql, [
        id,
        data.categoryId,
        data.amount,
        userId,
        data.walletId,
        data.createdAt,
        data.note ?? null,
        data?.budgetId ?? null,
        data.title,
        data.type,
      ]);

      const updateBalanceSql = `
          UPDATE wallet SET balance = ? WHERE id = ? AND user_id = ?`;
      await conn.execute(updateBalanceSql, [newEncryptedBalance,data.walletId,userId]);

      const increaseCountCategorySql = `
          UPDATE category SET usageCount = usageCount + 1 
          WHERE id = ?
        `;
      await conn.execute(increaseCountCategorySql, [data.categoryId]);

      await conn.commit();
      return {
        status: true,
        message: "Add successfully",
      };
    } catch (error) {
      await conn.rollback();
      console.error("Create Transaction Error:", error);
      return {
        status: false,
        message: "Add failure",
      };
    } finally {
      conn.release();
    }
  }

  async update(
    userId: string,
    data: UpdateTransactionDTO,
  ): Promise<ServerResult> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      // 1. Lấy thông tin giao dịch CŨ để tính toán lại số dư ví
      const getOldTxSql = `
      SELECT t.amount, t.wallet_id, c.type 
      FROM transaction t
      JOIN category c ON t.category_id = c.id
      WHERE t.id = ? AND t.user_id = ? AND t.status = 'completed'
    `;
      const [oldRows]: any = await conn.execute(getOldTxSql, [data.id, userId]);

      if (oldRows.length === 0) throw new Error("Transaction not found");
      const oldTx = oldRows[0];

      //Merge data cũ + data mới (data mới override data cũ nếu có)
      const merged = {
        categoryId: data.categoryId ?? oldTx.category_id,
        amount: data.amount ?? oldTx.amount,
        walletId: data.walletId ?? oldTx.wallet_id,
        note: data.note ?? oldTx.note,
        title: data.title ?? oldTx.title,
        date: data.createdAt ?? oldTx.date,
      };

      // 2. HOÀN TÁC (UNDO) số dư ví cũ
      // Nếu cũ là Income -> Trừ lại tiền. Nếu cũ là Sending -> Cộng lại tiền.
      const undoBalanceSql = `
      UPDATE wallet SET balance = CASE 
        WHEN ? = 'income' THEN balance - ? 
        ELSE balance + ? 
      END WHERE id = ? AND user_id = ?
    `;
      await conn.execute(undoBalanceSql, [
        oldTx.type,
        oldTx.amount,
        oldTx.amount,
        oldTx.wallet_id,
        userId,
      ]);

      // 3. CẬP NHẬT thông tin giao dịch mới vào bảng transaction
      const updateSql = `
      UPDATE transaction 
      SET category_id = ?, amount = ?, wallet_id = ?, note = ?, title = ?, date = ?
      WHERE id = ? AND user_id = ?
    `;
      // Lưu ý: data.date ở đây nên là YYYY-MM-DD
      await conn.execute(updateSql, [
        merged.categoryId,
        merged.amount,
        merged.walletId,
        merged.note,
        merged.title,
        merged.date,
        data.id,
        userId,
      ]);

      // 4. ÁP DỤNG (APPLY) số dư ví mới
      // Lấy type của category mới để biết cộng hay trừ
      const [categoryRows]: any = await conn.execute(
        `SELECT type FROM category WHERE id = ?`,
        [merged.categoryId],
      );
      const newType = categoryRows[0].type;

      const applyBalanceSql = `
      UPDATE wallet SET balance = CASE 
        WHEN ? = 'income' THEN balance + ? 
        ELSE balance - ? 
      END WHERE id = ? AND user_id = ?
    `;
      await conn.execute(applyBalanceSql, [
        newType,
        data.amount,
        data.amount,
        data.walletId,
        userId,
      ]);

      await conn.commit();
      return {
        status: true,
        message: "Update successfully",
      };
    } catch (error) {
      await conn.rollback();
      console.error("Update Transaction Error:", error);
      return {
        status: false,
        message: "Update failure",
      };
    } finally {
      conn.release();
    }
  }

  async delete(userId: string, id: string, newBackupBalance:string): Promise<ServerResult> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();

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
    } catch (error) {
      await conn.rollback();
      console.error("Delete Transaction Error:", error);
      return {
        status: false,
        message: "Delete failure",
      };
    } finally {
      conn.release();
    }
  }

  // ... triển khai các hàm khác tương tự
}
