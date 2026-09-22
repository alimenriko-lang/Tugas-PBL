import db from '../Config/db.mjs';

const mapStatusToDb = (status) => {
  const value = String(status || 'pending').trim().toLowerCase();
  if (value === 'in_progress' || value === 'in progress') return 'In Progress';
  if (value === 'completed') return 'Completed';
  return 'Pending';
};

const mapPriorityToDb = (priority) => {
  const value = String(priority || 'medium').trim().toLowerCase();
  if (value === 'high') return 'High';
  if (value === 'low') return 'Low';
  return 'Medium';
};

const normalizeStatus = (status) => {
  const value = String(status || 'Pending').trim();
  if (value === 'In Progress') return 'in_progress';
  if (value === 'Completed') return 'completed';
  if (value === 'Pending') return 'pending';
  return value.toLowerCase();
};

const normalizePriority = (priority) => {
  const value = String(priority || 'Medium').trim();
  if (value === 'High') return 'high';
  if (value === 'Low') return 'low';
  return 'medium';
};

const normalizeTask = (task) => ({
  ...task,
  status: normalizeStatus(task.status),
  priority: normalizePriority(task.priority),
});

const Task = {
  getAllByUser: async (userId, filters = {}) => {
    let query = 'SELECT * FROM task WHERE user_id = ?';
    const params = [userId];

    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const searchTerm = `%${String(filters.search).trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters.status && filters.status !== 'all') {
      query += ' AND status = ?';
      params.push(mapStatusToDb(filters.status));
    }

    if (filters.priority && filters.priority !== 'all') {
      query += ' AND priority = ?';
      params.push(mapPriorityToDb(filters.priority));
    }

    if (filters.category && filters.category !== 'all') {
      query += ' AND category = ?';
      params.push(String(filters.category));
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    return rows.map(normalizeTask);
  },

  getById: async (id, userId) => {
    const [rows] = await db.query('SELECT * FROM task WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
    return rows[0] ? normalizeTask(rows[0]) : null;
  },

  getStatsByUser: async (userId) => {
    const [rows] = await db.query('SELECT * FROM task WHERE user_id = ?', [userId]);
    const tasks = rows.map(normalizeTask);

    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === 'pending').length,
      in_progress: tasks.filter((task) => task.status === 'in_progress').length,
      completed: tasks.filter((task) => task.status === 'completed').length,
    };
  },

  createTask: async (userId, data) => {
    const {
      title,
      description = '',
      priority = 'medium',
      status = 'pending',
      category = 'Work Project',
      due_date = null,
    } = data;

    const [result] = await db.query(
      'INSERT INTO task (user_id, title, description, status, priority, category, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        String(title).trim(),
        String(description || ''),
        mapStatusToDb(status),
        mapPriorityToDb(priority),
        String(category || 'Work Project'),
        due_date || null,
      ]
    );

    return result.insertId;
  },

  update: async (id, userId, data) => {
    const currentTask = await Task.getById(id, userId);
    if (!currentTask) return 0;

    const merged = {
      ...currentTask,
      ...data,
    };

    const title = String(merged.title ?? currentTask.title).trim();
    const description = String(merged.description ?? currentTask.description ?? '');
    const priority = merged.priority ?? currentTask.priority;
    const status = merged.status ?? currentTask.status;
    const category = String(merged.category ?? currentTask.category ?? 'Work Project');
    const due_date = merged.due_date ?? currentTask.due_date ?? null;

    const [result] = await db.query(
      'UPDATE task SET title = ?, description = ?, priority = ?, status = ?, category = ?, due_date = ? WHERE id = ? AND user_id = ?',
      [
        title,
        description,
        mapPriorityToDb(priority),
        mapStatusToDb(status),
        category,
        due_date || null,
        id,
        userId,
      ]
    );

    return result.affectedRows;
  },

  delete: async (id, userId) => {
    const [result] = await db.query('DELETE FROM task WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows;
  },
};

export default Task;