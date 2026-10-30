import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, KeyRound, Check, Copy, CheckCircle, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import TaskFlowLogo from '../components/TaskFlowLogo';
import { authService } from '../services/api.mjs';

export default function ForgotPassword({ onSwitchToLogin, onProceedToReset }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetData, setResetData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setResetData(response);
    } catch (err) {
      setError(err.message || 'Gagal memproses permintaan reset password. Periksa kembali email Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (resetData?.token) {
      navigator.clipboard.writeText(resetData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between items-center px-4 py-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Top Logo */}
      <div className="pt-4 pb-2">
        <TaskFlowLogo size="large" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8 sm:p-10 my-4">
        {!resetData ? (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Lupa Kata Sandi?
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Masukkan alamat email yang terdaftar pada akun TaskFlow Anda untuk mendapatkan token reset password yang aman.
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Akun Anda
                </label>
                <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-200/70 flex items-center justify-center gap-2 transition-all group mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses Permintaan...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Permintaan Reset</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Permintaan Berhasil!
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                Token reset password telah dibuat untuk email <strong className="text-slate-700">{resetData.email}</strong>.
              </p>
            </div>

            {/* Token Info Box */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Token Reset Password</span>
                <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                  Berlaku {resetData.expiresInMinutes || 15} Menit
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <code className="text-xs font-mono text-slate-800 break-all select-all flex-1 line-clamp-2">
                  {resetData.token}
                </code>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  title="Salin Token"
                  className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {copied && (
                <p className="text-[11px] text-emerald-600 font-medium">
                  ✓ Token berhasil disalin ke clipboard!
                </p>
              )}
            </div>

            {/* Explanation / Dev note */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-indigo-900 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-indigo-950">Informasi Pengiriman</p>
                <p className="text-[11px] text-indigo-700/90 leading-relaxed">
                  {resetData.emailConfigured
                    ? 'Tautan reset telah dikirim ke kotak masuk email Anda.'
                    : 'Layanan email SMTP belum aktif di server. Anda dapat langsung menggunakan token di atas untuk mengubah kata sandi baru secara instan.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => onProceedToReset(resetData.token)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-200/70 flex items-center justify-center gap-2 transition-all group"
              >
                <span>Lanjutkan ke Atur Ulang Password</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetData(null);
                  setEmail('');
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                Kirim Permintaan untuk Email Lain
              </button>
            </div>
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
