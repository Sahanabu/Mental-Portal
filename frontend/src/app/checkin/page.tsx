'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Dumbbell, AlertCircle, X } from 'lucide-react';
import { MoodCard } from '@/components/MoodCard';
import { ExerciseCard } from '@/components/ExerciseCard';
import { RecoveryVideoSection } from '@/components/RecoveryVideoSection';
import { MusicTherapySection } from '@/components/MusicTherapySection';
import { MovieSuggestionSection } from '@/components/MovieSuggestionSection';
import { useMood } from '@/hooks/useMood';
import { aiAPI, interactionsAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExerciseStore, Exercise } from '@/lib/exerciseStore';
import { encrypt } from '@/lib/crypto';

const moods = [
  { id: 'happy',   emoji: '😊', label: 'Happy',   color: 'from-green-400 to-emerald-500', shadow: 'shadow-green-500/30' },
  { id: 'neutral', emoji: '😐', label: 'Neutral',  color: 'from-teal-400 to-cyan-500',    shadow: 'shadow-teal-500/30' },
  { id: 'sad',     emoji: '😔', label: 'Sad',      color: 'from-indigo-400 to-purple-500', shadow: 'shadow-indigo-500/30' },
  { id: 'anxious', emoji: '😰', label: 'Anxious',  color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/30' },
  { id: 'stressed',emoji: '😫', label: 'Stressed', color: 'from-red-400 to-pink-500',     shadow: 'shadow-red-500/30' },
  { id: 'tired',   emoji: '😴', label: 'Tired',    color: 'from-gray-400 to-slate-500',   shadow: 'shadow-gray-500/30' },
];

// Map mood → wellness category used by RecoveryVideoSection
const MOOD_TO_CATEGORY: Record<string, string> = {
  happy:   'Minimal',
  neutral: 'Minimal',
  tired:   'Mild',
  sad:     'Mild',
  anxious: 'Moderate',
  stressed:'Moderate',
};

export default function CheckinPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGeneratingExercises, setIsGeneratingExercises] = useState(false);
  const [videoCategory, setVideoCategory] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'info' } | null>(null);

  const notify = (message: string, type: 'error' | 'info' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  const { logMood, isLoading, fetchMoodHistory, moodHistory } = useMood();
  const { t, language } = useLanguage();
  const { exercises, setExercises } = useExerciseStore();

  const handleLog = async () => {
    if (!selectedMood) return;

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      notify('Please log in to track your mood.', 'error');
      return;
    }

    const result = await logMood(selectedMood);
    if (result.success) {
      setIsLogged(true);
      setVideoCategory(MOOD_TO_CATEGORY[selectedMood] || 'Mild');
      fetchMoodHistory();

      // Encrypt and store checkin interaction
      if (userId) {
        try {
          const encrypted = await encrypt(userId, { type: 'checkin', mood: selectedMood, date: new Date().toISOString() });
          await interactionsAPI.save({ type: 'checkin', encryptedPayload: encrypted });
        } catch { /* non-blocking */ }
      }

      // AI insight
      try {
        const recentMoods = moodHistory.slice(-7).map(m => m.mood);
        const response = await aiAPI.getCheckinInsights({ mood: selectedMood, recentMoods, language });
        setAiInsight(response.data.insight);
      } catch {
        setAiInsight(t?.mood?.trackingStep || 'Thank you for checking in.');
      }

      // Generate exercises
      setIsGeneratingExercises(true);
      try {
        const exerciseResponse = await aiAPI.generateExercises({ mood: selectedMood, language });
        const generatedExercises: Exercise[] = exerciseResponse.data.exercises.map((ex: any, idx: number) => ({
          ...ex,
          id: `${selectedMood}-${Date.now()}-${idx}`,
          status: 'pending' as const,
        }));
        setExercises(generatedExercises);
      } catch {
        notify('Could not generate exercises. Please try again.', 'info');
      } finally {
        setIsGeneratingExercises(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-screen flex flex-col items-center justify-start p-4 relative overflow-hidden">
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-medium ${
            notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-1 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
      <div className="absolute top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -z-10 mix-blend-multiply" />

      {/* Mood selection / success card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-mobile responsive-padding rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl max-w-xs sm:max-w-lg md:max-w-2xl w-full text-center border border-white/40 backdrop-blur-3xl mb-6"
      >
        {!isLogged ? (
          <>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-3 sm:mb-4">
              {t?.mood?.howFeeling || 'How are you feeling?'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12">
              {t?.mood?.logCurrentMood || 'Log your current mood to track your emotional well-being over time.'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
              {moods.map((mood) => (
                <MoodCard
                  key={mood.id}
                  mood={t?.mood?.[mood.id] || mood.label}
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
              {isLoading ? (t?.mood?.logging || 'Logging...') : (t?.mood?.logMood || 'Log Mood')}
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
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {t?.mood?.moodLoggedSuccess || 'Mood Logged!'}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-6">
              {t?.mood?.trackingStep || 'Thank you for checking in.'}
            </p>
            {aiInsight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-primary/10 border border-primary/20 rounded-2xl p-4 max-w-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">{t?.mood?.aiInsight || 'AI Insight'}</span>
                </div>
                <p className="text-sm text-foreground/80 text-left">{aiInsight}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Exercises section */}
      {isLogged && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs sm:max-w-lg md:max-w-4xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Dumbbell className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{t?.exercise?.title || 'Recommended Exercises'}</h2>
          </div>

          {isGeneratingExercises ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">{t?.exercise?.generatingExercises || 'Generating exercises...'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.filter(ex => ex.status !== 'deleted').map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  translations={{
                    duration:  t?.exercise?.duration  || 'Duration',
                    start:     t?.exercise?.start     || 'Start Exercise',
                    complete:  t?.exercise?.complete  || 'Complete',
                    abandon:   t?.exercise?.abandon   || 'Abandon',
                    completed: t?.exercise?.completed || 'Completed',
                    abandoned: t?.exercise?.abandoned || 'Abandoned',
                  }}
                />
              ))}
            </div>
          )}

          {/* Mood Recovery Videos — shown after exercises */}
          {videoCategory && (
            <RecoveryVideoSection
              category={videoCategory}
              score={0}
            />
          )}

          {/* AI Music Therapy — shown after mood is logged */}
          {selectedMood && (
            <MusicTherapySection state={selectedMood} moodCategory={videoCategory || selectedMood} />
          )}

          {selectedMood && (
            <MovieSuggestionSection mood={selectedMood} />
          )}
        </motion.div>
      )}
    </div>
  );
}