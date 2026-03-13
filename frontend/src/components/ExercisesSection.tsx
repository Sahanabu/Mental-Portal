'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useExerciseStore } from '@/lib/exerciseStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExerciseCard } from './ExerciseCard';

export function ExercisesSection() {
  const { loadExercises, exercises } = useExerciseStore();
  const { t } = useLanguage();

  useEffect(() => {
    if (exercises.length === 0) {
      loadExercises();
    }
  }, [loadExercises, exercises.length]);

  const physicalExercises = exercises.filter((ex) => ex.type === 'physical');

  if (physicalExercises.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 pt-20 pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-emerald-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
            Movement for {t?.exercises?.clarity || 'Mental Clarity'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t?.exercises?.subtitle || 'Short guided exercises release endorphins, reduce cortisol, and clear mental fog. Follow the animations at your own pace.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {physicalExercises.slice(0, 12).map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ExerciseCard exercise={exercise} translations={{
                start: t?.exercises?.start || 'Start Exercise',
                complete: t?.exercises?.complete || 'Complete',
                abandon: t?.exercises?.abandon || 'Abandon',
                completed: t?.exercises?.completed || 'Completed',
                duration: t?.exercises?.duration || 'Duration',
              }} />
            </motion.div>
          ))}
        </div>
        {physicalExercises.length > 12 && (
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground">
              {t?.exercises?.more || 'More exercises available...'} 
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

