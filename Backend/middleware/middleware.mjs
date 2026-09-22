import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskflow_super_secret_jwt_key_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.'
    });
  }
};