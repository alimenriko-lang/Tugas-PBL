import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();

  // Inisialisasi token dari URL parameter (?resetToken=... atau ?token=...)
  const [resetToken, setResetToken] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('resetToken') || searchParams.get('token') || '';
    } catch {
      return '';
    }
  });

  // Inisialisasi view awal berdasarkan URL pathname & params
  const [authView, setAuthView] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;

      if (searchParams.get('resetToken') || searchParams.get('token')) {
        return 'reset-password';
      }
      if (pathname === '/login') return 'login';
      if (pathname === '/register') return 'register';
      if (pathname === '/dashboard') return 'dashboard';
      return 'landing';
    } catch {
      return 'landing';
    }
  });

  // Jika user baru login dari form login/register, arahkan ke dashboard
  useEffect(() => {
    if (user && (authView === 'login' || authView === 'register')) {
      setAuthView('dashboard');
    }
  }, [user, authView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wide">
          Memuat TaskEco...
        </p>
      </div>
    );
  }

  // Handler tombol "Mulai Sekarang" (ke Dashboard jika login, ke Register jika belum)
  const handleStartNow = () => {
    if (user) {
      setAuthView('dashboard');
    } else {
      setAuthView('register');
    }
  };

  // State-based routing
  if (authView === 'dashboard' && user) {
    return <Dashboard onBackToLanding={() => setAuthView('landing')} />;
  }

  if (authView === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setAuthView('login')}
        onSwitchToLanding={() => setAuthView('landing')}
      />
    );
  }

  if (authView === 'forgot-password') {
    return (
      <ForgotPassword
        onSwitchToLogin={() => setAuthView('login')}
        onProceedToReset={(token) => {
          setResetToken(token);
          setAuthView('reset-password');
        }}
      />
    );
  }

  if (authView === 'reset-password') {
    return (
      <ResetPassword
        initialToken={resetToken}
        onSwitchToLogin={() => setAuthView('login')}
        onSwitchToForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  if (authView === 'login') {
    return (
      <Login
        onSwitchToRegister={() => setAuthView('register')}
        onSwitchToForgotPassword={() => setAuthView('forgot-password')}
        onSwitchToLanding={() => setAuthView('landing')}
      />
    );
  }

  // Default: Landing Page
  return (
    <LandingPage
      user={user}
      onStart={handleStartNow}
      onLogin={() => setAuthView('login')}
      onRegister={() => setAuthView('register')}
      onGoToDashboard={() => setAuthView('dashboard')}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
