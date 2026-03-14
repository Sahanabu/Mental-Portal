'use client';

import Link from 'next/link';
import { Brain, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tokenManager } from '@/services/api';
import { useRouter } from 'next/navigation';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setIsAuthenticated(tokenManager.isAuthenticated());
  }, []);

  // Update nav items when language changes
  useEffect(() => {
    // Force re-render when translations load
  }, [t]);

  const handleLogout = () => {
    tokenManager.removeToken();
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  // Define navItems inside component to use latest translations
  const navItems = [
    { href: '/dashboard', label: t?.nav?.dashboard || 'Dashboard' },
    { href: '/assessment', label: t?.nav?.assessment || 'Assessment' },
    { href: '/history', label: t?.nav?.history || 'History' },
    { href: '/checkin', label: t?.nav?.checkin || 'Check-in' },
    { href: '/chat', label: t?.nav?.aiChat || 'AI Chat' },
    { href: '/breathe', label: t?.nav?.breathe || 'Breathe' },
    { href: '/ambient', label: t?.nav?.ambient || 'Ambient' },
    { href: '/resources', label: t?.nav?.resources || 'Resources' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-green-100/30">
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
              className="text-xs xl:text-sm font-semibold hover:text-primary transition-all duration-300 px-2 py-1 rounded-md hover:bg-primary/10 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSelector />
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-xs xl:text-sm font-semibold hover:text-red-600 transition-all duration-300 px-3 py-2 rounded-md hover:bg-red-50 flex items-center gap-1 whitespace-nowrap"
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

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSelector />
          <button 
            className="p-2 touch-target"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden glass border-t border-green-100/30 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-base font-semibold hover:text-primary transition-all duration-300 px-4 py-3 rounded-lg hover:bg-primary/10 touch-target flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-2 h-2 bg-primary rounded-full opacity-70" />
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-4 pt-4 border-t border-green-100/30">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="text-base font-semibold hover:text-red-600 transition-all duration-300 px-4 py-3 rounded-lg hover:bg-red-50 flex items-center gap-3 touch-target w-full justify-center"
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
        </div>
      )}
    </nav>
  );
}
