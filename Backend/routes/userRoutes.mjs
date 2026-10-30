import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword, 
  verifyResetToken, 
  resetPassword 
} from '../controllers/userController.mjs';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  initiateGithubAuth,
  handleGithubCallback
} from '../controllers/oauthController.mjs';
import { authenticateToken } from '../middleware/middleware.mjs';

const router = express.Router();

// Autentikasi Lokal
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getCurrentUser);

// Autentikasi Google OAuth 2.0
router.get('/auth/google', initiateGoogleAuth);
router.get('/auth/google/callback', handleGoogleCallback);

// Autentikasi GitHub OAuth
router.get('/auth/github', initiateGithubAuth);
router.get('/auth/github/callback', handleGithubCallback);

// Rute Pengaturan Akun
router.put('/profile', authenticateToken, updateProfile);
router.put('/me/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.put('/me/change-password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);
router.delete('/me/account', authenticateToken, deleteAccount);

// Rute Lupa / Reset Password
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;
