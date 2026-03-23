import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import mysql from "mysql2/promise";
import type { PoolOptions } from "mysql2/promise";
import { hashedPassword } from './bcrypt.js';
import dotenv from "dotenv";
import datetime from "./datetime.js";

dotenv.config();

async function seedAdmin() {
    const poolOptions: PoolOptions = {
      host: process.env.DB_HOST ?? 'localhost',
      user: process.env.DB_USER ?? 'root',
      port: parseInt(process.env.DB_PORT ?? '3307'),
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? '',
      waitForConnections: true,
      connectionLimit: 10,
      timezone: '+07:00',
      dateStrings: true,
    };
    
    const pool = mysql.createPool(poolOptions);

    //***************** ADMIN 1 ****************************
    // const name = "Nguyen Van Truyen"
    // const email = 'truyennguyen@aubud.com';
    // const passwordSHA256 = '424fd33289c7b03b55e4bccfcf9a493ff65f41860df074c375f8b17e70519b48'; //plaintext: A!B@C#D$E%xyz123*()
    // const userId = uuidv4();
    // const accountId = uuidv4()
    // const now = datetime();

    //***************** ADMIN 2 ****************************
    const name = "Pham Xuan Cung"
    const email = 'cungpham@aubud.com';
    const passwordSHA256 = '424fd33289c7b03b55e4bccfcf9a493ff65f41860df074c375f8b17e70519b48'; //plaintext: A!B@C#D$E%xyz123*()
    const userId = uuidv4();
    const accountId = uuidv4()
    const now = datetime();

    const passwordHash = await hashedPassword(passwordSHA256)

    const connection = await pool.getConnection();
    try{
        await connection.beginTransaction();

        const userSql = `INSERT INTO user (id, user_name, create_at, last_input) 
                      VALUES (?, ?, ?, ?)`;
        await connection.execute(userSql, [
            userId,
            name,
            now,
            now,
        ]);

        const accSql = `
            INSERT INTO account 
            (id, email, password, role, user_id, status, last_login, verified,
            salt, encrypted_secret_key_user, encrypted_secret_key_server, google_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await connection.execute(accSql, [
            accountId,
            email,
            passwordHash,
            'admin',
            userId,
            'active',
            now,
            1,
            '',
            '',
            '',
            '',
        ]);

        await connection.commit();

        console.log('✅ Tạo admin thành công!');
    }catch (error) {
      await connection.rollback();
      console.error("[Create] Error:", error);
      throw new Error("Could not create user account");
    } finally {
      connection.release();
      await pool.end();
      process.exit(0);
    }
}

