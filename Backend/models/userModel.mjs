import db from '../Config/db.mjs';

const Users = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM users ORDER BY id DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  getByEmail: async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { name, email, password } = data;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [String(name).trim(), String(email).trim().toLowerCase(), password]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { name, email, password } = data;
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
      [String(name).trim(), String(email).trim().toLowerCase(), password, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

export default Users;