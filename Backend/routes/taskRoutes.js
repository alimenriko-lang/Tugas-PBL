import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
  getTaskStats,
} from '../controllers/taskController.mjs';
import { authenticateToken } from '../middleware/middleware.mjs';

const router = express.Router();

router.use(authenticateToken);
router.get('/stats', getTaskStats);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTaskById);
router.delete('/:id', deleteTaskById);

export default router;
