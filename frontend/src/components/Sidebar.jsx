import React from 'react';
import {
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle2,
  BarChart2,
  FolderKanban,
  LogOut,
  Sparkles
} from 'lucide-react';
import TaskFlowLogo from './TaskFlowLogo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  activeFilter,
  setActiveFilter,
  activeCategory,
  setActiveCategory,
  stats = { total: 0, pending: 0, in_progress: 0, completed: 0 }
}) {
  const { user, logout } = useAuth();

  const coreNavItems = [
    { id: 'all', label: 'Semua Task', icon: CheckSquare, count: stats.total },
    { id: 'today', label: 'Hari Ini', icon: Calendar, count: stats.pending },
    { id: 'upcoming', label: 'Mendatang', icon: Clock, count: stats.in_progress },
    { id: 'completed', label: 'Selesai', icon: CheckCircle2, count: stats.completed },
  ];

  const categories = [
    { id: 'all', label: 'All Categories', color: 'bg-slate-400' },
    { id: 'Work Projects', label: 'Work Projects', color: 'bg-indigo-500' },
    { id: 'Learning & Growth', label: 'Learning & Growth', color: 'bg-sky-500' },
    { id: 'Personal Health', label: 'Personal Health', color: 'bg-emerald-500' },
  ];

  // Inisial nama user untuk avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TF';

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Top Header */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <TaskFlowLogo size="default" />
        </div>
        <div className="mt-4 px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs font-medium text-slate-600">
          <span className="truncate">{user?.name ? `Ruang Kerja ${user.name}` : 'Ruang Kerja Personal'}</span>
          <span className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-500 font-semibold border border-slate-200 shadow-2xs">
            Free
          </span>
        </div>

        {/* Core Navigation */}
        <div className="mt-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Utama
          </p>
          <nav className="space-y-1">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Categories */}
        <div className="mt-8">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Ruang Kerja / Kategori
          </p>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isCatActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isCatActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Card at Bottom */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || 'Alex Chen'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'user@taskflow.io'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Keluar / Logout"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
