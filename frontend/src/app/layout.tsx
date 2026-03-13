import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';

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
      <body className={`${inter.className} min-h-screen ambient-gradient-bg flex flex-col`} suppressHydrationWarning>
        <LanguageProvider>
          <Navbar />
          <main className="flex-1 pt-14 sm:pt-16 pb-8 sm:pb-12 relative overflow-auto">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
