import type { ITokenRepository } from "../../../domain/models/auth/ITokenRepository.js";
import pool from "../../../config/dbConfig.js";
import type { RowDataPacket } from "mysql2";
import {ServerResult} from '../../../domain/entities/appEntities.js';

export default class TokenRepositoryImpl implements ITokenRepository {
  async saveToken(
    id: string,
    tokenHash: string,
    userId: string,
    expiresAt: Date,
    deviceInfo: string,
  ): Promise<void> {
    const sql = `
      INSERT INTO token (id, token_hash, user_id, expires_at, device_info, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await pool.execute(sql, [id, tokenHash, userId, expiresAt, deviceInfo]);
  }

  async deleteToken(tokenHash: string): Promise<ServerResult> {
    try {
      const sql = `DELETE FROM token WHERE token_hash = ?`;
      await pool.execute(sql, [tokenHash]);
      return new ServerResult(true, "Logout successful, token revoked");
    } catch (err) {
      return new ServerResult(false, `Delete token errore: ${err}`);
    }
  }

  async findByHash(tokenHash: string): Promise<any | null> {
    const sql = `SELECT * FROM token WHERE token_hash = ? LIMIT 1`;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [tokenHash]);

    if (rows.length === 0) return null;
    return rows[0];
  }

  async findLastDeviceByUserId(userId: string): Promise<string | null> {
    // Lấy session gần nhất của user, trừ session vừa tạo
    const sql = `
    SELECT device_info FROM token 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1 OFFSET 1
  `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
    return rows[0]?.device_info ?? null;
  }
}
