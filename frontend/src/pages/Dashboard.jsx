import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Filter,
  Search,
  Zap,
  CheckCircle,
  Inbox,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatsOverview from '../components/StatsOverview';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { taskService } from '../services/api.mjs';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [activeCoreFilter, setActiveCoreFilter] = useState('all'); // all, today, upcoming, completed
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Fetch tasks and stats
  const fetchData = useCallback(async () => {
    try {
      setError('');
      // Prepare backend filter
      const filters = {};
      if (searchInput.trim()) filters.search = searchInput.trim();
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (activeCategory !== 'all') filters.category = activeCategory;

      // Handle Core Sidebar filters
      if (activeCoreFilter === 'completed') {
        filters.status = 'completed';
      } else if (activeCoreFilter === 'today') {
        filters.status = 'pending';
      } else if (activeCoreFilter === 'upcoming') {
        filters.status = 'in_progress';
      }

      const [tasksRes, statsRes] = await Promise.all([
        taskService.getTasks(filters),
        taskService.getStats()
      ]);

      setTasks(tasksRes.tasks || []);
      setStats(statsRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Gagal memuat data task.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchInput, statusFilter, priorityFilter, activeCategory, activeCoreFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Create or Update
  const handleSaveTask = async (taskData) => {
    if (editingTask && editingTask.id) {
      await taskService.updateTask(editingTask.id, taskData);
    } else {
      await taskService.createTask(taskData);
    }
    fetchData();
  };

  // Handle Quick Status Change
  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      await taskService.updateTask(taskId, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await taskService.deleteTask(deletingTask.id);
      setDeletingTask(null);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus task: ' + err.message);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <Sidebar
        activeFilter={activeCoreFilter}
        setActiveFilter={(filter) => {
          setActiveCoreFilter(filter);
          setStatusFilter('all');
        }}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        stats={stats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar
          onOpenCreateModal={openCreateModal}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />

        {/* Page Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Banner / Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Task Dashboard</span>
                {activeCategory !== 'all' && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {activeCategory}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kelola dan monitor progres tugas Anda secara terorganisir dan efisien.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  fetchData();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tambah Tugas</span>
              </button>
            </div>
          </div>

          {/* Metrics Stats Row */}
          <StatsOverview stats={stats} />

          {/* Filters & Control Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {[
                { id: 'all', label: 'All Status' },
                { id: 'pending', label: 'To Do' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStatusFilter(s.id);
                    setActiveCoreFilter('all');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    statusFilter === s.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Priority and Category Filters */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tasks List Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Recent Tasks ({tasks.length})
              </h2>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-xs text-slate-400 mt-3 font-medium">Memuat data task...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  Tidak ada task yang ditemukan
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchInput || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Coba sesuaikan kata kunci pencarian atau reset filter di atas.'
                    : 'Mulai produktivitas Anda sekarang dengan menambahkan task baru pertama Anda.'}
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Tambah Task Baru</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditModal}
                    onDelete={(t) => setDeletingTask(t)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button (⚡) - Matches Screenshot 3 & 4 */}
      <button
        type="button"
        onClick={openCreateModal}
        title="Quick Create Task"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xl shadow-indigo-400/50 flex items-center justify-center transition-all z-30 group cursor-pointer"
      >
        <Zap className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
      </button>

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        onDelete={(task) => {
          setIsModalOpen(false);
          setDeletingTask(task);
        }}
        initialTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTask?.title || ''}
      />
    </div>
  );
}
