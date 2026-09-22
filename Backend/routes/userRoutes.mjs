import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/userController.mjs';
import { authenticateToken } from '../middleware/middleware.mjs';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
