import React, { useState } from 'react';
import {
  User,
  Lock,
  Trash2,
  ArrowLeft,
  Check,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api.mjs';

export default function AccountSettings({ initialTab = 'profile', onBackToDashboard }) {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'password' | 'danger'

  // Profil Form State
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Hapus Akun Form State
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // User Initials
  const initials = user?.name?.trim()
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AE';

  const providerBadge =
    user?.auth_provider === 'google'
      ? 'Terhubung dengan Google'
      : user?.auth_provider === 'github'
      ? 'Terhubung dengan GitHub'
      : 'Ruang Kerja Free Personal';

  const hasPassword = user?.has_password !== false;

  // Handle Simpan Profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('Nama lengkap tidak boleh kosong.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      if (res?.user) {
        updateUser(res.user);
      }
      setProfileSuccess(res.message || 'Profil berhasil diperbarui!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Ubah Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (hasPassword && !currentPassword) {
      setPasswordError('Password saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    if (hasPassword && currentPassword === newPassword) {
      setPasswordError('Password baru tidak boleh sama dengan password saat ini.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: hasPassword ? currentPassword : '',
        newPassword,
        confirmPassword
      });
      setPasswordSuccess(res.message || 'Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      updateUser({ has_password: true });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Gagal mengubah password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Hapus Akun
  const handleConfirmDeleteAccount = async () => {
    setDeleteError('');
    if (hasPassword && !deletePassword) {
      setDeleteError('Silakan masukkan password untuk konfirmasi.');
      return;
    }

    setDeleteLoading(true);
    try {
      await authService.deleteAccount({ password: deletePassword });
      setShowDeleteModal(false);
      logout();
    } catch (err) {
      setDeleteError(err.message || 'Gagal menghapus akun. Periksa kembali password Anda.');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Top Bar Navigation */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="text-sm font-bold text-slate-800 hidden sm:inline-block">
            Pengaturan Akun TaskEco
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              initials
            )}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            {user?.name}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pengaturan Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola identitas profil, keamanan kata sandi, dan data akun Anda secara aman.
          </p>
        </div>

        {/* Layout with Tabs and Content Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Navigation Tabs (Sidebar style on desktop, buttons on mobile) */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400'}`} />
                <span>Profil Saya</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'password'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <KeyRound className={`w-4 h-4 ${activeTab === 'password' ? 'text-white' : 'text-slate-400'}`} />
                <span>Ubah Password</span>
              </button>

              <div className="pt-2 border-t border-slate-100 my-1"></div>

              <button
                type="button"
                onClick={() => setActiveTab('danger')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'danger'
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Trash2 className={`w-4 h-4 ${activeTab === 'danger' ? 'text-white' : 'text-rose-500'}`} />
                <span>Hapus Akun</span>
              </button>
            </div>

            {/* Security Badge Card */}
            <div className="mt-4 bg-slate-50 border border-slate-200/70 rounded-2xl p-4 hidden md:block">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Keamanan Data</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Password Anda dienkripsi menggunakan hash standar industri bcrypt dengan perlindungan otentikasi JWT.
              </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* TAB 1: PROFIL SAYA */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-100 overflow-hidden">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || 'User'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {user?.name || 'Pengguna TaskEco'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {providerBadge}
                    </span>
                  </div>
                </div>

                {profileSuccess && (
                  <div className="mt-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
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
                        placeholder="Nama Lengkap Anda"
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Alamat Email
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Email akun utama (tidak dapat diubah)
                      </span>
                    </div>
                    <div className="relative rounded-xl bg-slate-100/80 border border-slate-200 text-slate-500">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-600 outline-none cursor-not-allowed select-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
                    >
                      {profileLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Perubahan Profil</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: UBAH PASSWORD */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <div className="pb-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">
                    {hasPassword ? 'Ubah Kata Sandi' : 'Buat Kata Sandi Akun'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {hasPassword
                      ? 'Pastikan password baru Anda minimal 6 karakter dan gunakan kombinasi yang sulit ditebak.'
                      : 'Akun Anda dibuat via login OAuth (Google/GitHub). Anda dapat mengatur kata sandi lokal agar dapat login menggunakan formulir email.'}
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="mt-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                  {/* Password Saat Ini (Hanya jika akun sudah punya password) */}
                  {hasPassword && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Password Saat Ini
                      </label>
                      <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Ketik password saat ini..."
                          className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password Baru */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Password Baru
                    </label>
                    <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter..."
                        className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password Baru */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru..."
                        className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements Indicators */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                        newPassword.length >= 6 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {newPassword.length >= 6 ? '✓' : '•'}
                      </div>
                      <span className={newPassword.length >= 6 ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                        Minimal 6 karakter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                        newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : '•'}
                      </div>
                      <span className={newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                        Konfirmasi kata sandi cocok
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Menyimpan Password...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan Kata Sandi Baru</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: HAPUS AKUN (ZONA BAHAYA) */}
            {activeTab === 'danger' && (
              <div className="bg-white rounded-3xl border border-rose-200/80 p-6 sm:p-8 shadow-xs">
                <div className="pb-6 border-b border-rose-100">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-lg mb-1">
                    <AlertTriangle className="w-5 h-5" />
                    <h2>Hapus Akun Permanen</h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tindakan ini akan menghapus akun TaskEco Anda serta seluruh daftar tugas (task) yang pernah dibuat secara permanen dari basis data. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>

                {deleteError && (
                  <div className="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  {hasPassword ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Ketik Password Akun Anda untuk Konfirmasi
                      </label>
                      <div className="relative rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-rose-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showDeletePass ? 'text' : 'password'}
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Password akun Anda saat ini..."
                          className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeletePass(!showDeletePass)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showDeletePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      Akun Anda terhubung melalui provider <strong>{user?.auth_provider || 'OAuth'}</strong>. Anda dapat langsung menghapus akun ini dengan konfirmasi.
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={hasPassword && !deletePassword.trim()}
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Akun Saya Sekarang</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal Sebelum Hapus Akun */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Konfirmasi Hapus Akun
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Apakah Anda benar-benar yakin ingin menghapus akun <strong className="text-slate-800">{user?.email}</strong> beserta semua task yang terkait? Data yang dihapus tidak dapat dipulihkan.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batalkan
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDeleteAccount}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-70 text-white text-xs font-semibold rounded-xl shadow-sm shadow-rose-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Akun</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}