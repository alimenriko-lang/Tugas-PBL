import express from 'express';
import { handleContact, handleChat } from '../controllers/landingController.mjs';

const router = express.Router();

// POST /api/landing/contact - Form kontak landing page
router.post('/contact', handleContact);

// POST /api/landing/chat - AI Chatbot (Gemini)
router.post('/chat', handleChat);

export default router;
