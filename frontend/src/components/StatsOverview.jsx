import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats = { total: 0, pending: 0, in_progress: 0, completed: 0 } }) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const cards = [
    {
      title: 'Pending & To Do',
      value: stats.pending,
      subtitle: `${stats.pending} task perlu diselesaikan`,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'In Progress',
      value: stats.in_progress,
      subtitle: `${stats.in_progress} task sedang berjalan`,
      icon: ListTodo,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Completed',
      value: stats.completed,
      subtitle: `${stats.completed} task berhasil selesai`,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {card.title}
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                {card.value}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {card.subtitle}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.bgColor} ${card.borderColor} ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
