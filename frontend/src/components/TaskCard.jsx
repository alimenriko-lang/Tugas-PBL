import React from 'react';
import { Calendar, Clock, Flag, MoreVertical, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isDone = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  // Format Due Date
  const formatDueDate = (dateStr, timeStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return timeStr ? `${formatted} at ${timeStr}` : formatted;
    } catch {
      return dateStr;
    }
  };

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

  const priorityStyle = priorityConfig[task.priority] || priorityConfig.medium;

  // Style Status
  const statusConfig = {
    pending: { label: 'To Do', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    in_progress: { label: 'In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };

  const statusStyle = statusConfig[task.status] || statusConfig.pending;

  return (
    <div className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
      isDone ? 'border-slate-200/60 bg-slate-50/40 opacity-80' : 'border-slate-200/80'
    }`}>
      {/* Top Meta Tags */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.color}`}>
            {statusStyle.label}
          </span>

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

        {/* TOmbol Aksi */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            title="Hapus Task"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
            className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors shrink-0"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5 hover:stroke-indigo-600" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h4 className={`text-base font-semibold text-slate-900 leading-snug cursor-pointer ${
              isDone ? 'line-through text-slate-400' : ''
            }`}
            onClick={() => onEdit(task)}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className={`text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 ${
                isDone ? 'text-slate-400' : ''
              }`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {formatDueDate(task.due_date, task.due_time) || 'No deadline'}
          </span>
        </div>

        {/* Quick status cycle button */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none cursor-pointer hover:bg-slate-100"
        >
          <option value="pending">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
