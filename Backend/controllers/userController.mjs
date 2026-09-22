import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Users from '../models/userModel.mjs';

const createToken = (user) => jwt.sign(
  { id: user.id, email: user.email, name: user.name },
  process.env.JWT_SECRET || 'taskflow_super_secret_jwt_key_2026',
  { expiresIn: '100d' }
);

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!validEmail) {
      return res.status(400).json({ message: 'Format email tidak valid.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    const existingUser = await Users.getByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const insertedId = await Users.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const user = { id: insertedId, name: String(name).trim(), email: normalizedEmail };
    const token = createToken(user);

    return res.status(201).json({
      message: 'Registrasi berhasil.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error pada registrasi:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server saat registrasi.',
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await Users.getByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error pada login:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server saat login.',
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await Users.getById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
