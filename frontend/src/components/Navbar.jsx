import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, Menu, User, Settings, KeyRound, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  onOpenCreateModal,
  searchInput,
  setSearchInput,
  onToggleSidebar,
  onOpenSettings
}) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name?.trim()
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AE';

  const providerLabel = user?.auth_provider === 'google'
    ? 'Akun Google'
    : user?.auth_provider === 'github'
    ? 'Akun GitHub'
    : 'Akun Personal (Free)';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Hamburger button (Mobile) + Search Bar */}
      <div className="flex items-center gap-2 flex-1 max-w-lg min-w-0">
        {/* Mobile Hamburger Menu */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 min-w-0">
          <div className="relative rounded-xl bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Mencari Tugas, Deskripsi dan prioritas....."
              className="w-full pl-9 pr-3 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none truncate"
            />
          </div>
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-3 shrink-0">
        {/* Status Pill (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Cloud Masuk</span>
        </div>

        {/* Create Task Button */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Tugas Baru</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => alert('Semua sistem Tugas berjalan normal. Tidak ada notifikasi baru.')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 group-hover:border-indigo-300 transition-colors overflow-hidden">
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
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block ${
              dropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 sm:w-64 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Identity Info */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'Pengguna TaskEco'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email || 'email@taskflow.io'}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {providerLabel}
                </span>
              </div>

              {/* Menu Items */}
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profil Saya</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Akun</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings('password');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>Ubah Password</span>
                </button>
              </div>

              {/* Divider & Logout */}
              <div className="pt-1 border-t border-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}