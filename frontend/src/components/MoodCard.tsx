'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MoodCardProps {
  mood: string;
  emoji: string;
  color: string;
  shadow?: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MoodCard({ 
  mood, 
  emoji, 
  color, 
  shadow = '', 
  isSelected = false, 
  onClick, 
  className 
}: MoodCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all group",
        isSelected 
          ? `border-transparent bg-gradient-to-tr ${color} text-white shadow-xl scale-105 ${shadow}` 
          : 'border-white/30 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-105 text-foreground',
        className
      )}
    >
      <span className="text-6xl mb-4 group-hover:-translate-y-2 transition-transform">
        {emoji}
      </span>
      <span className="font-bold text-lg">{mood}</span>
    </motion.button>
  );
}