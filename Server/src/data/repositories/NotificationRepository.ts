// data/repository/NotificationRepository.ts
import { v4 as uuidv4 } from "uuid";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../../config/dbConfig.js";
import type { INotification } from "../../domain/entities/appEntities.js";

// ------------------------------------------------------------------ helpers --
// Map raw DB row → INotification (camelCase)
function mapRow(row: RowDataPacket): INotification {
  return {
    id: row.id,
    userId: row.for_user_id,
    type: row.type,
    title: row.title,
    description: row.contents,
    time: row.time instanceof Date 
      ? row.time.toISOString()
      : String(row.time),
    isRead: row.is_read === 1 || row.is_read === true,
    metadata: row.metadata
      ? (typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata) 
      : null,
  };
}

// -------------------------------------------------------------------- class --
export class NotificationRepository {
  /**
   * Lưu một notification mới vào DB.
   * Trả về notification vừa tạo (đã có id và time).
   */
  async create(params: { 
    userId: string;
    type: string;
    title: string;
    description: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<INotification> {
    const id = uuidv4();
    const now = new Date();

    try{
      const sql = `
        INSERT INTO notification
          (id, for_user_id, type, title, contents, is_read, create_at, metadata)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `;

      await pool.execute<ResultSetHeader>(sql, [
        id,
        params.userId,
        params.type,
        params.title,
        params.description,
        now,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]);

      return {
        id,
        userId: params.userId,
        type: params.type,
        title: params.title,
        description: params.description,
        time: now.toISOString(),
        isRead: false,
        metadata: params.metadata ?? null,
      };
    } catch(err:any){
      console.error("[In-app Repo] Error: ", err.message)
      return {id,
        userId: params.userId ??"error id",
        type: params.type ??"error type",
        title: params.title ??"error title",
        description: params.description ??"error description",
        time: now.toISOString() ??"error time",
        isRead: false ,
        metadata: params.metadata ?? {error:"error metadata"},}
    }
  }

  /**
   * Lấy tất cả notification của một user, mới nhất trước.
   */
  async findByUserId(userId: string): Promise<INotification[]> {
    const sql = `
      SELECT id, for_user_id, type, title, contents, is_read, create_at as time, metadata
      FROM notification
      WHERE for_user_id = ?
      ORDER BY create_at DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);


    return rows.map(mapRow);
  }

  /**
   * Đánh dấu một notification là đã đọc.
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const sql = `
      UPDATE notification
      SET is_read = 1
      WHERE id = ? AND for_user_id = ?
    `;
    const [result] = await pool.execute<ResultSetHeader>(sql, [
      notificationId,
      userId,
    ]);
    return result.affectedRows > 0;
  }

  /**
   * Đánh dấu TẤT CẢ notification của user là đã đọc.
   */
  async markAllAsRead(userId: string): Promise<number> {
    const sql = `
      UPDATE notification
      SET is_read = 1
      WHERE for_user_id = ? AND is_read = 0
    `;
    const [result] = await pool.execute<ResultSetHeader>(sql, [userId]);
    return result.affectedRows;
  }

  /**
   * Đếm số notification chưa đọc của user (dùng cho badge trên app).
   */
  async countUnread(userId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) AS total
      FROM notification
      WHERE for_user_id = ? AND is_read = 0
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
    return rows[0]?.total ?? 0;
  }
}