'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

function MouseSpotlight() {
  const rawX = useMotionValue(-1000);
  const rawY = useMotionValue(-1000);
  const x = useSpring(rawX, { stiffness: 80, damping: 22, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 80, damping: 22, mass: 0.6 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  return (
    <>
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 700, height: 700,
          left: x, top: y,
          translateX: '-50%', translateY: '-50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(16,185,129,0.12) 40%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
      />
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 450, height: 450,
          left: x, top: y,
          translateX: '-20%', translateY: '-80%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.10) 50%, transparent 70%)',
          filter: 'blur(70px)',
          zIndex: 1,
        }}
      />
    </>
  );
}

function Orb({ x, y, size, color, duration, delay }: {
  x: string; y: string; size: number; color: string; duration: number; delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: 'blur(60px)', opacity: 0.35 }}
      animate={{ y: [0, -30, 0, 20, 0], x: [0, 15, -10, 5, 0], scale: [1, 1.08, 0.96, 1.04, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Particle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-primary/40 pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -60, 0], opacity: [0, 0.7, 0] }}
      transition={{ duration: 6 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

const ORBS = [
  { x: '5%',  y: '10%', size: 380, color: 'radial-gradient(circle, rgba(167,139,250,0.40), rgba(124,58,237,0.18))',  duration: 18, delay: 0 },
  { x: '70%', y: '5%',  size: 320, color: 'radial-gradient(circle, rgba(110,231,183,0.38), rgba(5,150,105,0.16))',   duration: 22, delay: 3 },
  { x: '80%', y: '60%', size: 360, color: 'radial-gradient(circle, rgba(147,197,253,0.36), rgba(59,130,246,0.16))',  duration: 20, delay: 6 },
  { x: '10%', y: '65%', size: 300, color: 'radial-gradient(circle, rgba(253,164,175,0.34), rgba(225,29,72,0.14))',   duration: 25, delay: 2 },
  { x: '45%', y: '40%', size: 260, color: 'radial-gradient(circle, rgba(253,230,138,0.32), rgba(245,158,11,0.14))',  duration: 28, delay: 8 },
];

const PARTICLES = [
  { x: '15%', y: '80%', delay: 0   }, { x: '30%', y: '20%', delay: 1.5 },
  { x: '55%', y: '70%', delay: 0.8 }, { x: '75%', y: '30%', delay: 2.2 },
  { x: '88%', y: '85%', delay: 1.1 }, { x: '42%', y: '15%', delay: 3   },
  { x: '65%', y: '50%', delay: 0.4 }, { x: '20%', y: '45%', delay: 2.7 },
];

export function CalmBackground() {
  return (
    <>
      {/* Fixed layer — sits above html background, below all page content */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        {ORBS.map((o, i) => <Orb key={i} {...o} />)}
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </div>
      <MouseSpotlight />
    </>
  );
}

// ── Animation variants ────────────────────────────────────────────────────

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
