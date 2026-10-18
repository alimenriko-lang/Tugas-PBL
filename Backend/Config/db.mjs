import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Enrikoalim123',
  database: process.env.DB_NAME || 'task_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;