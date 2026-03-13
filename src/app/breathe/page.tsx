'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingAnimation } from '@/components/BreathingAnimation';

export default function BreathePage() {
  const [isActive, setIsActive] = useState(false);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Darken background slightly while active for focus */}
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

      <div className="relative z-10 flex flex-col items-center">
        <h1 className={`text-5xl font-extrabold mb-16 transition-colors duration-1000 ${isActive ? 'text-white' : 'text-foreground'}`}>
          Guided Breathing
        </h1>

        <BreathingAnimation 
          isActive={isActive}
          onToggle={toggleBreathing}
        />

        <p className={`mt-16 text-lg max-w-md text-center transition-colors duration-1000 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
          {isActive ? 'Follow the circle. Breathe in for 4s, hold for 4s, and exhale for 6s.' : 'Tap the circle to begin a 4-4-6 breathing exercise to calm your nervous system.'}
        </p>
      </div>
    </div>
  );
}
