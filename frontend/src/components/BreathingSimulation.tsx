'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BreathingSimulationProps {
  steps: string[];
  onComplete?: () => void;
}

const PHASES = [
  { label: 'Inhale', duration: 4, scale: 1.6, color: 'from-cyan-400 via-blue-500 to-indigo-600', ring: 'rgba(99,179,237,0.3)' },
  { label: 'Hold',   duration: 4, scale: 1.6, color: 'from-indigo-400 via-purple-500 to-pink-500', ring: 'rgba(167,139,250,0.3)' },
  { label: 'Exhale', duration: 6, scale: 1.0, color: 'from-teal-400 via-emerald-500 to-green-500', ring: 'rgba(52,211,153,0.3)' },
];

export function BreathingSimulation({ steps, onComplete }: BreathingSimulationProps) {
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [cycle, setCycle] = useState(0);

  // Phase timer
  useEffect(() => {
    const duration = PHASES[phase].duration;
    setCountdown(duration);

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    const phaseTimer = setTimeout(() => {
      setPhase((p) => {
        const next = (p + 1) % 3;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, duration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(phaseTimer);
    };
  }, [phase]);

  const current = PHASES[phase];
  const stepLabel = steps[phase] || current.label;

  return (
    <div className="flex flex-col items-center justify-center py-8 select-none">

      {/* Outer ripple rings */}
      <div className="relative flex items-center justify-center w-56 h-56">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`ring-${i}-${phase}`}
            className="absolute rounded-full border-2"
            style={{ borderColor: current.ring }}
            initial={{ width: 80, height: 80, opacity: 0.8 }}
            animate={{ width: 220, height: 220, opacity: 0 }}
            transition={{ duration: current.duration, delay: i * (current.duration / 3), ease: 'easeOut', repeat: Infinity }}
          />
        ))}

        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute w-2.5 h-2.5 rounded-full bg-white/70"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: i * (6 / 6) }}
            style={{
              transformOrigin: '0 0',
              left: '50%',
              top: '50%',
              marginLeft: -5,
              marginTop: -80,
            }}
          />
        ))}

        {/* Core glowing orb */}
        <motion.div
          className={`rounded-full bg-gradient-to-br ${current.color} shadow-2xl`}
          animate={{
            scale: phase === 2 ? current.scale : current.scale,
            boxShadow: phase === 1
              ? '0 0 60px 20px rgba(167,139,250,0.5)'
              : phase === 0
              ? '0 0 60px 20px rgba(99,179,237,0.5)'
              : '0 0 60px 20px rgba(52,211,153,0.5)',
          }}
          initial={{ scale: phase === 2 ? 1.6 : 1.0 }}
          transition={{ duration: current.duration, ease: phase === 1 ? 'linear' : 'easeInOut' }}
          style={{ width: 100, height: 100 }}
        >
          {/* Countdown inside orb */}
          <div className="w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.3 }}
                className="text-white font-black text-3xl drop-shadow-lg"
              >
                {countdown}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-2xl font-black text-foreground tracking-wide">{stepLabel}</p>
          <p className="text-sm text-muted-foreground mt-1">{current.duration}s</p>
        </motion.div>
      </AnimatePresence>

      {/* Phase progress dots */}
      <div className="flex gap-3 mt-5">
        {PHASES.map((p, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full"
            animate={{
              width: i === phase ? 28 : 8,
              backgroundColor: i === phase ? '#6366f1' : '#d1d5db',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Cycle counter */}
      {cycle > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-muted-foreground"
        >
          Cycle {cycle} complete 🌿
        </motion.p>
      )}
    </div>
  );
}
