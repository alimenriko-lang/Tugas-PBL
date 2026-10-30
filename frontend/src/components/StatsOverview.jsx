import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats = { total: 0, pending: 0, in_progress: 0, completed: 0 } }) {
  const safeStats = stats || { total: 0, pending: 0, in_progress: 0, completed: 0 };
  const total = Number(safeStats.total) || 0;
  const completed = Number(safeStats.completed) || 0;
  const pending = Number(safeStats.pending) || 0;
  const in_progress = Number(safeStats.in_progress) || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards = [
    {
      title: 'Pending & To Do',
      value: pending,
      subtitle: `${pending} task perlu diselesaikan`,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'In Progress',
      value: in_progress,
      subtitle: `${in_progress} task sedang berjalan`,
      icon: ListTodo,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Completed',
      value: completed,
      subtitle: `${completed} task berhasil selesai`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Tingkat Efisiensi',
      value: `${completionRate}%`,
      subtitle: 'Tingkat penyelesaian',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="min-w-0 pr-2">
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-400 uppercase truncate">
                {card.title}
              </p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mt-0.5 sm:mt-1 truncate">
                {card.value}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">
                {card.subtitle}
              </p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.bgColor} ${card.borderColor} ${card.color}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
