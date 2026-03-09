import { User, Account, UserRefresh } from "../../../domain/entities/authEntities.js";
import type { IUserRepository } from "../../../domain/models/auth/IUserRepository.js";
import type { Pool, PoolConnection } from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";
import {ServerResult} from '../../../domain/entities/appEntities.js';

/**
 * @param offset  - bắt đầu từ dòng thứ mấy
 * @param limit   - lấy bao nhiêu dòng mỗi batch (mặc định 100)
 */

export default class UserRepositoris implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async create(user: User, account: Account): Promise<void> {
    console.log("[Create] user:", JSON.stringify(user));      
   console.log("[Create] account:", JSON.stringify(account));
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const userSql = `INSERT INTO user (id, user_name, create_at, last_input) 
                      VALUES (?, ?, ?, ?)`;
      await connection.execute(userSql, [
        user.id,
        user.userName,
        user.createdAt,
        user.lastInput,
      ]);

      const accSql = `
        INSERT INTO account 
          (id, email, password, role, user_id, status, last_login, verified,
          salt, encrypted_secret_key_user, encrypted_secret_key_server, google_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await connection.execute(accSql, [
        account.id,
        account.email,
        account.passwordHash,
        account.role,
        account.userId,
        account.status,
        account.lastLogin,
        account.verified,
        account.salt,
        account.encryptedSecretKey_user,
        account.encryptedSecretKey_server,
        account.googleId ?? null,
      ]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("[Create] Error:", error); // ← thêm
      throw new Error("Could not create user account");
    } finally {
      connection.release();
    }
  }

  async findByEmail(email: string): Promise<any | null> {
    const sql = `
        SELECT a.*, u.user_name 
        FROM account a
        INNER JOIN user u ON a.user_id = u.id
        WHERE a.email = ? LIMIT 1
    `;
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [email]);

    if (rows.length === 0) return null;

    const data = rows[0];
    if (data) {
        const account = new Account(
            data.id,
            data.email,
            data.password,
            data.role,
            data.user_id,
            data.status,
            data.verified,
            data.last_login,
            data.salt,
            data.encrypted_secret_key_user,  
            data.encrypted_secret_key_server,
            data.google_id
        );
        (account as any).userName = data.user_name;
        return account;
    }
    return null;
  }

  async findById(id: string): Promise<UserRefresh | null> {
    const sql = `SELECT a.user_id as userId, u.user_name AS userName, a.role, a.email
                  FROM account a INNER JOIN user u ON a.user_id = u.id
                  WHERE a.user_id = ? LIMIT 1`;
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [id]);

    if (rows.length === 0) return null;

    const data = rows[0];
    if (data)
      return new UserRefresh(data.userId, data.userName, data.email, data.role);
    else return null;
  }

  async getEncryptedSecretKeyServerByEmail(
    email: string,
  ): Promise<string | null> {
    const sql = `SELECT encrypted_secret_key_server FROM account WHERE email = ? LIMIT 1`;
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [email]);
    if (rows.length === 0) return null;
    if (rows[0]) return rows[0].encrypted_secret_key_server || null;
    else return null;
  }

  async updateAccountStatus(id: string, status: string): Promise<void> {
    const sql = `UPDATE account SET status = ? WHERE id = ?`;
    await this.pool.execute(sql, [status, id]);
  }

  async verifyAcc(email: string): Promise<boolean> {
    try {
      const sql = `UPDATE account SET verified = true WHERE email = ?`;
      await this.pool.execute(sql, [email]);
      return true;
    } catch (err) {
      console.log("User repository verify acc error: ", err);
      return false;
    }
  }

  async updatePasswordAndEncryptedSecretKeyUser(
    email: string,
    newPasswordHash: string,
    newEncryptedSecretKeyUser: string,
    newSalt: string,
  ): Promise<ServerResult> {
    try {
      const sql = `UPDATE account SET password = ?, encrypted_secret_key_user  = ?, salt = ? WHERE email = ?`;
      await this.pool.execute(sql, [
        newPasswordHash,
        newEncryptedSecretKeyUser,
        newSalt,
        email,
      ]);
      return new ServerResult(
        true,
        "Cập nhật mật khẩu và encrypted secret key user thành công",
      );
    } catch (err) {
      return new ServerResult(false, `Cập nhật mật khẩu thất bại: ${err}`);
    }
  }

  async findByGoogleId(googleId: string): Promise<Account | null> {
    const sql = `SELECT * FROM account WHERE google_id = ? LIMIT 1`;
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [googleId]);
    if (rows.length === 0) return null;

    const data = rows[0];
    if (data)
      return new Account(
        data.id,
        data.email,
        data.password,
        data.role,
        data.user_id,
        data.status,
        data.verified,
        data.last_login,
        data.public_key,
        data.encrypted_private_key,
        data.google_id,
      );
    else return null;
  }

  async linkGoogleId(accountId: string, googleId: string): Promise<void> {
    const sql = `UPDATE account SET google_id = ? WHERE id = ?`;
    await this.pool.execute(sql, [googleId, accountId]);
  }

  async checkUserRole(userId: string): Promise<string | null> {
    // Truy vấn vào bảng account dựa trên user_id
    const sql = `SELECT role FROM account WHERE user_id = ? LIMIT 1`;
    const [rows]: any = await this.pool.execute(sql, [userId]);
    return rows.length > 0 ? rows[0].role : null;
  }

  async updateLastLogin(userId:string){
    const dateTime = new Date();
    try{
      const updateSql = `UPDATE account SET last_login = ?  WHERE user_id = ?`
      await this.pool.execute(updateSql, [dateTime, userId])
      return true
    } catch (err){
      console.error(err)
      return false
    }
  }
  
  async updateLastInput(userId:string, conn?: PoolConnection){
    const dateTime = new Date();
    try{
      const updateSql = `UPDATE user SET last_input = ?  WHERE id = ?`
      const executor = conn ?? this.pool;
      await executor.execute(updateSql, [dateTime, userId])
    } catch (err: any){
      console.error(err)
      throw new Error(err)
    }
  }

  async getUsersWithNoInputToday(offset: number,limit: number = 100 ): 
    Promise<{ userId: string; email: string; userName: string }[]>{

      const querySql = `SELECT a.user_id AS userId, a.email, u.user_name AS userName
          FROM account a 
          INNER JOIN user u ON
          a.user_id = u.id
          WHERE a.status != 'ban' AND verified = 1 AND (u.last_input IS NULL OR u.last_input < CURDATE() )
          LIMIT ? OFFSET ?
        `
      const [rows] = await this.pool.execute<RowDataPacket[]>(querySql, [limit, offset]);

      return rows as { userId: string; email: string; userName: string }[];
  }

  // repo — thêm method mới
  async updateKeyBundle(
    userId: string,
    salt: string,
    encryptedSecretKey_user: string,
    encryptedSecretKey_server: string,
  ): Promise<void> {
    const sql = `
      UPDATE account 
      SET salt = ?, encrypted_secret_key_user = ?, encrypted_secret_key_server = ?
      WHERE user_id = ?
    `;
    await this.pool.execute(sql, [salt, encryptedSecretKey_user, encryptedSecretKey_server, userId]);
  }
}
