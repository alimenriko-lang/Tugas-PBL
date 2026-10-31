import React, { useMemo } from 'react';
import { Calendar, Clock, Flag, Edit2, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

// Helper konversi format 12 jam (AM/PM) ke format 24 jam (HH:mm)
const to24Hour = (timeStr) => {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  const match24 = trimmed.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    return `${match24[1].padStart(2, '0')}:${match24[2]}`;
  }
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2].padStart(2, '0');
    const modifier = match12[3] ? match12[3].toUpperCase() : null;
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  return trimmed;
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isDone = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  // Format Tanggal (cth: Oct 31, 2026)
  const formattedDate = useMemo(() => {
    if (!task.due_date) return null;
    try {
      let dateObj;
      if (typeof task.due_date === 'string') {
        const cleanDate = task.due_date.split('T')[0];
        const [y, m, d] = cleanDate.split('-').map(Number);
        dateObj = new Date(y, m - 1, d);
      } else {
        dateObj = new Date(task.due_date);
      }
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return String(task.due_date);
    }
  }, [task.due_date]);

  // Format Jam 24 Jam (cth: 14:00)
  const formattedTime = useMemo(() => {
    if (!task.due_date) return null;
    return to24Hour(task.due_time) || '23:59';
  }, [task.due_date, task.due_time]);

  // Cek apakah tugas telah melewati tenggat waktu sekarang (Overdue)
  const isOverdue = useMemo(() => {
    if (!task.due_date || isDone) return false;

    try {
      let y, m, d;
      if (typeof task.due_date === 'string') {
        const cleanDate = task.due_date.split('T')[0];
        const parts = cleanDate.split('-').map(Number);
        y = parts[0];
        m = parts[1];
        d = parts[2];
      } else {
        const dt = new Date(task.due_date);
        y = dt.getFullYear();
        m = dt.getMonth() + 1;
        d = dt.getDate();
      }

      const timeStr = to24Hour(task.due_time) || '23:59';
      const [hours, minutes] = timeStr.split(':').map((val) => parseInt(val, 10) || 0);

      const dueDateTime = new Date(y, m - 1, d, hours, minutes, 0, 0);
      return new Date() > dueDateTime;
    } catch {
      return false;
    }
  }, [task.due_date, task.due_time, isDone]);

  // Style Prioritas
  const priorityConfig = {
    high: {
      label: 'High',
      color: 'bg-rose-50 text-rose-700 border-rose-200/80',
      hasFlag: true
    },
    medium: {
      label: 'Med',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      hasDot: true
    },
    low: {
      label: 'Low',
      color: 'bg-slate-100 text-slate-600 border-slate-200/80'
    }
  };

  const priorityKey = String(task.priority || 'medium').toLowerCase();
  const priorityStyle = priorityConfig[priorityKey] || priorityConfig.medium;

  // Style Status
  const statusConfig = {
    pending: { label: 'To Do', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    in_progress: { label: 'In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };

  const statusKey = String(task.status || 'pending').toLowerCase().replace(' ', '_');
  const statusStyle = statusConfig[statusKey] || statusConfig.pending;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-5 shadow-xs relative overflow-hidden group ${
        isDone
          ? 'border-slate-200/60 bg-slate-50/40 opacity-80'
          : isOverdue
          ? 'border-rose-400/90 bg-rose-50/30 hover:border-rose-500 hover:ring-2 hover:ring-rose-400 hover:shadow-lg hover:shadow-rose-100/70 hover:animate-pulse'
          : 'bg-white border-slate-200/80 hover:shadow-md'
      }`}
    >
      {/* Top Meta Tags */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.color}`}>
            {statusStyle.label}
          </span>

          {/* Badge Terlewat (Jika melewati batas tenggat waktu) */}
          {isOverdue && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <span>Terlewat</span>
            </span>
          )}

          {/* Tag Kategori */}
          {task.category && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100/80 text-slate-600 border border-slate-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {task.category}
            </span>
          )}

          {/* Tag Prioritas */}
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${priorityStyle.color}`}>
            {priorityStyle.hasFlag && <Flag className="w-3 h-3 fill-current" />}
            {priorityStyle.hasDot && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
            {priorityStyle.label}
          </span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            title="Hapus Task"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Content */}
      <div className="mb-4">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => {
              const nextStatus = isDone ? 'pending' : 'completed';
              onStatusChange(task.id, nextStatus);
            }}
            title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
            className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5 hover:stroke-indigo-600" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h4
              className={`text-base font-semibold leading-snug cursor-pointer ${
                isDone
                  ? 'line-through text-slate-400'
                  : isOverdue
                  ? 'text-rose-950 hover:text-rose-700'
                  : 'text-slate-900 hover:text-indigo-600'
              }`}
              onClick={() => onEdit(task)}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                isDone ? 'text-slate-400' : isOverdue ? 'text-rose-700/80' : 'text-slate-500'
              }`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info: Tanggal & Jam Tenggat */}
      <div className={`flex items-center justify-between pt-3 border-t text-xs ${
        isOverdue ? 'border-rose-200/80' : 'border-slate-100 text-slate-500'
      }`}>
        <div className="flex items-center gap-2 font-medium flex-wrap">
          {formattedDate ? (
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
              <div className="flex items-center gap-1.5">
                <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>{formattedDate}</span>
              </div>
              <span className={`${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>•</span>
              <div className="flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                <span>{formattedTime}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>No deadline</span>
            </div>
          )}
        </div>

        {/* Quick status cycle button */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`text-[11px] font-medium rounded-lg px-2 py-1 outline-none cursor-pointer transition-colors ${
            isOverdue
              ? 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <option value="pending">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
