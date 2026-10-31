import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Check,
  ListTodo,
  BarChart3,
  CalendarDays,
  Tag,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  ArrowRight,
  Menu,
  Shield,
  Loader2,
  Users,
  TrendingUp,
  Bot,
  Layers,
  Sparkles,
} from 'lucide-react';
import dashboardPreviewImg from '../assets/dashboard-preview.png';
import taskecoLogo from '../assets/taskeco-logo.png';
import { API_BASE_URL } from '../services/api.mjs';

// ─── Logo Component ──────────────────────────────────────────────────────────
function Logo({ white = false }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="flex items-center justify-center w-9 h-9 shrink-0">
        <img
          src={taskecoLogo}
          alt="TaskEco Logo"
          className="w-full h-full object-contain select-none"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-xl font-bold tracking-tight ${white ? 'text-white' : 'text-slate-900'}`}>
          TaskEco
        </span>
        <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-indigo-100/80 text-indigo-600 border border-indigo-200/50">
          DEMO
        </span>
      </div>
    </div>
  );
}

// ─── Navbar Component ────────────────────────────────────────────────────────
function Navbar({ user, onStart, onLogin, onRegister, onGoToDashboard }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Fitur', href: '#features' },
    { label: 'Cara Kerja', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
          : 'bg-white/70 backdrop-blur-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}>
          <Logo />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollToSection(link.href)}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onGoToDashboard}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onLogin}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onRegister}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer"
              >
                Register
              </motion.button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden bg-white border-t border-slate-100 shadow-xl px-4 py-4 space-y-2"
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); onGoToDashboard(); }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer text-center"
                >
                  Buka Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); onLogin(); }}
                    className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600 text-sm font-semibold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); onRegister(); }}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ user, onStart, onLogin, onGoToDashboard }) {
  const scrollToFeatures = () => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/50 via-slate-50/60 to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Feature Pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 text-xs font-semibold text-indigo-700 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>TaskEco Application</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Atur Tugas,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              Capai Tujuan.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Kelola dan monitor progres tugas Anda secara terorganisir dan efisien.
            Dari perencanaan to-do list harian hingga visualisasi kalender tugas bulanan dalam satu ruang kerja modern.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200/80 transition-all group cursor-pointer"
          >
            <span>{user ? 'Lanjutkan ke Dashboard' : 'Mulai Sekarang'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

          {user ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all group cursor-pointer"
            >
              Lihat Ruang Kerja Anda
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onLogin}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all group cursor-pointer"
            >
              Login
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={scrollToFeatures}
            className="w-full sm:w-auto px-6 py-3.5 text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors cursor-pointer"
          >
            Pelajari Fitur ↓
          </motion.button>
        </motion.div>

        {/* Application Preview (Using Real TaskEco Dashboard Screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200/50 via-violet-200/40 to-indigo-100/50 rounded-3xl blur-2xl -z-10" />

          {/* Browser Mockup Window */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-indigo-100/70 overflow-hidden">
            {/* Browser Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              </div>

              <div className="max-w-xs sm:max-w-md w-full mx-4">
                <div className="bg-white border border-slate-200/80 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-500 text-center truncate select-none">
                  https://taskeco.app/dashboard
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span className="hidden sm:inline">Live Preview</span>
              </div>
            </div>

            {/* Actual Screenshot Content */}
            <div className="relative bg-[#f8fafc]">
              <img
                src={dashboardPreviewImg}
                alt="Preview Dashboard TaskEco"
                className="w-full h-auto object-cover block select-none"
                loading="eager"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: ListTodo,
      color: 'bg-indigo-50 text-indigo-600',
      badge: 'Manajemen',
      title: 'Manajemen Tugas Lengkap',
      desc: 'Buat, edit, dan hapus tugas dengan deskripsi lengkap. Tandai tugas selesai dengan sekali klik dan nikmati alur kerja terstruktur.',
    },
    {
      icon: Tag,
      color: 'bg-rose-50 text-rose-600',
      badge: 'Prioritas',
      title: 'Prioritas Tugas Terarah',
      desc: 'Beri label prioritas High, Medium, atau Low pada setiap tugas untuk memastikan Anda selalu menyelesaikan hal terpenting lebih dahulu.',
    },
    {
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      badge: 'Tenggat Waktu',
      title: 'Deadline & Tenggat Waktu',
      desc: 'Atur due date secara presisi. Sistem menyortir tugas mendatang dan menandai tugas yang mendekati batas waktu agar tidak terlewat.',
    },
    {
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
      badge: 'Status',
      title: 'Status Tugas Real-time',
      desc: 'Transisi status fleksibel mulai dari Pending & To Do, In Progress, hingga Completed dengan filter instan untuk setiap tahap tugas.',
    },
    {
      icon: CalendarDays,
      color: 'bg-indigo-50 text-indigo-600',
      badge: 'Kalender',
      title: 'Kalender Tugas Interaktif',
      desc: 'Navigasi kalender bulanan terintegrasi langsung dengan database MySQL. Warna indikator membedakan status tugas pada setiap tanggal.',
    },
    {
      icon: BarChart3,
      color: 'bg-violet-50 text-violet-600',
      badge: 'Analitik',
      title: 'Dashboard Produktivitas',
      desc: 'Metrik statistik otomatis menghitung total tugas, progres pengerjaan, dan tingkat efisiensi persentase penyelesaian secara real-time.',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Fitur Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Dirancang untuk Efisiensi dan Kemudahan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Setiap fitur di TaskEco dibangun dengan fokus pada kemudahan penggunaan tanpa beban fitur yang berlebihan.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${feat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  {feat.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ─────────────────────────────────────────────────────
function HowItWorksSection({ onStart }) {
  const steps = [
    {
      num: '01',
      title: 'Buat Akun Anda',
      desc: 'Daftar gratis melalui email atau gunakan login sekali klik dengan Google OAuth / GitHub OAuth yang aman.',
    },
    {
      num: '02',
      title: 'Tambahkan Tugas & Kategori',
      desc: 'Tulis tugas baru, tentukan kategori (Work Projects, Learning, Health), tentukan prioritas, dan pilih tanggal deadline.',
    },
    {
      num: '03',
      title: 'Pantau & Selesaikan Progres',
      desc: 'Perbarui status menjadi In Progress atau Selesai, lalu pantau persentase tingkat efisiensi di dashboard dan kalender.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Alur Penggunaan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Cara Kerja Sederhana, Hasil Maksimal
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Mulai kelola pekerjaan Anda hanya dalam beberapa menit tanpa setup rumit.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Left: 3 Steps */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((st, idx) => (
              <motion.div
                key={st.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex items-start gap-4 hover:border-indigo-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs shadow-indigo-200">
                  {st.num}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Workspace Card (Matching user screenshot style) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xl shadow-indigo-100/50 relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    Ruang kerjamu
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                    Satu langkah lebih maju
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              {/* Task Items in Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Tulis daftar tugas
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Tentukan prioritas
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-slate-500">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      Lanjutkan pekerjaan
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onStart}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Mulai Atur Tugas Anda
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Apa itu TaskEco dan siapa yang cocok menggunakannya?',
      a: 'TaskEco adalah aplikasi To-Do List dan Task Manager modern yang dirancang untuk individu, profesional, dan tim yang ingin mengelola daftar pekerjaan, memantau tenggat waktu, dan melihat produktivitas secara terstruktur.',
    },
    {
      q: 'Bagaimana cara mendaftar dan masuk ke akun?',
      a: 'Anda dapat mendaftar menggunakan formulir email dan kata sandi, atau langsung masuk menggunakan tombol Google OAuth 2.0 dan GitHub OAuth yang telah terintegrasi tanpa perlu mengisi data secara manual.',
    },
    {
      q: 'Bagaimana TaskEco memisahkan data antar pengguna?',
      a: 'Data setiap pengguna disimpan secara terisolasi di database MySQL berdasarkan user ID yang terverifikasi melalui JWT token. Anda hanya dapat melihat, menambah, mengedit, dan menghapus tugas milik akun Anda sendiri.',
    },
    {
      q: 'Bagaimana cara menggunakan fitur Kalender Tugas?',
      a: 'Klik tombol mengambang berikon kalender di pojok kanan bawah dashboard. Panel kalender akan menampilkan tugas berdasarkan kolom deadline (due_date) dengan warna kuning (Pending), ungu (In Progress), dan hijau (Selesai).',
    },
    {
      q: 'Apakah TaskEco nyaman digunakan di layar HP / mobile?',
      a: 'Ya, seluruh antarmuka TaskEco responsif. Pada perangkat mobile, sidebar otomatis berubah menjadi drawer menu yang dapat dibuka/tutup dengan tombol hamburger, kartu tugas tertata rapi, dan tidak ada overflow horizontal.',
    },
    {
      q: 'Bagaimana jika saya lupa kata sandi akun lokal saya?',
      a: 'Gunakan tautan "Lupa password?" di halaman Login. Sistem akan membuatkan token reset kriptografis yang aman dan memungkinkan Anda mengatur kata sandi baru yang langsung dienkripsi dengan bcrypt.',
    },
  ];

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Jawaban lengkap seputar cara kerja, fitur, dan keamanan aplikasi TaskEco.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${
                  isOpen
                    ? 'border-indigo-200 bg-indigo-50/20 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-slate-800 pr-4">
                    {faq.q}
                  </span>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="faq-content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-indigo-100/60 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatusMsg({ type: 'error', text: 'Semua kolom formulir wajib diisi.' });
      return;
    }

    if (formData.message.trim().length < 10) {
      setStatusMsg({ type: 'error', text: 'Pesan minimal berisi 10 karakter.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/landing/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirim pesan ke server.');
      }

      setStatusMsg({
        type: 'success',
        text: data.message || 'Pesan Anda telah berhasil diterima oleh server TaskEco.',
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Terjadi gangguan jaringan saat menghubungi server backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Hubungi Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Kirimkan Masukan & Pertanyaan
          </h2>
          <p className="text-slate-600 text-sm">
            Formulir ini akan mengirimkan pesan Anda ke email TaskEco. Kami akan meninjau dan merespons pertanyaan atau saran Anda secepat mungkin.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8"
        >
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-5 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              <span>{statusMsg.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{statusMsg.text}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pesan / Pertanyaan
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tuliskan pertanyaan atau saran Anda mengenai TaskEco..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan Pesan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan Sekarang</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

// Helper format teks bold markdown
function formatChatMessage(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ─── AI Chatbot Component ─────────────────────────────────────────────────────
function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Halo! 👋 Saya Asisten AI TaskEco. Ada yang bisa saya bantu terkait fitur manajemen tugas, kalender, atau penggunaan TaskEco?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const newMsgs = [...messages, { role: 'user', text }];
    setMessages(newMsgs);
    setInputMessage('');
    setLoading(true);

    try {
      const history = newMsgs.slice(-8);
      const res = await fetch(`${API_BASE_URL}/landing/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorText =
          data.message ||
          (res.status === 503
            ? 'AI Chatbot memerlukan GEMINI_API_KEY di file .env backend untuk beroperasi.'
            : 'Maaf, terjadi kesalahan saat memproses jawaban AI.');
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: `⚠️ ${errorText}` },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', text: data.reply || 'Jawaban tidak dapat dimuat.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: '⚠️ Tidak dapat terhubung ke server backend TaskEco. Silakan periksa koneksi Anda.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Apa saja fitur utama TaskEco?',
    'Bagaimana cara kerja kalender tugas?',
    'Cara login pakai Google & GitHub?',
  ];

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xl shadow-indigo-300 flex items-center justify-center transition-colors cursor-pointer group"
        aria-label="Buka AI Chatbot TaskEco"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </>
        )}
      </motion.button>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-w-sm bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden max-h-[580px] h-[520px]"
          >
            {/* Chat Header */}
            <div className="bg-indigo-600 px-4 py-3.5 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">AI Assistant TaskEco</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Google Gemini AI</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#f8fafc]/80 text-xs">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{formatChatMessage(m.text)}</div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-slate-500 flex items-center gap-2 shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>AI sedang merespons...</span>
                  </div>
                </motion.div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Quick Questions (if few messages) */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                {quickQuestions.map((q) => (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-full shrink-0 transition-colors cursor-pointer"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ketik pertanyaan tentang TaskEco..."
                  disabled={loading}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-200 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Footer Component ────────────────────────────────────────────────────────
function Footer({ onLogin, onRegister }) {
  const scrollToSection = (href) => {
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Bio */}
          <div className="md:col-span-2">
            <Logo white />
            <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-sm leading-relaxed">
              TaskEco adalah aplikasi To-Do List dan Task Management modern dengan autentikasi aman,
              visualisasi kalender tugas, dan pelacakan produktivitas real-time.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 box bg-emerald-100"></span>
              <span>Dibawah ini akan diisi instagram dan email pembuat</span>
              <span className="w-2 h-2 box bg-emerald-100"></span>
            </div>
          </div>

          {/* Column 2: Navigasi */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#home')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#features')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Fitur Unggulan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#how-it-works')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Cara Kerja
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#faq')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#contact')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Kontak
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Autentikasi & Akun */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Akses Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onLogin}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Masuk (Login)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onRegister}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Daftar Akun Baru (Register)
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Mendukung Login Email, Google OAuth & GitHub OAuth
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TaskEco. All rights reserved.</p>
          <p>Dibuat pada tanggal 22 September 2026</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main LandingPage Component ───────────────────────────────────────────────
export default function LandingPage({
  user,
  onStart,
  onLogin,
  onRegister,
  onGoToDashboard,
}) {
  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* 1. Navbar */}
      <Navbar
        user={user}
        onStart={onStart}
        onLogin={onLogin}
        onRegister={onRegister}
        onGoToDashboard={onGoToDashboard}
      />

      {/* 2. Hero Section */}
      <HeroSection
        user={user}
        onStart={onStart}
        onLogin={onLogin}
        onGoToDashboard={onGoToDashboard}
      />

      {/* 3. Fitur Unggulan */}
      <FeaturesSection />

      {/* 4. Cara Kerja */}
      <HowItWorksSection onStart={onStart} />

      {/* 5. FAQ */}
      <FAQSection />

      {/* 6. Contact */}
      <ContactSection />

      {/* 8. Footer */}
      <Footer onLogin={onLogin} onRegister={onRegister} />

      {/* 7. AI Chatbot Floating */}
      <AIChatbot />
    </div>
  );
}
