import React from 'react';
import { Search, Plus, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenCreateModal, searchInput, setSearchInput }) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AC';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative rounded-xl bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Mencari Tugas, Deskripsi dan prioritas....."
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Aksi Kanan */}
      <div className="flex items-center gap-3.5 ml-4">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Cloud Masuk</span>
        </div>

        {/* membuat Tombol Task */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tugas Baru</span>
        </button>

        {/* Bell Icon */}
        <button
          type="button"
          onClick={() => alert('Semua sistem Tugas berjalan normal. Tidak ada notifikasi baru.')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
          {initials}
        </div>
      </div>
    </header>
  );
}
