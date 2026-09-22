import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import TaskFlowLogo from '../components/TaskFlowLogo';
import { useAuth } from '../context/AuthContext';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // kalkulasi kekuatan password
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Silakan setujui Terms of Service dan Privacy Policy.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({ name, email, password });
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between items-center px-4 py-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Top Logo */}
      <div className="pt-2 pb-2">
        <TaskFlowLogo size="large" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8 sm:p-10 my-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/60 text-[11px] font-semibold text-indigo-700">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            AKUN DEMO
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verifikasi
          </span>
        </div>

        {/* Heading */}
        <div className="text-left mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Buat Akun Anda
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Mulai kelola proyek, tugas, dan alur kerja tim dengan mudah menggunakan <span className="font-medium text-slate-700">TaskFlow</span>.
          </p>
        </div>

        {/* OAuth Buttons Side by Side */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => alert('Demo Google Auth: Sedang proses demo, sihlakan gunakan akun email dibawah.')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => alert('Demo GitHub Auth: Sedang proses demo, sihlakan gunakan akun email dibawah!')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 transition-all"
          >
            <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200/80 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase absolute">
            atau daftar dengan email
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rizky Febrian"
                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Email
              </label>
              <span className="text-[11px] text-slate-400"></span>
            </div>
            <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tahubulat@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              {password && (
                <span className={`text-[11px] font-medium flex items-center gap-1 ${
                  strength >= 3 ? 'text-emerald-600' : strength === 2 ? 'text-amber-600' : 'text-slate-400'
                }`}>
                  <Check className="w-3 h-3" />
                  {strength >= 3 ? 'Strong password' : strength === 2 ? 'Medium password' : 'Weak'}
                </span>
              )}
            </div>
            <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength 4 bars */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    strength >= step
                      ? strength >= 3
                        ? 'bg-emerald-600'
                        : 'bg-amber-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span>ⓘ</span>
              <span>Minimal 8 karakter dengan huruf, angka & simbol</span>
            </p>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="agree"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="agree" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer select-none">
              Saya setuju dengan <span className="text-indigo-600 font-medium">Ketentuan Layanan</span>, <span className="text-indigo-600 font-medium">Kebijakan Privasi</span>, dan menerima pembaruan produk yang bermanfaat.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-200/70 flex items-center justify-center gap-2 transition-all group mt-2"
          >
            <span>{loading ? 'Akun Sedang Dibuat...' : 'Mulai Disini'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Switch Link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Sudah punya akun? {' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline transition-colors"
          >
            Masuk
          </button>
        </div>

        {/* Badges */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-[10px] font-medium text-slate-500">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-bit SSL encryption • SOC2 Certified • Batakan kapanpun</span>
          </div>
        </div>
      </div>

      {/* Operational Status */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 my-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Semua Sistem Cloud Global Aplikasi ini Beroperasi Normal</span>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 mt-2 space-x-3">
        <span>© 2026 TaskFlow Demo. All rights reserved.</span>
        <span>•</span>
        <a href="#terms" className="hover:text-slate-600">Privacy Policy</a>
        <span>•</span>
        <a href="#privacy" className="hover:text-slate-600">Terms of Service</a>
        <span>•</span>
        <a href="#help" className="hover:text-slate-600">Pusat Bantuan</a>
      </div>
    </div>
  );
}
