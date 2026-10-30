import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck, KeyRound, Check } from 'lucide-react';
import TaskFlowLogo from '../components/TaskFlowLogo';
import { authService } from '../services/api.mjs';

export default function ResetPassword({ initialToken = '', onSwitchToLogin, onSwitchToForgotPassword }) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [tokenStatus, setTokenStatus] = useState({ checking: false, valid: null, email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-verify token when token changes (debounced or on initialToken)
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      if (!token || token.trim().length < 10) {
        if (isMounted) {
          setTokenStatus({ checking: false, valid: null, email: '', message: '' });
        }
        return;
      }

      if (isMounted) {
        setTokenStatus({ checking: true, valid: null, email: '', message: '' });
      }

      try {
        const res = await authService.verifyResetToken(token.trim());
        if (isMounted) {
          setTokenStatus({ checking: false, valid: true, email: res.email || '', message: res.message || 'Token valid' });
        }
      } catch (err) {
        if (isMounted) {
          setTokenStatus({ checking: false, valid: false, email: '', message: err.message || 'Token tidak valid atau kedaluwarsa' });
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Token reset password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token: token.trim(),
        password,
        confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal mereset kata sandi. Silakan periksa kembali token Anda.');
    } finally {
      setLoading(false);
    }
  };

  const isLengthValid = password.length >= 6;
  const isMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between items-center px-4 py-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Top Logo */}
      <div className="pt-4 pb-2">
        <TaskFlowLogo size="large" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8 sm:p-10 my-4">
        {!success ? (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Atur Ulang Password
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Masukkan token reset dan buat kata sandi baru yang aman untuk akun Anda.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Token Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Token Reset Password
                  </label>
                  {tokenStatus.valid === true && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Token Valid
                    </span>
                  )}
                  {tokenStatus.valid === false && (
                    <button
                      type="button"
                      onClick={onSwitchToForgotPassword}
                      className="text-[11px] font-medium text-rose-600 hover:underline"
                    >
                      Minta Token Baru
                    </button>
                  )}
                </div>
                <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Masukkan token 64 karakter..."
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent font-mono text-xs text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>
                {tokenStatus.valid === false && (
                  <p className="mt-1.5 text-[11px] text-rose-600">
                    {tokenStatus.message || 'Token tidak valid atau sudah kedaluwarsa.'}
                  </p>
                )}
                {tokenStatus.valid === true && tokenStatus.email && (
                  <p className="mt-1.5 text-[11px] text-emerald-600">
                    Akun: <span className="font-semibold">{tokenStatus.email}</span>
                  </p>
                )}
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password Baru
                </label>
                <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
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
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru..."
                    className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Badges */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                    isLengthValid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isLengthValid ? '✓' : '•'}
                  </div>
                  <span className={isLengthValid ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Minimal 6 karakter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                    isMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isMatch ? '✓' : '•'}
                  </div>
                  <span className={isMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Konfirmasi password sesuai
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (tokenStatus.valid === false)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-200/70 flex items-center justify-center gap-2 transition-all group mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menyimpan Password Baru...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Password Baru</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="text-center py-4 space-y-6">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Password Berhasil Diubah!
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Kata sandi baru Anda telah berhasil dienkripsi dan disimpan. Silakan masuk kembali dengan kata sandi baru Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-200/70 flex items-center justify-center gap-2 transition-all group"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Halaman Masuk</span>
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>256-bit SSL encryption • SOC2 Certified</span>
          </div>
        </div>
      </div>

      {/* Floating Status Indicator (Bottom Right) */}
      <div className="fixed bottom-6 right-6 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-slate-200/80 shadow-sm text-xs font-medium text-slate-600">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Cloud Sync Active</span>
      </div>
    </div>
  );
}
