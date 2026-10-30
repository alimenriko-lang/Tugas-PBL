/**
 * Landing Page Controllers
 * - POST /api/landing/contact  → simpan pesan ke MySQL & teruskan ke email admin via SMTP
 * - POST /api/landing/chat     → proxy ke Gemini API (AI Chatbot TaskEco)
 */

import nodemailer from 'nodemailer';
import db from '../Config/db.mjs';

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
export const handleContact = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Nama wajib diisi.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return res.status(400).json({ message: 'Format email tidak valid.' });
    }
    if (!message || String(message).trim().length < 10) {
      return res.status(400).json({ message: 'Pesan minimal 10 karakter.' });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedMessage = String(message).trim();

    // 1. Pastikan tabel contact_messages tersedia di database MySQL
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        email_sent_to_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Kirim email notifikasi ke admin via SMTP jika terkonfigurasi di .env
    let emailSentToAdmin = false;
    const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'alimenriko@gmail.com';

    if (smtpConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"TaskEco Landing Page" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          replyTo: trimmedEmail,
          subject: `[TaskEco] Pesan Baru dari: ${trimmedName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
              <div style="background: #4f46e5; padding: 24px; color: #ffffff;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 700;">TaskEco • Pesan Baru Masuk</h2>
                <p style="margin: 6px 0 0; font-size: 13px; color: #e0e7ff;">Ada pengunjung yang mengirimkan pesan melalui formulir kontak landing page.</p>
              </div>
              <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 100px; font-weight: 600;">Nama:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${trimmedName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0; color: #4f46e5; font-weight: 600;"><a href="mailto:${trimmedEmail}" style="color: #4f46e5; text-decoration: none;">${trimmedEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Waktu:</td>
                    <td style="padding: 8px 0; color: #334155;">${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</td>
                  </tr>
                </table>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; color: #334155;">
                  <strong style="display: block; margin-bottom: 8px; color: #0f172a;">Isi Pesan:</strong>
                  <p style="margin: 0; white-space: pre-wrap;">${trimmedMessage}</p>
                </div>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="mailto:${trimmedEmail}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;">Balas ke ${trimmedEmail}</a>
                </div>
              </div>
              <div style="background: #f1f5f9; padding: 14px 24px; font-size: 11px; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0;">
                TaskEco App • Sistem Notifikasi Formulir Kontak Otomatis
              </div>
            </div>
          `,
        });

        emailSentToAdmin = true;
      } catch (err) {
        console.error('Gagal mengirim email notifikasi via SMTP:', err.message);
      }
    }

    // 3. Simpan pesan ke database MySQL
    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, message, email_sent_to_admin) VALUES (?, ?, ?, ?)',
      [trimmedName, trimmedEmail, trimmedMessage, emailSentToAdmin]
    );

    console.log('[Contact Form]', {
      id: result.insertId,
      name: trimmedName,
      email: trimmedEmail,
      savedToDatabase: true,
      emailForwardedToAdmin: emailSentToAdmin ? adminEmail : 'Belum (SMTP belum diisi)',
      time: new Date().toISOString(),
    });

    return res.status(200).json({
      message: emailSentToAdmin
        ? 'Pesan Anda telah berhasil disimpan dan diteruskan ke email admin. Terima kasih!'
        : 'Pesan Anda telah berhasil disimpan di database sistem TaskEco. Kami akan segera menghubungi Anda.',
      id: result.insertId,
      emailSentToAdmin,
    });
  } catch (error) {
    console.error('Error contact form:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat memproses pesan.' });
  }
};

// ─── AI CHATBOT (Gemini) ──────────────────────────────────────────────────────
const SYSTEM_CONTEXT = `Kamu adalah asisten AI untuk aplikasi TaskEco, sebuah aplikasi manajemen tugas (Task Manager / To-Do List) modern.

TaskEco memiliki fitur-fitur berikut yang benar-benar berfungsi:
- Manajemen tugas: buat, edit, hapus tugas dengan judul, deskripsi, kategori, prioritas (High/Medium/Low), status (Pending/In Progress/Completed), dan deadline (due_date).
- Dashboard produktivitas: statistik total tugas, pending, in progress, completed, dan tingkat penyelesaian (tingkat efisiensi).
- Filter tugas: berdasarkan status, prioritas, kategori, dan pencarian teks langsung.
- Kalender tugas: tampilan kalender bulanan interaktif dengan navigasi bulan dan indikator warna per status tugas.
- Autentikasi aman: registrasi dan login email, Google OAuth 2.0, GitHub OAuth, serta alur reset password terenkripsi bcrypt.
- Pengaturan akun: ubah profil, atur password baru, dan hapus akun beserta seluruh task secara permanen.
- Tampilan responsif optimal untuk desktop maupun layar handphone.

Teknologi yang digunakan: React.js, Tailwind CSS, Node.js, Express.js, MySQL (TiDB Cloud).

Pengiriman pesan ini akan digunakan untuk menjawab pertanyaan pengguna seputar cara menggunakan TaskEco, fitur-fitur yang tersedia, alur tugas, dan tips produktivitas. Jawaban harus ramah, informatif, dan ringkas (maksimal 2-3 paragraf pendek atau poin-poin singkat). Jika ada pertanyaan di luar topik TaskEco atau produktivitas kerja, arahkan kembali ke topik TaskEco secara sopan.

Kritik dan saran untuk pengembangan TaskEco juga diterima dengan baik, tetapi jawaban harus tetap fokus pada penggunaan aplikasi dan produktivitas.

Mengirim kritik dan saran dapat dilakukan melalui formulir kontak di landing page TaskEco, dan akan diteruskan ke email admin.

Pembuat TaskEco: Enriko Nur Alim (enrikonuralim@gmail.com)
dibuat untuk tujuan pembelajaran dan proyek PBL (Project Based Learning) di BBVP Bandung.
Dibuat pada tanggal 22 September 2026, versi 1.0.0.

Tugasmu:
1. Jawab pertanyaan pengguna seputar cara menggunakan TaskEco, fitur-fitur yang tersedia, alur tugas, dan tips produktivitas secara ramah, informatif, dan ringkas.
2. Jika ada pertanyaan di luar topik TaskEco atau produktivitas kerja, arahkan kembali ke topik TaskEco secara sopan.
3. Jawab dalam Bahasa Indonesia yang baik dan terstruktur (maksimal 2-3 paragraf pendek atau poin-poin singkat).`;

export const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Pesan tidak boleh kosong.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !String(apiKey).trim()) {
      return res.status(503).json({
        message: 'AI Chatbot belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY pada file .env backend.',
        configured: false,
      });
    }

    // Susun riwayat obrolan (maksimal 10 percakapan terakhir)
    const contents = [];
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    for (const turn of recentHistory) {
      if (turn.role && turn.text) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(turn.text) }],
        });
      }
    }

    // Tambahkan pesan pengguna saat ini
    contents.push({
      role: 'user',
      parts: [{ text: String(message).trim() }],
    });

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: SYSTEM_CONTEXT }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    };

    // Daftar model yang didukung Google Generative Language API
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-1.5-flash',
    ];

    let replyText = null;
    let lastErrorStatus = null;
    let lastErrorMessage = null;

    for (const modelName of candidateModels) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
          }
        );

        // Jika model tidak ditemukan / di-sunset untuk API key ini, coba model berikutnya
        if (geminiRes.status === 404) {
          continue;
        }

        if (geminiRes.status === 429) {
          return res.status(429).json({
            message: 'Batas kuota gratis Google Gemini tercapai. Silakan coba beberapa saat lagi.',
          });
        }

        if (!geminiRes.ok) {
          const errData = await geminiRes.json().catch(() => ({}));
          console.error(`[Gemini Error ${modelName}] Status ${geminiRes.status}:`, errData);
          lastErrorStatus = geminiRes.status;
          lastErrorMessage = errData?.error?.message || 'Error dari API Gemini';
          continue;
        }

        const data = await geminiRes.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          replyText = candidate.trim();
          break; // Sukses!
        }
      } catch (callErr) {
        console.error(`[Gemini Fetch Error ${modelName}]:`, callErr.message);
        lastErrorMessage = callErr.message;
      }
    }

    if (!replyText) {
      console.error('[Gemini Semua Model Gagal]', { lastErrorStatus, lastErrorMessage });
      return res.status(502).json({
        message: lastErrorMessage || 'AI saat ini tidak dapat merespons. Pastikan GEMINI_API_KEY valid.',
      });
    }

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error('Error chat handler:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server AI.' });
  }
};
