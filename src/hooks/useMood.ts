import { useState, useEffect } from 'react';
import { moodAPI } from '@/services/api';

export interface MoodEntry {
  id: string;
  mood: string;
  date: string;
  score: number;
}

export function useMood() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const logMood = async (mood: string) => {
    setIsLoading(true);
    try {
      const date = new Date().toISOString();
      await moodAPI.log({ mood, date });
      
      // Add to local state
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        mood,
        date,
        score: getMoodScore(mood),
      };
      
      setMoodHistory(prev => [newEntry, ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to log mood' };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoodHistory = async () => {
    setIsLoading(true);
    try {
      const response = await moodAPI.getHistory();
      setMoodHistory(response.data);
    } catch (error) {
      // Mock data fallback
      setMoodHistory([
        { id: '1', mood: 'happy', date: '2024-01-01', score: 8 },
        { id: '2', mood: 'neutral', date: '2024-01-02', score: 5 },
        { id: '3', mood: 'sad', date: '2024-01-03', score: 3 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodScore = (mood: string): number => {
    const moodScores: Record<string, number> = {
      happy: 8,
      neutral: 5,
      sad: 3,
      anxious: 2,
    };
    return moodScores[mood] || 5;
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  return {
    moodHistory,
    isLoading,
    logMood,
    fetchMoodHistory,
  };
}