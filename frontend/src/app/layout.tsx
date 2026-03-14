import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CalmBackground } from '@/components/CalmBackground';

const inter = Inter({ subsets: ['latin'] });

import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Mentalport | Mental Wellness',
  description: 'Mental Wellness Self-Assessment Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        {/* Blocking script — prevents flash of wrong theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var t=localStorage.getItem('theme');
              if(!t) t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
              if(t==='dark') document.documentElement.classList.add('dark');
            }catch(e){}
          })()
        ` }} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <CalmBackground />
            <Navbar />
            <main className="flex-1 pt-14 sm:pt-16 relative" style={{ zIndex: 2 }}>
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
