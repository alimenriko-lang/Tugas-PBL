import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';

// Format YYYY-MM-DD dari Date atau string
const normalizeDateKey = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function TaskCalendarModal({
  isOpen,
  onClose,
  tasks = [],
  onEditTask,
  onCreateTaskForDate
}) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => normalizeDateKey(today), [today]);

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth()); // 0 - 11
  const [selectedDate, setSelectedDate] = useState(() => todayStr);

  // Group tasks by due_date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.due_date) return;
      const key = normalizeDateKey(task.due_date);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  // Tasks for selected date
  const selectedDateTasks = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  if (!isOpen) return null;

  // Navigasi Bulan
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Generate Hari dalam Kalender
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];

  // 1. Hari dari bulan sebelumnya
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      month: prevMonth,
      year: prevYear,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // 2. Hari dalam bulan ini
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // 3. Hari dari bulan berikutnya untuk melengkapi kelipatan 7
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      month: nextMonth,
      year: nextYear,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Helper tentukan warna task
  const getTaskColorBadge = (task) => {
    const isCompleted = task.status === 'completed';
    const taskDate = normalizeDateKey(task.due_date);
    const isOverdue = !isCompleted && taskDate && taskDate < todayStr;

    if (isOverdue) {
      return {
        label: 'Terlambat',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        border: 'border-l-rose-500'
      };
    }
    if (isCompleted) {
      return {
        label: 'Completed',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        border: 'border-l-emerald-500'
      };
    }
    if (task.status === 'in_progress') {
      return {
        label: 'In Progress',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-600',
        border: 'border-l-indigo-600'
      };
    }
    return {
      label: 'Pending',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-400',
      border: 'border-l-amber-400'
    };
  };

  // Format tanggal deskriptif untuk panel detail (e.g. "Selasa, 20 Oktober 2026")
  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Kalender Tugas</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  TaskEco
                </span>
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                Pantau batas waktu (due date) dan distribusi beban kerja tugas Anda setiap bulan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup Kalender"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split into Calendar View & Selected Date Detail */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Calendar Grid (7/12 on lg) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col">
            {/* Month Navigation Controls */}
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-100 transition-colors cursor-pointer"
                  title="Bulan sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 px-2 min-w-[140px] sm:min-w-[160px] text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-100 transition-colors cursor-pointer"
                  title="Bulan berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoToToday}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Hari Ini</span>
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_NAMES.map((dayName, idx) => (
                <div
                  key={idx}
                  className={`text-[11px] font-bold py-1 uppercase tracking-wider ${
                    idx === 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1">
              {calendarCells.map((cell, idx) => {
                const cellTasks = tasksByDate[cell.dateStr] || [];
                const isSelected = cell.dateStr === selectedDate;
                const isTodayCell = cell.dateStr === todayStr;

                // Hitung status task dalam sel tanggal ini
                let hasOverdue = false;
                let hasCompleted = false;
                let hasInProgress = false;
                let hasPending = false;

                cellTasks.forEach((t) => {
                  const isDone = t.status === 'completed';
                  if (!isDone && cell.dateStr < todayStr) hasOverdue = true;
                  else if (isDone) hasCompleted = true;
                  else if (t.status === 'in_progress') hasInProgress = true;
                  else hasPending = true;
                });

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`min-h-[58px] sm:min-h-[70px] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/30'
                        : isTodayCell
                        ? 'border-indigo-300 bg-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/70'
                        : 'border-transparent bg-slate-50/40 opacity-40 hover:opacity-70'
                    }`}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-semibold rounded-md w-5 h-5 flex items-center justify-center ${
                          isTodayCell
                            ? 'bg-indigo-600 text-white font-bold'
                            : isSelected
                            ? 'text-indigo-700 font-bold'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* Task Count Badge if any */}
                      {cellTasks.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                          {cellTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Task Indicators / Dots */}
                    {cellTasks.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {hasOverdue && (
                          <span
                            title="Ada tugas terlambat"
                            className="w-2 h-2 rounded-full bg-rose-500 shrink-0"
                          />
                        )}
                        {hasPending && (
                          <span
                            title="Ada tugas pending"
                            className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                          />
                        )}
                        {hasInProgress && (
                          <span
                            title="Ada tugas in progress"
                            className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"
                          />
                        )}
                        {hasCompleted && (
                          <span
                            title="Ada tugas selesai"
                            className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda Warna Kalender */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3 sm:gap-4 flex-wrap text-[11px] text-slate-600">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Legenda:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-600 font-medium">Terlambat</span>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Date Task Detail (5/12 on lg) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Selected Date Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Detail Tugas Pada
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    {formatFullDate(selectedDate)}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => onCreateTaskForDate(selectedDate)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer shrink-0"
                  title="Tambah tugas dengan due date tanggal ini"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Task Count Info */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-white border border-slate-200/80 rounded-xl px-3 py-2">
                <span>Total tugas berjadwal:</span>
                <span className="font-semibold text-slate-800">
                  {selectedDateTasks.length} Task
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedDateTasks.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-2">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      Tidak ada tugas pada tanggal ini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                      Gunakan tombol tambah untuk menjadwalkan tugas baru dengan deadline tanggal ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => onCreateTaskForDate(selectedDate)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Tugas Tanggal Ini</span>
                    </button>
                  </div>
                ) : (
                  selectedDateTasks.map((task) => {
                    const colorBadge = getTaskColorBadge(task);
                    const isDone = task.status === 'completed';

                    return (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer border-l-4 ${colorBadge.border} group`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colorBadge.badge}`}>
                                {colorBadge.label}
                              </span>

                              {task.category && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  {task.category}
                                </span>
                              )}

                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 uppercase border border-slate-200">
                                {task.priority}
                              </span>

                              {task.due_time && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                                  <span>{task.due_time}</span>
                                </span>
                              )}
                            </div>

                            <h5 className={`text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate ${
                              isDone ? 'line-through text-slate-400' : ''
                            }`}>
                              {task.title}
                            </h5>

                            {task.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-slate-300 group-hover:text-indigo-600 transition-colors pt-1">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Quick Status Control at bottom of item */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Klik untuk edit detail</span>
                          <span className="text-[10px] text-indigo-600 font-medium group-hover:underline">
                            Buka Modal →
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Panel Info */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Hanya tugas Anda yang dimuat</span>
              <span className="text-slate-500 font-medium">TaskEco Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
