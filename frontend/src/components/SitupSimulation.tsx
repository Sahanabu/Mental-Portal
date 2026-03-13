'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SitupSimulationProps {
  steps: string[];
  targetReps?: number;
  onComplete?: () => void;
  onProgressUpdate?: (progress: number) => void;
}

export function SitupSimulation({ steps, targetReps = 10, onComplete, onProgressUpdate }: SitupSimulationProps) {
  const [reps, setReps] = useState(0);

  const handleRepDone = () => {
    const newReps = reps + 1;
    setReps(newReps);
    onProgressUpdate?.(newReps);
    if (newReps >= targetReps) {
      onComplete?.();
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-primary">{reps}/{targetReps}</div>
        <p className="text-sm text-muted-foreground mt-1">Reps</p>
      </div>
      
      <motion.div
        className="text-8xl mb-6"
        animate={{ rotateX: [0, 45, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        💪
      </motion.div>

      <div className="space-y-2 mb-6 text-center">
        {steps.map((step, i) => (
          <p key={i} className="text-sm text-muted-foreground">{step}</p>
        ))}
      </div>

      <button
        onClick={handleRepDone}
        disabled={reps >= targetReps}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold disabled:opacity-50"
      >
        Rep Done
      </button>
    </div>
  );
}
