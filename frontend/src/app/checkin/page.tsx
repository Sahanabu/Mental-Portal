'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { MoodCard } from '@/components/MoodCard';
import { useMood } from '@/hooks/useMood';

const moods = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-green-400 to-emerald-500', shadow: 'shadow-green-500/30' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-teal-400 to-cyan-500', shadow: 'shadow-teal-500/30' },
  { id: 'sad', emoji: '😔', label: 'Sad', color: 'from-indigo-400 to-purple-500', shadow: 'shadow-indigo-500/30' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/30' }
];

export default function CheckinPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const { logMood, isLoading, fetchMoodHistory } = useMood();

  const handleLog = async () => {
    if (!selectedMood) return;
    
    const result = await logMood(selectedMood);
    if (result.success) {
      setIsLogged(true);
      // Refresh mood history to get latest data from MongoDB
      setTimeout(() => {
        fetchMoodHistory();
      }, 500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -z-10 mix-blend-multiply"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-mobile responsive-padding rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl max-w-xs sm:max-w-lg md:max-w-2xl w-full text-center border border-white/40 backdrop-blur-3xl"
      >
        {!isLogged ? (
          <>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-3 sm:mb-4">How are you feeling?</h1>
             <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12">Log your current mood to track your emotional well-being over time.</p>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
               {moods.map((mood) => (
                  <MoodCard
                    key={mood.id}
                    mood={mood.label}
                    emoji={mood.emoji}
                    color={mood.color}
                    shadow={mood.shadow}
                    isSelected={selectedMood === mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className="touch-target"
                  />
               ))}
             </div>

             <button 
                onClick={handleLog}
                disabled={!selectedMood || isLoading}
                className="w-full max-w-xs mx-auto touch-button bg-foreground text-background rounded-full text-lg sm:text-xl font-bold disabled:opacity-30 disabled:hover:scale-100 hover:scale-105 transition-all shadow-xl"
             >
               {isLoading ? 'Logging...' : 'Log Mood'}
             </button>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 sm:py-10 md:py-12 flex flex-col items-center"
          >
             <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-green-200">
               <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Mood Logged!</h2>
             <p className="text-muted-foreground text-base sm:text-lg">Thank you for checking in. Tracking your feelings is a great step towards mindfulness.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
