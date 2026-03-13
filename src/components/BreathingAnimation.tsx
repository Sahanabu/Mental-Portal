'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BreathingAnimationProps {
  isActive?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function BreathingAnimation({ 
  isActive = false, 
  onToggle, 
  className 
}: BreathingAnimationProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      if (phase === 'inhale') {
        interval = setTimeout(() => setPhase('hold'), 4000); // 4 seconds inhale
      } else if (phase === 'hold') {
        interval = setTimeout(() => setPhase('exhale'), 4000); // 4 seconds hold
      } else if (phase === 'exhale') {
        interval = setTimeout(() => setPhase('inhale'), 6000); // 6 seconds exhale
      }
    }

    return () => clearTimeout(interval);
  }, [phase, isActive]);

  const circleVariants = {
    inhale: { 
      scale: 1.8, 
      backgroundColor: 'hsl(var(--primary))', 
      transition: { duration: 4, ease: "linear" } 
    },
    hold: { 
      scale: 1.8, 
      backgroundColor: 'hsl(var(--primary))', 
      transition: { duration: 4, ease: "linear" } 
    },
    exhale: { 
      scale: 1, 
      backgroundColor: 'hsl(142 76% 36%)', 
      transition: { duration: 6, ease: "linear" } 
    },
  };

  const textMap = {
    inhale: 'Inhale...',
    hold: 'Hold...',
    exhale: 'Exhale...'
  };

  return (
    <div className={cn("relative w-80 h-80 flex items-center justify-center", className)}>
      {/* Outer Ripple */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
          transition={{ 
            duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 4, 
            repeat: Infinity, 
            ease: "easeOut" 
          }}
        />
      )}

      {/* Main Breathing Circle */}
      <motion.div 
        className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl cursor-pointer"
        variants={circleVariants}
        animate={isActive ? phase : 'exhale'}
        style={!isActive ? { backgroundColor: 'hsl(var(--primary) / 0.5)', scale: 1 } : {}}
        onClick={onToggle}
      >
        <span className={cn(
          "text-2xl font-bold text-white tracking-widest",
          !isActive && 'hidden'
        )}>
          {textMap[phase]}
        </span>
        {!isActive && (
          <span className="text-xl font-bold text-white tracking-wider">Start</span>
        )}
      </motion.div>
    </div>
  );
}