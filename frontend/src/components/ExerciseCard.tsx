'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Exercise, useExerciseStore } from '@/lib/exerciseStore';
import { BreathingSimulation } from './BreathingSimulation';
import { StretchSimulation } from './StretchSimulation';
import { SitupSimulation } from './SitupSimulation';

interface ExerciseCardProps {
  exercise: Exercise;
  translations: any;
}

export function ExerciseCard({ exercise, translations }: ExerciseCardProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const { updateExerciseStatus, updateExerciseProgress, deleteExercise } = useExerciseStore();

  const handleStart = () => {
    setIsSimulating(true);
    updateExerciseStatus(exercise.id, 'in_progress');
  };

  const handleComplete = () => {
    setIsSimulating(false);
    updateExerciseStatus(exercise.id, 'completed');
  };

  const handleAbandon = () => {
    setIsSimulating(false);
    updateExerciseStatus(exercise.id, 'abandoned');
  };

  const handleDelete = () => {
    deleteExercise(exercise.id);
  };

  const renderSimulation = () => {
    switch (exercise.animationType) {
      case 'breathingCircle':
        return <BreathingSimulation steps={exercise.steps} onComplete={handleComplete} />;
      case 'stretchGuide':
        return <StretchSimulation steps={exercise.steps} onComplete={handleComplete} />;
      case 'situpSimulation':
        return (
          <SitupSimulation
            steps={exercise.steps}
            onComplete={handleComplete}
            onProgressUpdate={(progress) => updateExerciseProgress(exercise.id, progress)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{exercise.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
          <p className="text-xs text-primary mt-2">{translations.duration}: {exercise.duration}</p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-red-100 rounded-full transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isSimulating ? (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderSimulation()}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleComplete}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {translations.complete}
              </button>
              <button
                onClick={handleAbandon}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {translations.abandon}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {exercise.status === 'completed' && (
              <div className="text-center py-4 text-green-600 font-semibold">
                ✓ {translations.completed}
              </div>
            )}
            {exercise.status === 'abandoned' && (
              <div className="text-center py-4 text-orange-600 font-semibold">
                {translations.abandoned}
              </div>
            )}
            {(exercise.status === 'pending' || exercise.status === 'in_progress') && (
              <button
                onClick={handleStart}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {translations.start}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
