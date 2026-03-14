'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CloudRain, Waves, Flame, Sparkles } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalmBackground } from '@/components/CalmBackground';

const soundscapes = [
  { id: 'rain', name: 'Gentle Rain', icon: CloudRain, color: 'from-blue-900 to-slate-900', src: '/ambient/gentlerain.mpeg' },
  { id: 'ocean', name: 'Ocean Waves', icon: Waves, color: 'from-cyan-900 to-blue-900', src: '/ambient/oceanwaves.mpeg' },
  { id: 'fire', name: 'Campfire', icon: Flame, color: 'from-orange-950 to-red-950', src: '/ambient/campfire.mpeg' },
  { id: 'cosmos', name: 'Cosmic Ambient', icon: Sparkles, color: 'from-indigo-950 to-purple-950', src: '/ambient/cosmicambient.mpeg' },
];

export default function AmbientPage() {
  const [activeSound, setActiveSound] = useState('ocean');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aiGuidance, setAiGuidance] = useState<string>('');
  const { t, language } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        const response = await aiAPI.getAmbientGuidance({ timeOfDay, mood: 'calm', language });
        setAiGuidance(response.data.guidance);
      } catch (error) {
        setAiGuidance(t?.ambient?.immerse || 'Take this moment for yourself. Let the sounds wash over you and bring peace to your mind.');
      }
    };
    fetchGuidance();
  }, [language, t]);

  // Sync audio src when active sound changes
  useEffect(() => {
    const sound = soundscapes.find(s => s.id === activeSound);
    if (!sound || !audioRef.current) return;
    const wasPlaying = isPlaying;
    audioRef.current.pause();
    audioRef.current.src = sound.src;
    audioRef.current.load();
    setCurrentTime(0);
    setDuration(0);
    if (wasPlaying) audioRef.current.play().catch(() => {});
  }, [activeSound]);

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        const sound = soundscapes.find(s => s.id === activeSound);
        if (sound) { audioRef.current.src = sound.src; audioRef.current.load(); }
      }
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Audio time/duration listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('loadedmetadata', onDuration);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('loadedmetadata', onDuration);
    };
  }, []);

  const activeTheme = soundscapes.find(s => s.id === activeSound)?.color || soundscapes[0].color;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden transition-colors duration-[3000ms]">
      <audio ref={audioRef} loop preload="none" />
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme} transition-all duration-[3000ms] -z-20`} />
      <CalmBackground />

      {/* Ambient ripple rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[1,2,3,4,5].map(i => (
          <motion.div key={i}
            className="absolute rounded-full border border-white/10"
            style={{ width: i * 180, height: i * 180 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 6 + i * 1.2, delay: i * 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {isPlaying && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
          className="absolute inset-0 bg-white/5 -z-10 mix-blend-overlay"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-[3.5rem] bg-black/20 border-white/10 backdrop-blur-3xl text-white max-w-2xl w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">{t?.ambient?.ambientMode || 'Ambient Mode'}</h1>
            <p className="text-lg text-white/70">{t?.ambient?.immerse || 'Immerse yourself in calming soundscapes to focus, relax, or sleep.'}</p>
            {aiGuidance && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-white/60 mt-4 italic max-w-md mx-auto"
              >
                ✨ {aiGuidance}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {soundscapes.map((sound) => {
              const Icon = sound.icon;
              const isActive = activeSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => setActiveSound(sound.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-500 border-2 ${
                    isActive 
                      ? 'bg-white/20 border-white/50 shadow-lg scale-105' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <motion.div
                    animate={isActive && isPlaying ? { rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                    <Icon className={`w-8 h-8 mb-3 ${isActive ? 'text-white drop-shadow-md' : 'text-white/50'}`} />
                  </motion.div>
                  <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/50'}`}>{sound.name}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-8 bg-black/20 p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-white/10"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold tracking-wider uppercase text-white/70">
                    {t?.ambient?.nowPlaying || 'Now Playing'}
                  </span>
                  {isPlaying && (
                     <div className="flex gap-1 h-3 items-center">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
                        <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-white rounded-full" />
                        <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-white rounded-full" />
                     </div>
                  )}
                </div>
                <h3 className="text-xl font-bold">{soundscapes.find(s => s.id === activeSound)?.name}</h3>
              </div>
            </div>

            {/* Seek bar + timer */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (audioRef.current) audioRef.current.currentTime = val;
                }}
                className="w-full accent-white h-2 rounded-lg bg-white/20 appearance-none outline-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/50 font-mono tabular-nums">
                <span>{fmt(currentTime)}</span>
                <span>{duration > 0 ? fmt(duration) : '--:--'}</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
