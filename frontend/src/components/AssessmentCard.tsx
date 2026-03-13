'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentCardProps {
  option: {
    value: number;
    label: string;
  };
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function AssessmentCard({ option, isSelected, onClick, className }: AssessmentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group",
        isSelected
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]'
          : 'border-white/30 bg-white/40 hover:bg-white/60 hover:border-white/60 hover:scale-[1.01]',
        className
      )}
    >
      <span className={cn(
        "text-lg font-medium transition-colors",
        isSelected ? 'text-primary' : 'text-foreground'
      )}>
        {option.label}
      </span>
      
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </motion.div>
      )}
    </button>
  );
}