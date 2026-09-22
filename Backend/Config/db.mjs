import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host:'187.53.137.193',
  port: 3306,
  user: 'Alimenriko',
  password:'Enrikoalim@123',
  database:'task_manager'
});

console.log('Database MySQL terhubung dengan baik.');

export default db;