import { create } from 'zustand';
import { mentalHealthExercises } from './exercisesData';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'breathing' | 'stretching' | 'physical';
  animationType: 'breathingCircle' | 'stretchGuide' | 'situpSimulation' | 'gifAnimation';
  steps: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned' | 'deleted';
  progress?: number;
  animationUrl?: string;
}

interface ExerciseState {
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  updateExerciseStatus: (id: string, status: Exercise['status']) => void;
  updateExerciseProgress: (id: string, progress: number) => void;
  deleteExercise: (id: string) => void;
  clearExercises: () => void;
  loadExercises: () => void;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  exercises: [],
  setExercises: (exercises) => set({ exercises }),
  updateExerciseStatus: (id, status) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === id ? { ...ex, status } : ex
      ),
    })),
  updateExerciseProgress: (id, progress) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === id ? { ...ex, progress } : ex
      ),
    })),
  deleteExercise: (id) =>
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== id),
    })),
  clearExercises: () => set({ exercises: [] }),
  loadExercises: () => set({ exercises: mentalHealthExercises }),
}));
