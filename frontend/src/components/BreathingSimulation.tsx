'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BreathingSimulationProps {
  steps: string[];
  onComplete?: () => void;
}

export function BreathingSimulation({ steps, onComplete }: BreathingSimulationProps) {
  const [phase, setPhase] = useState(0);
  const phases = ['inhale', 'hold', 'exhale'];
  const durations = [4, 4, 6];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, durations[phase] * 1000);
    return () => clearInterval(timer);
  }, [phase]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
        animate={{
          scale: phase === 0 ? 1.5 : phase === 1 ? 1.5 : 1,
        }}
        transition={{ duration: durations[phase], ease: 'easeInOut' }}
      />
      <p className="mt-6 text-xl font-bold">{steps[phase]}</p>
    </div>
  );
}
