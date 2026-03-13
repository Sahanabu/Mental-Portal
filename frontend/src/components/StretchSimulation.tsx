'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StretchSimulationProps {
  steps: string[];
  onComplete?: () => void;
}

export function StretchSimulation({ steps, onComplete }: StretchSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length - 1) return;
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 5000);
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  return (
    <div className="flex flex-col items-center p-6">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🧘</div>
        <p className="text-lg font-semibold">{steps[currentStep]}</p>
        <div className="mt-4 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === currentStep ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
