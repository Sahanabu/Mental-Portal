'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingAnimation } from '@/components/BreathingAnimation';
import { aiAPI } from '@/services/api';
import { Sparkles } from 'lucide-react';

export default function BreathePage() {
  const [isActive, setIsActive] = useState(false);
  const [aiTips, setAiTips] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await aiAPI.getBreathingTips({ currentMood: 'neutral', stressLevel: 'moderate' });
        setAiTips(response.data.tips);
      } catch (error) {
        setAiTips('Focus on slow, deep breaths. Let each exhale release tension from your body.');
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background p-4">
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
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-16 transition-colors duration-1000 text-center ${isActive ? 'text-white' : 'text-foreground'}`}>
          Guided Breathing
        </h1>

        <BreathingAnimation 
          isActive={isActive}
          onToggle={toggleBreathing}
        />

        <p className={`mt-8 sm:mt-16 text-base sm:text-lg max-w-md text-center transition-colors duration-1000 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
          {isActive ? 'Follow the circle. Breathe in for 4s, hold for 4s, and exhale for 6s.' : 'Tap the circle to begin a 4-4-6 breathing exercise to calm your nervous system.'}
        </p>

        {!isActive && !loading && aiTips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass-mobile p-6 rounded-2xl max-w-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-primary">AI Tips for You</h3>
            </div>
            <p className="text-sm text-foreground/80">{aiTips}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
