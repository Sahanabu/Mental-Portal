'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingAnimation } from '@/components/BreathingAnimation';
import { aiAPI } from '@/services/api';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalmBackground, PulseRing, FloatIcon } from '@/components/CalmBackground';

export default function BreathePage() {
  const [isActive, setIsActive] = useState(false);
  const [aiTips, setAiTips] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await aiAPI.getBreathingTips({ currentMood: 'neutral', stressLevel: 'moderate', language });
        setAiTips(response.data.tips);
      } catch (error) {
        setAiTips(t?.breathe?.relax || 'Focus on slow, deep breaths. Let each exhale release tension from your body.');
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, [language, t]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background p-4">
      <CalmBackground />

      {/* Ambient ripple rings always visible */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3, 4].map(i => (
          <motion.div key={i}
            className="absolute rounded-full border border-primary/10"
            style={{ width: i * 160, height: i * 160 }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.08, 0.3] }}
            transition={{ duration: 5 + i, delay: i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-0 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-16 transition-colors duration-1000 text-center ${isActive ? 'text-white' : 'text-foreground'}`}>
          {t?.breathe?.title || 'Guided Breathing'}
        </motion.h1>

        <BreathingAnimation 
          isActive={isActive}
          onToggle={toggleBreathing}
        />

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className={`mt-8 sm:mt-16 text-base sm:text-lg max-w-md text-center transition-colors duration-1000 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
          {isActive 
            ? (t?.breathe?.subtitle || 'Follow the circle. Breathe in for 4s, hold for 4s, and exhale for 6s.') 
            : (t?.breathe?.subtitle || 'Tap the circle to begin a 4-4-6 breathing exercise to calm your nervous system.')}
        </motion.p>

        {!isActive && !loading && aiTips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 glass-mobile p-6 rounded-2xl max-w-lg border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="text-sm font-bold text-primary">{t?.mood?.aiInsight || 'AI Tips for You'}</h3>
            </div>
            <p className="text-sm text-foreground/80">{aiTips}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
