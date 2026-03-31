import type{ IBudgetRepository } from "../../domain/models/application/repository/IBudgetRepo.js";
import type { GetBudgetsDTO, CreateBudgetDTO,DeleteBudgetDTO, UpdateBudgetDTO } from "../DTO/AppDTO.js";
import type { BudgetEntity } from "../../domain/entities/appEntities.js";
import type { Pool } from "mysql2/promise";
import { LogService } from "../../services/systemLogService.js";

export class BudgetRepository implements IBudgetRepository {
  constructor(private pool: Pool) {}

  async findByMonth(dto: GetBudgetsDTO, getRange?: {start:string,end:string}): Promise<BudgetEntity[]> {
    const { userId, month, year } = dto;

    let sql;
    const params: any[] = [];

    if(getRange){
      sql = `
      SELECT id, amount_limit AS amountLimit, budget_month AS date, category_id as categoryId from budget
      WHERE user_id = ? AND budget_month BETWEEN ? AND ? AND status != 'deleted'
      `
      params.push(userId, getRange?.start || `${year}-${month}-01`, getRange?.end || `${year}-${month}-31`);
    } else{

      sql = `
      SELECT 
        b.id,
        b.amount_limit   AS amountLimit,
        b.budget_month   AS date,
        b.status,
        c.id             AS categoryId,
        c.name           AS categoryName,
        c.icon_name      AS iconName,
        c.icon_color     AS iconColor,
        c.type           AS categoryType,
        t.id             AS transactionId,
        t.amount         AS transactionAmount
      FROM budget b
      JOIN category c ON b.category_id = c.id
      LEFT JOIN transaction t
        ON  t.category_id = b.category_id
        AND t.user_id     = b.user_id     
        AND MONTH(t.created_at) = ?
        AND YEAR(t.created_at)  = ?
        AND t.status = 'completed'        
      WHERE b.user_id = ?
        AND MONTH(b.budget_month) = ?
        AND YEAR(b.budget_month)  = ?
        AND b.status != 'deleted'
    `;

    params.push(month, year, userId, month, year);
  }

    const [rows]: any = await this.pool.execute(sql, params);

    // Gom nhóm transactions vào từng budget
    const budgetMap = new Map<string, BudgetEntity>();

    for (const row of rows) {
      if (!budgetMap.has(row.id)) {
        budgetMap.set(row.id, {
          id: row.id,
          amountLimit: row.amountLimit,
          date: row.date,
          status: row.status,
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          iconName: row.iconName,
          iconColor: row.iconColor,
          categoryType: row.categoryType,
          transactions: [],
        });
      }

      // Chỉ push nếu có transaction (LEFT JOIN có thể trả về null)
      if (row.transactionId) {
        budgetMap.get(row.id)!.transactions?.push({
          id: row.transactionId,
          amount: row.transactionAmount,
        });
      }
    }

    console.log("Budgets fetched from DB: ", Array.from(budgetMap.values()));

    return Array.from(budgetMap.values());
  }

  async create(dto: CreateBudgetDTO): Promise<boolean> {
    try {
      const { userId, categoryId, target, date, status } = dto;

      // Convert "03/2026" → "2026-03-01"
      const [month, year] = date.split('/');
      const yearMonth = `${year}-${month}-01`;

      const sql = `
        INSERT INTO budget (id, user_id, category_id, amount_limit, budget_month, status, last_access)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      const id = crypto.randomUUID();
      const [result]: any = await this.pool.execute(sql, [id, userId, categoryId, target, yearMonth, status]);


      return result.affectedRows > 0;
    } catch (error:any) {
        await LogService.write({
          message: `BudgetRepository.create failed: ${error.message}`,
          actor_type: 'system', type: 'error', status: 'failure',
          actionDetail: 'budget_repo.create.error',
          actorId: dto.userId,
          metaData: { error: error.message, stack: error.stack } as any,
        });
        console.error("Create budget at repo faile: ", error)
        return false
    }
  }

  async createMultiple(userId:string,budgets: any[]): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      if(budgets.length === 0) return false;

      for (const budget of budgets) {
        // Chuyển logic INSERT trực tiếp vào đây hoặc truyền connection vào hàm create
        const [month, year] = budget.date.split('/');
        const yearMonth = `${year}-${month}-01`;
        const id = crypto.randomUUID();

        const sql = `
          INSERT INTO budget (id, user_id, category_id, amount_limit, budget_month, status, last_access)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        const [res]: any = await connection.execute(sql, [
          id, userId, budget.categoryId, budget.target, yearMonth, budget.status
        ]);

        if (res.affectedRows === 0) {
          throw new Error("Một bản ghi không thể tạo");
        }
      }

      await connection.commit(); // Thành công tất cả thì mới lưu vào DB
      return true;

    } catch (error:any) {
      await LogService.write({
        message: `BudgetRepository.create-multiple failed: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget_repo.create-multiple.error',
        actorId: userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error("Create multiple budget at repo failed: ", error)
      return false
    }
  }

  async update(dto: UpdateBudgetDTO): Promise<boolean> {
    const { userId, budgetId, target } = dto;

    const sql = `
      UPDATE budget 
      SET amount_limit = ?, last_access = NOW()
      WHERE id = ? AND user_id = ?
    `;

    const [result]: any = await this.pool.execute(sql, [target, budgetId, userId]);
    return result.affectedRows > 0;
  }

  async delete(dto: DeleteBudgetDTO): Promise<boolean> {
    const { userId, budgetId } = dto;

    const sql = `UPDATE budget SET status = 'deleted' WHERE id = ? AND user_id = ?`;

    const [result]: any = await this.pool.execute(sql, [budgetId, userId]);
    return result.affectedRows > 0;
  }

  async findDuplicate(userId: string, categoryId: string, yearMonth: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) AS count FROM budget
      WHERE user_id = ? AND category_id = ? AND budget_month = ?
      AND status != 'deleted'
    `;

    const [rows]: any = await this.pool.execute(sql, [userId, categoryId, yearMonth]);
    return rows[0].count > 0;
  }
}