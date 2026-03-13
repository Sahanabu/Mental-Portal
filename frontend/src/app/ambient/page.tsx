'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, CloudRain, Waves, Flame, Sparkles } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

const soundscapes = [
  { id: 'rain', name: 'Gentle Rain', icon: CloudRain, color: 'from-blue-900 to-slate-900' },
  { id: 'ocean', name: 'Ocean Waves', icon: Waves, color: 'from-cyan-900 to-blue-900' },
  { id: 'fire', name: 'Campfire', icon: Flame, color: 'from-orange-950 to-red-950' },
  { id: 'cosmos', name: 'Cosmic Ambient', icon: Sparkles, color: 'from-indigo-950 to-purple-950' },
];

export default function AmbientPage() {
  const [activeSound, setActiveSound] = useState('ocean');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [aiGuidance, setAiGuidance] = useState<string>('');
  const { t, language } = useLanguage();

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

  const activeTheme = soundscapes.find(s => s.id === activeSound)?.color || soundscapes[0].color;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden transition-colors duration-[3000ms]">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme} transition-all duration-[3000ms] -z-20`} />
      
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
                  <Icon className={`w-8 h-8 mb-3 ${isActive ? 'text-white drop-shadow-md' : 'text-white/50'}`} />
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

             <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-white/50" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-white h-2 rounded-lg bg-white/20 appearance-none outline-none cursor-pointer"
                />
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
