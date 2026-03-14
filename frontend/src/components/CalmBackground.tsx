'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

// Floating orb — slow, gentle drift
function Orb({ x, y, size, color, duration, delay }: { x: string; y: string; size: number; color: string; duration: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: 'blur(60px)', opacity: 0.18 }}
      animate={{ y: [0, -30, 0, 20, 0], x: [0, 15, -10, 5, 0], scale: [1, 1.08, 0.96, 1.04, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// Tiny floating particle
function Particle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-primary/30 pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -60, 0], opacity: [0, 0.6, 0] }}
      transition={{ duration: 6 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

const ORBS = [
  { x: '5%',  y: '10%', size: 320, color: 'radial-gradient(circle, #a78bfa, #7c3aed)', duration: 18, delay: 0 },
  { x: '70%', y: '5%',  size: 260, color: 'radial-gradient(circle, #6ee7b7, #059669)', duration: 22, delay: 3 },
  { x: '80%', y: '60%', size: 300, color: 'radial-gradient(circle, #93c5fd, #3b82f6)', duration: 20, delay: 6 },
  { x: '10%', y: '65%', size: 240, color: 'radial-gradient(circle, #fda4af, #e11d48)', duration: 25, delay: 2 },
  { x: '45%', y: '40%', size: 200, color: 'radial-gradient(circle, #fde68a, #f59e0b)', duration: 28, delay: 8 },
];

const PARTICLES = [
  { x: '15%', y: '80%', delay: 0 }, { x: '30%', y: '20%', delay: 1.5 },
  { x: '55%', y: '70%', delay: 0.8 }, { x: '75%', y: '30%', delay: 2.2 },
  { x: '88%', y: '85%', delay: 1.1 }, { x: '42%', y: '15%', delay: 3 },
  { x: '65%', y: '50%', delay: 0.4 }, { x: '20%', y: '45%', delay: 2.7 },
];

export function CalmBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {ORBS.map((o, i) => <Orb key={i} {...o} />)}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
    </div>
  );
}

// Stagger container for lists
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// Pulse ring — used around score circles, icons etc.
export function PulseRing({ color = 'bg-primary/20', size = 'w-40 h-40' }: { color?: string; size?: string }) {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${color} ${size}`}
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.4, 0, 0] }}
          transition={{ duration: 2.5, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// Floating emoji / icon
export function FloatIcon({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.5, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
