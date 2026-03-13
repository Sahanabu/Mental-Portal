import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className="antialiased">
      <body className={`${inter.className} min-h-screen ambient-gradient-bg flex flex-col`}>
        <Navbar />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
