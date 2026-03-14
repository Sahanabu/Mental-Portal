'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from '@/three/Scene';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0) setScrollProgress(el.scrollTop / max);
      const section = Math.round(el.scrollTop / el.clientHeight);
      setActiveSection(Math.min(section, 3));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (index: number) => {
    scrollRef.current?.scrollTo({ top: index * (scrollRef.current.clientHeight), behavior: 'smooth' });
  };

  const sections = [
    { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 },
  ];

  return (
    /* Fixed overlay that escapes the layout's pt-14 */
    <div className="landing-root">
      {/* Particle canvas — fills entire viewport */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} style={{ width: '100%', height: '100%' }}>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Scrollable content layer */}
      <div ref={scrollRef} className="landing-scroll z-10">

        {/* ── SECTION 1: Hero ── */}
        <section className="relative flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8"
          style={{ minHeight: '100dvh' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="glass-mobile w-full max-w-[90vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6 pointer-events-auto"
          >
            {/* Eyebrow */}
            <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest text-primary/70 uppercase">
              Mental Wellness Portal
            </span>

            <h1 className="text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-primary drop-shadow-sm leading-[1.1]">
              {t?.home?.hero || 'Clarity for your'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 block sm:inline">
                {t?.home?.beautifulMind || 'Beautiful Mind'}
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-light max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed">
              {t?.home?.tagline || 'A minimalist, immersive experience to track, understand, and nurture your mental well-being.'}
            </p>


          </motion.div>

          {/* Scroll indicator */}
          <motion.button
            onClick={() => scrollTo(1)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-primary/60 hover:text-primary transition-colors pointer-events-auto"
          >
            <span className="text-xs font-semibold tracking-wider uppercase hidden sm:block">
              {t?.home?.scrollDown || 'Scroll to explore'}
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.button>
        </section>

        {/* ── SECTION 2: Discover Patterns ── */}
        <section className="relative flex items-center justify-start w-full px-4 sm:px-6 md:px-12 lg:px-24"
          style={{ minHeight: '100dvh' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="glass-mobile w-full max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 space-y-3 sm:space-y-5 pointer-events-auto"
          >
            <span className="text-xs font-bold tracking-widest text-primary/60 uppercase">
              01 — Insights
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              {t?.home?.discoverPatterns || 'Discover Patterns'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              {t?.home?.discoverPatternsDesc || 'As you move forward, you uncover insights into what elevates your state of mind and what brings it down over time.'}
            </p>
            <Link href="/dashboard">
              <button className="mt-2 touch-button bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-semibold hover:bg-primary/20 transition-colors">
                View Dashboard →
              </button>
            </Link>
          </motion.div>
        </section>

        {/* ── SECTION 3: Daily Rituals ── */}
        <section className="relative flex items-center justify-end w-full px-4 sm:px-6 md:px-12 lg:px-24"
          style={{ minHeight: '100dvh' }}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="glass-mobile w-full max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 space-y-3 sm:space-y-5 text-right pointer-events-auto"
          >
            <span className="text-xs font-bold tracking-widest text-emerald-500/70 uppercase">
              02 — Rituals
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-500 leading-tight">
              {t?.home?.dailyRituals || 'Daily Rituals'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              {t?.home?.dailyRitualsDesc || 'Connect with yourself through tracked moods, guided breathing, and anonymous ambient relaxation spaces.'}
            </p>
            <div className="flex justify-end gap-2 flex-wrap mt-2">
              <Link href="/breathe">
                <button className="touch-button bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-sm font-semibold hover:bg-emerald-500/20 transition-colors">
                  Breathe
                </button>
              </Link>
              <Link href="/checkin">
                <button className="touch-button bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-sm font-semibold hover:bg-emerald-500/20 transition-colors">
                  Check-in
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── SECTION 4: CTA ── */}
        <section className="relative flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8"
          style={{ minHeight: '100dvh' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="glass-mobile w-full max-w-[90vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6 pointer-events-auto"
          >
            <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest text-primary/70 uppercase">
              03 — Privacy First
            </span>
            <h2 className="text-2xl min-[480px]:text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 leading-tight">
              {t?.home?.safePrivateSpace || 'A Safe, Private Space'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed">
              {t?.home?.safePrivateSpaceDesc || 'Take our guided PHQ-9 & GAD-7 based assessments completely anonymously, or create an account to save your journey.'}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 py-2">
              {['AES-256 Encrypted', 'Anonymous Mode', 'AI Powered', 'No Ads'].map(f => (
                <span key={f} className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {f}
                </span>
              ))}
            </div>

            <div className="flex flex-col min-[480px]:flex-row justify-center gap-3 sm:gap-4 pt-2">
              <Link href="/auth" className="w-full min-[480px]:w-auto">
                <button className="w-full min-[480px]:w-auto touch-button bg-white text-primary border border-primary/30 rounded-full text-sm sm:text-base font-semibold hover:bg-primary/5 transition-colors shadow-sm">
                  {t?.nav?.signIn || 'Sign In'}
                </button>
              </Link>
              <Link href="/assessment" className="w-full min-[480px]:w-auto">
                <button className="w-full min-[480px]:w-auto touch-button bg-primary text-primary-foreground rounded-full text-sm sm:text-base font-semibold hover:scale-105 transition-transform shadow-md">
                  {t?.home?.tryAnonymous || 'Start Assessment'}
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Footer inside landing */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60 pointer-events-auto">
            <span>© {new Date().getFullYear()} Mentalport</span>
            <div className="flex gap-4">
              <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </section>
      </div>

      {/* Section dot indicators */}
      <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeSection === s.id
                ? 'bg-primary scale-125'
                : 'bg-primary/30 hover:bg-primary/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
