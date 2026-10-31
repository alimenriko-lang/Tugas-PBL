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

  // Inisialisasi view awal berdasarkan URL pathname & query params
  const [authView, setAuthView] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      const oauthToken = searchParams.get('oauth_token');
      const pathname = window.location.pathname;

      if (searchParams.get('resetToken') || searchParams.get('token')) {
        return 'reset-password';
      }

      // Jika ada token OAuth atau view=dashboard, LANGSUNG MASUK KE DASHBOARD
      if (oauthToken || viewParam === 'dashboard') {
        return 'dashboard';
      }

      if (viewParam === 'register' || pathname === '/register') {
        return 'register';
      }

      if (viewParam === 'login' || pathname === '/login') {
        return 'login';
      }

      if (pathname === '/dashboard') {
        return 'dashboard';
      }

      // Jika sudah ada token login di localStorage, default langsung ke dashboard
      if (localStorage.getItem('taskflow_token')) {
        return 'dashboard';
      }

      return 'landing';
    } catch {
      return 'landing';
    }
  });

  // Ketika user berhasil login / register, pastikan langsung masuk ke dashboard bukan ke landing page
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    const oauthToken = searchParams.get('oauth_token');

    if (user) {
      if (authView === 'login' || authView === 'register' || viewParam === 'dashboard' || oauthToken) {
        setAuthView('dashboard');
      }
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

  // Tampilkan Halaman Reset Password jika ada token
  if (authView === 'reset-password' && resetToken) {
    return (
      <ResetPassword
        token={resetToken}
        onSuccess={() => setAuthView('login')}
        onBackToLogin={() => setAuthView('login')}
      />
    );
  }

  // Tampilkan Halaman Lupa Password
  if (authView === 'forgot-password') {
    return (
      <ForgotPassword
        onBackToLogin={() => setAuthView('login')}
      />
    );
  }

  // Tampilkan Halaman Register
  if (authView === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setAuthView('login')}
        onRegisterSuccess={() => setAuthView('dashboard')}
      />
    );
  }

  // Tampilkan Halaman Login
  if (authView === 'login') {
    return (
      <Login
        onSwitchToRegister={() => setAuthView('register')}
        onSwitchToForgotPassword={() => setAuthView('forgot-password')}
        onLoginSuccess={() => setAuthView('dashboard')}
      />
    );
  }

  // Jika user sudah login dan berada di dashboard, tampilkan Dashboard
  if (user && authView === 'dashboard') {
    return <Dashboard />;
  }

  // Default: Landing Page TaskEco
  return (
    <LandingPage
      user={user}
      onStart={() => {
        if (user) {
          setAuthView('dashboard');
        } else {
          setAuthView('register');
        }
      }}
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
