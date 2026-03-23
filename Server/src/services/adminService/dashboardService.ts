import { type Pool } from "mysql2/promise";
import { LogService } from "../systemLogService.js";

interface SystemStats {
  totalUser: number;
  activeToday: number;
  activeYesterday: number;
  newThisMonth: number;
  newPrevMonth: number;
}

interface DailyActive {
  day: string;
  users: number;
}

interface TransactionInputStat {
  type: "user" | "bot";
  value: number;
}

interface AIUsage {
  day: string;
  value: number;
}

export class DashBoardService {
  constructor(private pool: Pool) {}

  async getSystemStats(): Promise<SystemStats> {
    try {
      // Tổng user (không tính deleted)
      const [totalRows]: any = await this.pool.execute(`
        SELECT COUNT(*) AS total 
        FROM account 
        WHERE status != 'deleted' AND role = 'user' AND verified = 1
      `);

      // Active hôm nay và hôm qua — dùng last_login từ bảng account
      const [activeRows]: any = await this.pool.execute(`
        SELECT
          SUM(CASE WHEN DATE(last_login) = CURDATE() THEN 1 ELSE 0 END) AS activeToday,
          SUM(CASE WHEN DATE(last_login) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS activeYesterday
        FROM account
        WHERE status != 'deleted' AND role = 'user'
      `);

      // New user tháng này và tháng trước — dùng created_at từ bảng user
      const [newUserRows]: any = await this.pool.execute(`
        SELECT
          SUM(CASE WHEN 
            YEAR(create_at) = YEAR(CURDATE()) AND 
            MONTH(create_at) = MONTH(CURDATE()) 
          THEN 1 ELSE 0 END) AS newThisMonth,
          SUM(CASE WHEN 
            YEAR(create_at) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND 
            MONTH(create_at) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
          THEN 1 ELSE 0 END) AS newPrevMonth
        FROM user
      `);

      return {
        totalUser: Number(totalRows[0].total ?? 0),
        activeToday: Number(activeRows[0].activeToday ?? 0),
        activeYesterday: Number(activeRows[0].activeYesterday ?? 0),
        newThisMonth: Number(newUserRows[0].newThisMonth ?? 0),
        newPrevMonth: Number(newUserRows[0].newPrevMonth ?? 0),
      };
    } catch (error:any) {
       await LogService.write({
        message: `getSystemStats error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'admin.dashboard.stats.error',
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error("[DashBoard] getSystemStats error:", error);
      return {
        totalUser: 0,
        activeToday: 0,
        activeYesterday: 0,
        newThisMonth: 0,
        newPrevMonth: 0,
      };
    }
  }

  // month: "03", year: "2026", period: "7D" | "30D"
  async getDailyActive(
    month: string,
    year: string,
    period: "7D" | "30D"
  ): Promise<DailyActive[]> {
    try {
      const isCurrentMonth =
        parseInt(month) === new Date().getMonth() + 1 &&
        parseInt(year) === new Date().getFullYear();

      let sql: string;
      let params: any[];

      if (isCurrentMonth) {
        // Rolling từ hôm nay ngược về
        const days = period === "7D" ? 6 : 29;
        sql = `
          SELECT 
            DATE_FORMAT(y_m_d, '%Y-%m-%d') AS day,
            traffic_count AS users
          FROM traffic
          WHERE y_m_d BETWEEN CURDATE() - INTERVAL ? DAY AND CURDATE()
          ORDER BY y_m_d ASC
        `;
        params = [days];
      } else {
        // Toàn bộ tháng được chọn
        sql = `
          SELECT 
            DATE_FORMAT(y_m_d, '%Y-%m-%d') AS day,
            traffic_count AS users
          FROM traffic
          WHERE MONTH(y_m_d) = ? AND YEAR(y_m_d) = ?
          ORDER BY y_m_d ASC
        `;
        params = [parseInt(month), parseInt(year)];
      }

      const [rows]: any = await this.pool.execute(sql, params);

      // Fill những ngày thiếu với value = 0
      return this.fillMissingDays(rows, month, year, period, isCurrentMonth);
    } catch (error:any) {
       await LogService.write({
        message: `getDailyActive error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'admin.dashboard.daily_active.error',
        metaData: { error: error.message, stack: error.stack, month, year, period } as any,
      });
      console.error("[DashBoard] getDailyActive error:", error);
      return [];
    }
  }

  // month: "03", year: "2026", period: "1D" | "7D" | "30D"
  async getTransactionInput(
    month: string,
    year: string,
    period: "1D" | "7D" | "30D"
  ): Promise<TransactionInputStat[]> {
    try {
      const isCurrentMonth =
        parseInt(month) === new Date().getMonth() + 1 &&
        parseInt(year) === new Date().getFullYear();

      let sql: string;
      let params: any[];

      if (isCurrentMonth) {
        if (period === "1D") {
          sql = `
            SELECT
              SUM(total_manual) AS total_manual,
              SUM(total_prompt) AS total_prompt
            FROM usage_stats
            WHERE date = CURDATE()
          `;
          params = [];
        } else {
          const days = period === "7D" ? 6 : 29;
          sql = `
            SELECT
              SUM(total_manual) AS total_manual,
              SUM(total_prompt) AS total_prompt
            FROM usage_stats
            WHERE date BETWEEN CURDATE() - INTERVAL ? DAY AND CURDATE()
          `;
          params = [days];
        }
      } else {
        // Toàn bộ tháng được chọn
        sql = `
          SELECT
            SUM(total_manual) AS total_manual,
            SUM(total_prompt) AS total_prompt
          FROM usage_stats
          WHERE MONTH(date) = ? AND YEAR(date) = ?
        `;
        params = [parseInt(month), parseInt(year)];
      }

      const [rows]: any = await this.pool.execute(sql, params);
      const row = rows[0];

      return [
        { type: "user", value: Number(row.total_manual ?? 0) },
        { type: "bot", value: Number(row.total_prompt ?? 0) },
      ];
    } catch (error:any) {
      await LogService.write({
        message: `getTransactionInput error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'admin.dashboard.transaction_input.error',
        metaData: { error: error.message, stack: error.stack, month, year, period } as any,
      });
      console.error("[DashBoard] getTransactionInput error:", error);
      return [
        { type: "user", value: 0 },
        { type: "bot", value: 0 },
      ];
    }
  }

  // month: "03", year: "2026", period: "7D" | "30D"
  async getAIUsage(
    month: string,
    year: string,
    period: "7D" | "30D"
  ): Promise<AIUsage[]> {
    try {
      const isCurrentMonth =
        parseInt(month) === new Date().getMonth() + 1 &&
        parseInt(year) === new Date().getFullYear();

      let sql: string;
      let params: any[];

      if (isCurrentMonth) {
        const days = period === "7D" ? 6 : 29;
        sql = `
          SELECT
            DATE_FORMAT(date, '%Y-%m-%d') AS day,
            total_prompt AS value
          FROM usage_stats
          WHERE date BETWEEN CURDATE() - INTERVAL ? DAY AND CURDATE()
          ORDER BY date ASC
        `;
        params = [days];
      } else {
        sql = `
          SELECT
            DATE_FORMAT(date, '%Y-%m-%d') AS day,
            total_prompt AS value
          FROM usage_stats
          WHERE MONTH(date) = ? AND YEAR(date) = ?
          ORDER BY date ASC
        `;
        params = [parseInt(month), parseInt(year)];
      }

      const [rows]: any = await this.pool.execute(sql, params);

      return this.fillMissingDaysAI(rows, month, year, period, isCurrentMonth);
    } catch (error:any) {
      await LogService.write({
        message: `getAIUsage error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'admin.dashboard.ai_usage.error',
        metaData: { error: error.message, stack: error.stack, month, year, period } as any,
      });
      console.error("[DashBoard] getAIUsage error:", error);
      return [];
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;  // "2026-01-31"
    }

  // Fill ngày thiếu với value = 0 cho DailyActive
  private fillMissingDays(
    rows: { day: string; users: number }[],
    month: string,
    year: string,
    period: "7D" | "30D",
    isCurrentMonth: boolean
    ): DailyActive[] {
    const map = new Map(rows.map((r) => [r.day, r.users]));
    const result: DailyActive[] = [];

    const { start, end } = this.getDateRange(month, year, period, isCurrentMonth);
    const current = new Date(start);

    while (current <= end) {
        const key = this.formatDate(current);  // ✅ dùng local time
        result.push({ day: key, users: map.get(key) ?? 0 });
        current.setDate(current.getDate() + 1);
    }

    return result;
    }

  // Fill ngày thiếu với value = 0 cho AIUsage
  private fillMissingDaysAI(
    rows: { day: string; value: number }[],
    month: string,
    year: string,
    period: "7D" | "30D",
    isCurrentMonth: boolean
    ): AIUsage[] {
    const map = new Map(rows.map((r) => [r.day, r.value]));
    const result: AIUsage[] = [];

    const { start, end } = this.getDateRange(month, year, period, isCurrentMonth);
    const current = new Date(start);

    while (current <= end) {
        const key = this.formatDate(current);  // ✅ dùng local time
        result.push({ day: key, value: map.get(key) ?? 0 });
        current.setDate(current.getDate() + 1);
    }

    return result;
    }

  // Tính start/end date dựa theo period và tháng được chọn
  private getDateRange(
    month: string,
    year: string,
    period: "7D" | "30D",
    isCurrentMonth: boolean
    ): { start: Date; end: Date } {
    const today = new Date();

    if (isCurrentMonth) {
        const days = period === "7D" ? 6 : 29;
        const start = new Date(today);
        start.setDate(today.getDate() - days);
        return { start, end: today };
    } else {
        const y = parseInt(year);
        const m = parseInt(month);
        const start = new Date(y, m - 1, 1);              // ngày 1 của tháng
        const end = new Date(y, m, 0);                     // ✅ ngày cuối của tháng
        return { start, end };
    }
    }
}