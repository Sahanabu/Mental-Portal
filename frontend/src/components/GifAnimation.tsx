'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface GifAnimationProps {
  gifUrl: string;
  title: string;
  steps: string[];
}

export function GifAnimation({ gifUrl, title, steps }: GifAnimationProps) {
  return (
    <div className="flex flex-col items-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100"
      >
        <Image
          src={gifUrl}
          alt={title}
          fill
          className="object-contain"
          unoptimized
        />
      </motion.div>

      <div className="space-y-2 w-full max-w-sm">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2 text-sm"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <p className="text-muted-foreground">{step}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
