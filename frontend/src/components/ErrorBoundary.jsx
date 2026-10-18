import React from 'react';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Terjadi Kesalahan Tampilan
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Aplikasi mengalami kendala saat memuat antarmuka. Anda dapat menyegarkan halaman atau mengatur ulang sesi login Anda.
            </p>
            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-600 text-left overflow-x-auto border border-slate-200">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset Sesi</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
