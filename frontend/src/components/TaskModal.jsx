import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag, Trash2, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialTask = null
}) {
  const { user } = useAuth();
  const isEditing = Boolean(initialTask && initialTask.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work Projects');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('10:00 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate data saat modal dibuka
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategory(initialTask.category || 'Work Projects');
      setPriority(initialTask.priority || 'medium');
      setStatus(initialTask.status || 'pending');
      
      // format due date YYYY-MM-DD
      if (initialTask.due_date) {
        const d = new Date(initialTask.due_date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDueDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setDueDate('');
      }

      setDueTime(initialTask.due_time || '10:00 AM');
    } else {
      // reset default untuk create task
      setTitle('');
      setDescription('');
      setCategory('Work Projects');
      setPriority('medium');
      setStatus('pending');
      
      // Default date to today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
      setDueTime('10:00 AM');
    }
    setError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul Task wajib diisi!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        due_date: dueDate || null,
        due_time: dueTime || null
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {isEditing ? 'Edit Tugas' : 'Buat Tugas Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEditing
                ? 'Perbarui detail tugas dan linimasa'
                : 'Tambahkan tugas baru ke ruang kerja Anda'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifikasi error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul Task */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Judul Tugas <span className="text-rose-500">*</span>
              </label>
              {isEditing && (
                <span className="text-[11px] text-slate-400">Required</span>
              )}
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis Judul disini...."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan decription disini, tidak terbatas beda sama judul..... mempunyai batas 150 karakter...."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
            />
          </div>

          {/* Kolom Satu : Kategori & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Work Projects">🟣 Work Projects</option>
                <option value="Learning & Growth">🔵 Learning & Growth</option>
                <option value="Personal Health">🟢 Personal Health</option>
                <option value="General">⚪ General</option>
              </select>
            </div>

            {/* Toggle Prioritas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prioritas
              </label>
              <div className="flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    priority === 'low'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Rendah
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                    priority === 'medium'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  Sedang
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                    priority === 'high'
                      ? 'bg-rose-100 text-rose-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Flag className="w-3 h-3 fill-current" />
                  Tinggi
                </button>
              </div>
            </div>
          </div>

          {/* Kolom 2 : Status & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Status Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <div className="flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    status === 'pending'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  To Do
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('in_progress')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    status === 'in_progress'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  In Prog
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Waktu & Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isEditing ? 'Linimasa Tenggat' : 'Tanggal & Waktu tenggat'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="relative rounded-xl bg-slate-50/70 border border-slate-200">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-2 pr-1 py-1.5 bg-transparent text-[11px] font-medium text-slate-700 outline-none"
                  />
                </div>
                <div className="relative rounded-xl bg-slate-50/70 border border-slate-200">
                  <input
                    type="text"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-2 py-1.5 bg-transparent text-[11px] font-medium text-slate-700 outline-none text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Aktivitas Log (di dalam mode edit) */}
          {isEditing && (
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Terakhir diubah baru-baru ini oleh <strong className="text-slate-700">{user?.name || 'Alex Chen'}</strong>
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium cursor-pointer hover:underline">
                View log
              </span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
            {/* Tombol hapus di sebelah kiri saat mengedit */}
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(initialTask);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Task</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-75 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </>
                ) : (
                  <>
                    <span>+</span>
                    <span>{loading ? 'Membuat...' : 'Membuat Task'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
