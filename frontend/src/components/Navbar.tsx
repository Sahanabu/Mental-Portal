'use client';

import Link from 'next/link';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="text-xs xl:text-sm font-medium hover:text-primary transition-colors touch-target"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth" className="text-xs xl:text-sm font-medium hover:text-primary transition-colors touch-target">
            Sign In
          </Link>
          <Link 
             href="/assessment" 
             className="text-xs xl:text-sm font-medium bg-primary text-primary-foreground px-3 py-2 xl:px-4 xl:py-2 rounded-full hover:bg-primary/90 transition-colors touch-target"
          >
            Get Started
          </Link>
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
        <div className="lg:hidden glass border-t border-green-100/30 p-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-sm font-medium hover:text-primary transition-colors py-2 touch-target"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-green-100/30">
              <Link 
                href="/auth" 
                className="text-sm font-medium hover:text-primary transition-colors touch-target text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                href="/assessment" 
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors touch-target text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
