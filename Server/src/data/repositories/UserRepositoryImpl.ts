import { User, Account } from "../../domain/entities/authEntities.js";
import type { IUserRepository } from "../../domain/interfaces/auth/IUserRepository.js";
import type { Pool } from "mysql2/promise";
import type {RowDataPacket } from "mysql2/promise";
import { ServerResult } from "../../domain/entities/authEntities.js";


export default class UserRepositoris implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async create(user: User, account: Account): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const userSql = `INSERT INTO user (id, user_name, create_at, last_input) VALUES (?, ?, ?, ?)`;
      await connection.execute(userSql, [user.id, user.userName, user.createdAt, user.lastInput]);

      const accSql = `
        INSERT INTO account (id, email, password, role, user_id, status, last_login, verified, public_key, encryptedPrivateKey) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(accSql, [
        account.id, 
        account.email, 
        account.passwordHash, 
        account.role, 
        user.id, 
        account.status, 
        account.lastLogin, 
        account.verified,
        account.publicKey, // Nhận từ Client
        account.encryptedPrivateKey // Nhận từ Client
      ]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi Transaction tại UserRepository:", error);
      throw new Error("Could not create user account");
    } finally {
      connection.release();
    }
  }

  async findByEmail(email: string): Promise<Account | null> {
    const sql = `SELECT * FROM account WHERE email = ? LIMIT 1`;
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [email]);

    if (rows.length === 0) return null;

    const data = rows[0];
    // Map ngược lại từ DB sang Entity Account
    if(data)
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
        data.encrypted_private_key
      );
    else 
      return null;
  }

  async findById(id: string): Promise<User | null> {
    const sql = `SELECT * FROM user WHERE id = ? LIMIT 1`;
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [id]);

    if (rows.length === 0) return null;

    const data = rows[0];
    if(data)
      return new User(data.id, data.user_name, data.create_at, data.last_input);
    else return null;
  }

  async updateAccountStatus(id: string, status: string): Promise<void> {
    const sql = `UPDATE account SET status = ? WHERE id = ?`;
    await this.pool.execute(sql, [status, id]);
  }

  async verifyAcc(email:string):Promise<boolean>{
    try{
      const sql =`UPDATE account SET verified = true WHERE email = ?`;
      await this.pool.execute(sql, [email])
      return true;
    } catch(err){
      console.log('User repository verify acc error: ', err)
      return false;
    }

  }

  async updatePassword(email: string, newPasswordHash: string): Promise<ServerResult> {
    try{
      const sql = `UPDATE account SET password = ? WHERE email = ?`;
      await this.pool.execute(sql, [newPasswordHash, email]);
      return new ServerResult(true, "Cập nhật mật khẩu thành công");
    } catch(err){
      return new ServerResult(false, `Cập nhật mật khẩu thất bại: ${err}`);
    }
  }

  async findByGoogleId(googleId: string): Promise<Account | null> {
    const sql = `SELECT * FROM account WHERE google_id = ? LIMIT 1`;
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [googleId]);
    if (rows.length === 0) return null;

    const data = rows[0];
    if(data)
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
}
