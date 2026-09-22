import Task from '../models/taskModel.mjs';

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.getAllByUser(req.user.id, req.query);
    return res.status(200).json({ tasks, total: tasks.length });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil daftar task.', error: error.message });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.getStatsByUser(req.user.id);
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil statistik task.', error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.getById(req.params.id, req.user.id);

    if (!task) {
      return res.status(404).json({ message: 'Task tidak ditemukan.' });
    }

    return res.status(200).json({ task });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil detail task.', error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, due_date } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Judul task wajib diisi.' });
    }

    const insertId = await Task.createTask(req.user.id, {
      title: String(title).trim(),
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      category: category || 'Work Project',
      due_date: due_date || null,
    });

    const task = await Task.getById(insertId, req.user.id);
    return res.status(201).json({ message: 'Task berhasil dibuat.', task });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal membuat task.', error: error.message });
  }
};

export const updateTaskById = async (req, res) => {
  try {
    const affectedRows = await Task.update(req.params.id, req.user.id, req.body || {});

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Task tidak ditemukan.' });
    }

    const task = await Task.getById(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Task berhasil diperbarui.', task });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal memperbarui task.', error: error.message });
  }
};

export const deleteTaskById = async (req, res) => {
  try {
    const affectedRows = await Task.delete(req.params.id, req.user.id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Task tidak ditemukan.' });
    }

    return res.status(200).json({ message: 'Task berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal menghapus task.', error: error.message });
  }
};