import pool from "../../config/dbConfig.js";

export const usageStatsRepository = {

  // gọi từ chat.service — mỗi khi user gửi prompt
  async incrementPrompt(): Promise<void> {
    await pool.query(`
      INSERT INTO usage_stats (date, total_prompt, total_manual)
      VALUES (CURDATE(), 1, 0)
      ON DUPLICATE KEY UPDATE total_prompt = total_prompt + 1
    `);
  },

  // gọi từ các service có sẵn — mỗi khi user thao tác thủ công
  async incrementManual(): Promise<void> {
    await pool.query(`
      INSERT INTO usage_stats (date, total_prompt, total_manual)
      VALUES (CURDATE(), 0, 1)
      ON DUPLICATE KEY UPDATE total_manual = total_manual + 1
    `);
  },

  // gọi từ admin dashboard
  // stats/usage-stats.repository.ts

  // dùng cho Chart 2 — column chart, data theo từng ngày
  async getDailyPromptStats(days: 7 | 30): Promise<{
    date: string;
    total_prompt: number;
  }[]> {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        total_prompt
      FROM usage_stats
      WHERE date >= CURDATE() - INTERVAL ? DAY
      ORDER BY date ASC
    `, [days]);

    return rows as any[];
  },

  // dùng cho Chart 1 — donut chart, tổng gộp cả kỳ
  async getTotalRatio(days: 7 | 30): Promise<{
    total_manual: number;
    total_prompt: number;
  }> {
    const [rows] = await pool.query(`
      SELECT
        SUM(total_manual) AS total_manual,
        SUM(total_prompt) AS total_prompt
      FROM usage_stats
      WHERE date >= CURDATE() - INTERVAL ? DAY
    `, [days]);

    const row = (rows as any[])[0];

    return {
      total_manual: Number(row.total_manual ?? 0),
      total_prompt: Number(row.total_prompt ?? 0),
    };
  },
};