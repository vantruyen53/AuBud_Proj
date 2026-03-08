import mysql from "mysql2/promise";
import type { PoolOptions } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

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

pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

export default pool;