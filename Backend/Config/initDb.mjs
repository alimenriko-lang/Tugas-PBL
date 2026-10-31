import db from './db.mjs';

export const initDatabase = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NULL,
        auth_provider VARCHAR(50) DEFAULT 'local',
        provider_id VARCHAR(255) NULL,
        avatar_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_token VARCHAR(255) NULL,
        reset_token_expires TIMESTAMP NULL
      )
    `);

    // Tambahkan kolom jika tabel users sudah ada sebelumnya
    try {
      await db.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local'`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255) NULL`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP NULL`);
    } catch (_) {
      // Abaikan jika database engine tidak mendukung ADD COLUMN IF NOT EXISTS
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS task (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        category VARCHAR(100) DEFAULT 'Work Project',
        due_date DATE NULL,
        due_time VARCHAR(20) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tambahkan kolom jika tabel task sudah ada sebelumnya
    try {
      await db.query(`ALTER TABLE task ADD COLUMN IF NOT EXISTS due_time VARCHAR(20) NULL`);
    } catch (_) {
      // Abaikan jika database engine tidak mendukung ADD COLUMN IF NOT EXISTS
    }

    // Tabel pesan kontak dari Landing Page
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        email_sent_to_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables verified/initialized.');
  } catch (error) {
    console.error('Warning: Failed to auto-initialize database tables:', error.message);
  }
};
