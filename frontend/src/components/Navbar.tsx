'use client';

import Link from 'next/link';
import { Brain, Menu, X, LogOut, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokenManager } from '@/services/api';
import { useRouter } from 'next/navigation';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative w-14 h-7 rounded-full border transition-colors duration-300 flex items-center px-1 shrink-0 ${
        dark
          ? 'bg-slate-800 border-slate-600'
          : 'bg-slate-100 border-slate-200'
      }`}
    >
      {/* sliding knob */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
          dark ? 'bg-slate-900 ml-auto' : 'bg-white'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {dark ? (
            <motion.span key="sun"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sun className="w-3 h-3 text-amber-400" />
            </motion.span>
          ) : (
            <motion.span key="moon"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Moon className="w-3 h-3 text-slate-500" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setIsAuthenticated(tokenManager.isAuthenticated());
  }, []);

  const handleLogout = () => {
    tokenManager.removeToken();
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard',  label: t?.nav?.dashboard  || 'Dashboard' },
    { href: '/assessment', label: t?.nav?.assessment  || 'Assessment' },
    { href: '/history',    label: t?.nav?.history     || 'History' },
    { href: '/checkin',    label: t?.nav?.checkin     || 'Check-in' },
    { href: '/games',      label: t?.nav?.games       || 'Games' },
    { href: '/chat',       label: t?.nav?.aiChat      || 'AI Chat' },
    { href: '/breathe',    label: t?.nav?.breathe     || 'Breathe' },
    { href: '/ambient',    label: t?.nav?.ambient     || 'Ambient' },
    { href: '/resources',  label: t?.nav?.resources   || 'Resources' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border/30 dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg sm:text-xl tracking-tight text-primary flex items-center gap-2">
          <Brain className="responsive-icon" />
          <span className="hidden min-[480px]:inline">Mentalport</span>
          <span className="min-[480px]:hidden">MP</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs xl:text-sm font-semibold text-foreground hover:text-primary transition-all duration-300 px-2 py-1 rounded-md hover:bg-primary/10 whitespace-nowrap dark:hover:bg-primary/20"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSelector />
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-xs xl:text-sm font-semibold text-foreground hover:text-red-500 transition-all duration-300 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 whitespace-nowrap"
            >
              <LogOut className="w-3 h-3 xl:w-4 xl:h-4" />
              {t?.nav?.logout || 'Logout'}
            </button>
          ) : (
            <Link
              href="/auth"
              className="text-xs xl:text-sm font-bold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-2 xl:px-6 xl:py-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-md whitespace-nowrap"
            >
              {t?.nav?.signIn || 'Sign In'}
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <button
            className="p-2 touch-target"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden glass border-t border-border/30 dark:border-white/10"
          >
            <div className="p-6 flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    className="text-base font-semibold text-foreground hover:text-primary transition-all duration-200 px-4 py-3 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 touch-target flex items-center gap-3 w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full opacity-70" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-border/30 dark:border-white/10">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="text-base font-semibold text-foreground hover:text-red-500 transition-all duration-200 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-3 touch-target w-full justify-center"
                  >
                    <LogOut className="w-5 h-5" />
                    {t?.nav?.logout || 'Logout'}
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    className="text-base font-bold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-6 py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg touch-target w-full text-center flex items-center justify-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    {t?.nav?.signIn || 'Sign In'}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
