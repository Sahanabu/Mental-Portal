'use client';

import Link from 'next/link';
import { Brain, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tokenManager } from '@/services/api';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

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
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/assessment', label: 'Assessment' },
    { href: '/history', label: 'History' },
    { href: '/checkin', label: 'Check-in' },
    { href: '/chat', label: 'AI Chat' },
    { href: '/breathe', label: 'Breathe' },
    { href: '/ambient', label: 'Ambient' },
    { href: '/resources', label: 'Resources' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-green-100/30">
      <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg sm:text-xl tracking-tight text-primary flex items-center gap-2">
          <Brain className="responsive-icon" />
          <span className="hidden xs:inline">Mentalport</span>
          <span className="xs:hidden">MP</span>

        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 md:gap-4 lg:gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="text-sm md:text-base font-semibold hover:text-primary transition-all duration-300 px-2 py-1 rounded-md hover:bg-primary/10 touch-target"
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-sm md:text-base font-semibold hover:text-red-600 transition-all duration-300 px-3 py-2 rounded-md hover:bg-red-50 flex items-center gap-2 touch-target"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <>
              <Link href="/auth" className="text-sm md:text-base font-semibold hover:text-primary transition-all duration-300 px-3 py-2 rounded-md hover:bg-primary/10 touch-target">
                Sign In
              </Link>
              <Link 
                href="/assessment" 
                className="text-sm md:text-base font-bold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-6 py-2 md:px-8 md:py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-md touch-target"
              >
                Start Assessment
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 touch-target"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-green-100/30 p-6 backdrop-blur-md">
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
                  Logout
                </button>
              ) : (
                <>
                  <Link 
                    href="/auth" 
                    className="text-base font-semibold hover:text-primary transition-all duration-300 px-4 py-3 rounded-lg hover:bg-primary/10 touch-target w-full text-center flex items-center justify-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Link>
                  <Link 
                    href="/assessment" 
                    className="text-base font-bold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-6 py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg touch-target w-full text-center flex items-center justify-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start Free Assessment
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
