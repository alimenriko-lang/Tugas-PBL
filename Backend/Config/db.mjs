import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || '2qX8SasTD5z3Mjt.root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'BX8lEwt7VzDSEwOy',
  database: process.env.DB_NAME || 'task_manager',
  ssl: {
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
