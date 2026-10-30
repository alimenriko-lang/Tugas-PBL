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

  getByProviderId: async (provider, providerId) => {
    if (!provider || !providerId) return null;
    const [rows] = await db.query(
      'SELECT * FROM users WHERE auth_provider = ? AND provider_id = ? LIMIT 1',
      [provider, String(providerId)]
    );
    return rows[0] || null;
  },

  create: async (data) => {
    const { name, email, password } = data;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, auth_provider) VALUES (?, ?, ?, "local")',
      [String(name).trim(), String(email).trim().toLowerCase(), password]
    );
    return result.insertId;
  },

  createOAuthUser: async (data) => {
    const { name, email, auth_provider, provider_id, avatar_url } = data;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, auth_provider, provider_id, avatar_url) VALUES (?, ?, NULL, ?, ?, ?)',
      [
        String(name || '').trim(),
        String(email || '').trim().toLowerCase(),
        auth_provider,
        String(provider_id),
        avatar_url || null,
      ]
    );
    return result.insertId;
  },

  linkOAuthProvider: async (id, data) => {
    const { auth_provider, provider_id, avatar_url } = data;
    const [result] = await db.query(
      'UPDATE users SET auth_provider = ?, provider_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [auth_provider, String(provider_id), avatar_url || null, id]
    );
    return result.affectedRows;
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

  deleteWithTasks: async (id) => {
    try {
      await db.query('DELETE FROM task WHERE user_id = ?', [id]);
    } catch (_) {}
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },

  updateProfile: async (id, data) => {
    const { name } = data;
    const [result] = await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [String(name).trim(), id]
    );
    return result.affectedRows;
  },

  updatePassword: async (id, hashedPassword) => {
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows;
  },

  setResetToken: async (email, token, expiresInMinutes = 15) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const [result] = await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE email = ?',
      [token, Number(expiresInMinutes) || 15, normalizedEmail]
    );
    return result.affectedRows;
  },

  getByResetToken: async (token) => {
    if (!token) return null;
    const [rows] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1',
      [String(token).trim()]
    );
    return rows[0] || null;
  },

  updatePasswordAndClearResetToken: async (id, hashedPassword) => {
    const [result] = await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows;
  },
};

export default Users;
