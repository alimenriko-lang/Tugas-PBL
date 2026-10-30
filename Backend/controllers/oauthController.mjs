import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Users from '../models/userModel.mjs';

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const getJwtSecret = () => process.env.JWT_SECRET || 'taskflow_super_secret_jwt_key_2026';

const createToken = (user) => jwt.sign(
  { id: user.id, email: user.email, name: user.name },
  getJwtSecret(),
  { expiresIn: '100d' }
);

// HMAC signed state untuk CSRF protection tanpa session
const generateState = () => {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', getJwtSecret()).update(`${nonce}:${timestamp}`).digest('hex');
  return `${nonce}.${timestamp}.${signature}`;
};

const verifyState = (state) => {
  if (!state || typeof state !== 'string') return false;
  const parts = state.split('.');
  if (parts.length !== 3) return false;
  const [nonce, timestamp, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', getJwtSecret()).update(`${nonce}:${timestamp}`).digest('hex');
  if (signature !== expectedSignature) return false;
  // State berlaku 15 menit
  const age = Date.now() - Number(timestamp);
  return age >= 0 && age < 15 * 60 * 1000;
};

// ==========================================
// GOOGLE OAUTH 2.0
// ==========================================

export const initiateGoogleAuth = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
    const frontendUrl = getFrontendUrl();

    if (!clientId || !clientSecret) {
      const errorMsg = 'Google OAuth belum dikonfigurasi di backend. Silakan isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET pada file .env.';
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(errorMsg)}`);
    }

    const state = generateState();
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    return res.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Error saat inisiasi Google OAuth:', error);
    return res.redirect(`${getFrontendUrl()}/?oauth_error=${encodeURIComponent('Terjadi kesalahan saat memulai autentikasi Google.')}`);
  }
};

export const handleGoogleCallback = async (req, res) => {
  const frontendUrl = getFrontendUrl();
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      const msg = error === 'access_denied'
        ? 'Login Google dibatalkan oleh pengguna.'
        : (error_description || 'Autentikasi Google gagal.');
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(msg)}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Kode otorisasi Google tidak ditemukan.')}`);
    }

    if (state && !verifyState(state)) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Sesi autentikasi Google kedaluwarsa atau tidak valid. Silakan coba kembali.')}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    // 1. Tukar authorization code dengan access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      const errorMsg = tokenData.error_description || tokenData.error || 'Gagal menukarkan token otorisasi Google.';
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(errorMsg)}`);
    }

    // 2. Ambil informasi profil pengguna dari Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoResponse.json();
    if (!userinfoResponse.ok || !googleUser.sub) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Gagal mengambil data profil dari Google.')}`);
    }

    if (!googleUser.email) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Akun Google tidak menyediakan alamat email yang valid.')}`);
    }

    if (!googleUser.email_verified) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Email Google Anda belum diverifikasi oleh Google.')}`);
    }

    const normalizedEmail = googleUser.email.trim().toLowerCase();
    const providerId = String(googleUser.sub);
    const displayName = googleUser.name || googleUser.given_name || normalizedEmail.split('@')[0];
    const avatarUrl = googleUser.picture || null;

    // 3. Validasi identitas dan penanganan duplikasi akun
    let user = await Users.getByProviderId('google', providerId);

    if (!user) {
      const existingUserByEmail = await Users.getByEmail(normalizedEmail);

      if (existingUserByEmail) {
        // Cegah linking jika akun sudah diikat ke provider lain
        if (existingUserByEmail.auth_provider === 'github' && existingUserByEmail.provider_id) {
          const msg = `Email ${normalizedEmail} sudah terdaftar menggunakan akun GitHub. Silakan masuk menggunakan GitHub.`;
          return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(msg)}`);
        }

        // Tautkan akun Google yang emailnya terverifikasi
        await Users.linkOAuthProvider(existingUserByEmail.id, {
          auth_provider: 'google',
          provider_id: providerId,
          avatar_url: avatarUrl,
        });

        user = await Users.getById(existingUserByEmail.id);
      } else {
        // Buat akun baru pengguna Google
        const insertId = await Users.createOAuthUser({
          name: displayName,
          email: normalizedEmail,
          auth_provider: 'google',
          provider_id: providerId,
          avatar_url: avatarUrl,
        });

        user = await Users.getById(insertId);
      }
    }

    const token = createToken(user);
    return res.redirect(`${frontendUrl}/?oauth_token=${encodeURIComponent(token)}&provider=google`);
  } catch (error) {
    console.error('Error pada Google OAuth callback:', error);
    return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Terjadi kesalahan internal saat memproses autentikasi Google.')}`);
  }
};

// ==========================================
// GITHUB OAUTH
// ==========================================

export const initiateGithubAuth = async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';
    const frontendUrl = getFrontendUrl();

    if (!clientId || !clientSecret) {
      const errorMsg = 'GitHub OAuth belum dikonfigurasi di backend. Silakan isi GITHUB_CLIENT_ID dan GITHUB_CLIENT_SECRET pada file .env.';
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(errorMsg)}`);
    }

    const state = generateState();
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    githubAuthUrl.searchParams.set('scope', 'read:user user:email');
    githubAuthUrl.searchParams.set('state', state);

    return res.redirect(githubAuthUrl.toString());
  } catch (error) {
    console.error('Error saat inisiasi GitHub OAuth:', error);
    return res.redirect(`${getFrontendUrl()}/?oauth_error=${encodeURIComponent('Terjadi kesalahan saat memulai autentikasi GitHub.')}`);
  }
};

export const handleGithubCallback = async (req, res) => {
  const frontendUrl = getFrontendUrl();
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      const msg = error === 'access_denied'
        ? 'Login GitHub dibatalkan oleh pengguna.'
        : (error_description || 'Autentikasi GitHub gagal.');
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(msg)}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Kode otorisasi GitHub tidak ditemukan.')}`);
    }

    if (state && !verifyState(state)) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Sesi autentikasi GitHub kedaluwarsa atau tidak valid. Silakan coba kembali.')}`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

    // 1. Tukar authorization code dengan access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code),
        redirect_uri: callbackUrl,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      const errorMsg = tokenData.error_description || tokenData.error || 'Gagal menukarkan token otorisasi GitHub.';
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(errorMsg)}`);
    }

    const accessToken = tokenData.access_token;

    // 2. Ambil profil pengguna dari GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'TaskEco-OAuth-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = await userResponse.json();
    if (!userResponse.ok || !githubUser.id) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Gagal mengambil data profil dari GitHub.')}`);
    }

    // 3. Ambil daftar email terverifikasi pengguna dari GitHub
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'TaskEco-OAuth-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const emails = await emailsResponse.json();
    let verifiedEmail = null;

    if (Array.isArray(emails) && emails.length > 0) {
      const primaryVerified = emails.find((e) => e.primary && e.verified);
      const anyVerified = emails.find((e) => e.verified);
      verifiedEmail = primaryVerified ? primaryVerified.email : (anyVerified ? anyVerified.email : null);
    } else if (githubUser.email) {
      verifiedEmail = githubUser.email;
    }

    if (!verifiedEmail) {
      return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Akun GitHub Anda tidak memiliki email yang terverifikasi. Harap verifikasi email pada akun GitHub Anda.')}`);
    }

    const normalizedEmail = verifiedEmail.trim().toLowerCase();
    const providerId = String(githubUser.id);
    const displayName = githubUser.name || githubUser.login || normalizedEmail.split('@')[0];
    const avatarUrl = githubUser.avatar_url || null;

    // 4. Validasi identitas dan penanganan duplikasi akun
    let user = await Users.getByProviderId('github', providerId);

    if (!user) {
      const existingUserByEmail = await Users.getByEmail(normalizedEmail);

      if (existingUserByEmail) {
        // Cegah linking jika akun sudah diikat ke provider lain
        if (existingUserByEmail.auth_provider === 'google' && existingUserByEmail.provider_id) {
          const msg = `Email ${normalizedEmail} sudah terdaftar menggunakan akun Google. Silakan masuk menggunakan Google.`;
          return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(msg)}`);
        }

        // Tautkan akun GitHub yang emailnya terverifikasi
        await Users.linkOAuthProvider(existingUserByEmail.id, {
          auth_provider: 'github',
          provider_id: providerId,
          avatar_url: avatarUrl,
        });

        user = await Users.getById(existingUserByEmail.id);
      } else {
        // Buat akun baru pengguna GitHub
        const insertId = await Users.createOAuthUser({
          name: displayName,
          email: normalizedEmail,
          auth_provider: 'github',
          provider_id: providerId,
          avatar_url: avatarUrl,
        });

        user = await Users.getById(insertId);
      }
    }

    const token = createToken(user);
    return res.redirect(`${frontendUrl}/?oauth_token=${encodeURIComponent(token)}&provider=github`);
  } catch (error) {
    console.error('Error pada GitHub OAuth callback:', error);
    return res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent('Terjadi kesalahan internal saat memproses autentikasi GitHub.')}`);
  }
};
