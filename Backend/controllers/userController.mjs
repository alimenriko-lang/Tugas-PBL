import crypto from 'crypto';
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
  auth_provider: user.auth_provider || 'local',
  avatar_url: user.avatar_url || null,
  has_password: Boolean(user.password),
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

    const user = {
      id: insertedId,
      name: String(name).trim(),
      email: normalizedEmail,
      auth_provider: 'local',
      avatar_url: null,
      password: hashedPassword,
    };
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

    // Jika akun terdaftar via OAuth dan belum memiliki password
    if (!user.password) {
      const providerName =
        user.auth_provider === 'google'
          ? 'Google'
          : user.auth_provider === 'github'
          ? 'GitHub'
          : 'OAuth';
      return res.status(400).json({
        message: `Akun ini terdaftar melalui ${providerName}. Silakan masuk menggunakan tombol Lanjutkan dengan ${providerName}.`,
      });
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

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Nama lengkap tidak boleh kosong.' });
    }

    const trimmedName = String(name).trim();
    if (trimmedName.length > 100) {
      return res.status(400).json({ message: 'Nama maksimal 100 karakter.' });
    }

    const user = await Users.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    await Users.updateProfile(req.user.id, { name: trimmedName });

    const updatedUser = {
      ...user,
      name: trimmedName,
    };

    return res.status(200).json({
      message: 'Profil berhasil diperbarui.',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error('Error saat update profile:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui profil.',
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Password baru dan konfirmasi password wajib diisi.',
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok dengan password baru.' });
    }

    const user = await Users.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    // Jika pengguna sudah memiliki password, lakukan verifikasi kata sandi saat ini
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Password saat ini wajib diisi.' });
      }

      const isCurrentValid = await bcrypt.compare(String(currentPassword), user.password);
      if (!isCurrentValid) {
        return res.status(400).json({ message: 'Password saat ini salah.' });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          message: 'Password baru tidak boleh sama dengan password saat ini.',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    await Users.updatePassword(req.user.id, hashedPassword);

    return res.status(200).json({
      message: 'Password berhasil diubah. Silakan gunakan password baru untuk login berikutnya.',
    });
  } catch (error) {
    console.error('Error saat ubah password:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat mengubah password.',
      error: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body || {};

    const user = await Users.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    // Jika pengguna memiliki password (akun lokal / telah set password), verifikasi password
    if (user.password) {
      if (!password) {
        return res.status(400).json({
          message: 'Harap masukkan password Anda untuk konfirmasi penghapusan akun.',
        });
      }

      const isPasswordValid = await bcrypt.compare(String(password), user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Password konfirmasi salah. Akun gagal dihapus.' });
      }
    }

    await Users.deleteWithTasks(req.user.id);

    return res.status(200).json({
      message: 'Akun Anda dan seluruh data tugas berhasil dihapus permanen.',
    });
  } catch (error) {
    console.error('Error saat hapus akun:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat menghapus akun.',
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!validEmail) {
      return res.status(400).json({ message: 'Format email tidak valid.' });
    }

    const user = await Users.getByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: 'Email tidak ditemukan dalam sistem.' });
    }

    // Buat token reset kriptografis acak (64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresInMinutes = 15;

    await Users.setResetToken(normalizedEmail, resetToken, expiresInMinutes);

    const resetUrl = `http://localhost:5173/?resetToken=${resetToken}`;
    const smtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    );

    return res.status(200).json({
      message: 'Token reset password berhasil dibuat.',
      email: normalizedEmail,
      token: resetToken,
      resetUrl,
      expiresInMinutes,
      emailConfigured: smtpConfigured,
      instructions: !smtpConfigured
        ? 'SMTP email belum dikonfigurasi. Anda dapat menggunakan token yang diberikan untuk langsung mengatur password baru.'
        : 'Silakan periksa kotak masuk email Anda untuk instruksi pengaturan ulang kata sandi.',
    });
  } catch (error) {
    console.error('Error saat request reset password:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server saat memproses reset password.',
      error: error.message,
    });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const token = req.params.token || req.query.token;

    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token reset password tidak ditemukan.' });
    }

    const user = await Users.getByResetToken(token);

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: 'Token reset password tidak valid atau sudah kedaluwarsa.',
      });
    }

    return res.status(200).json({
      valid: true,
      message: 'Token reset password valid.',
      email: user.email,
    });
  } catch (error) {
    console.error('Error verifikasi token reset password:', error);
    return res.status(500).json({
      valid: false,
      message: 'Terjadi kesalahan saat memverifikasi token.',
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body || {};

    if (!token) {
      return res.status(400).json({ message: 'Token reset password wajib disertakan.' });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Password baru dan konfirmasi password wajib diisi.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi password tidak sesuai dengan password baru.' });
    }

    const user = await Users.getByResetToken(token);

    if (!user) {
      return res.status(400).json({
        message: 'Token reset password tidak valid atau telah kedaluwarsa. Silakan ajukan ulang permohonan reset password.',
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    await Users.updatePasswordAndClearResetToken(user.id, hashedPassword);

    return res.status(200).json({
      message: 'Password berhasil diperbarui! Silakan login menggunakan password baru Anda.',
    });
  } catch (error) {
    console.error('Error saat mereset password:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server saat mereset password.',
      error: error.message,
    });
  }
};
