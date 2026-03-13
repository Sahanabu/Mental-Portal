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
      // Transform backend data to match frontend format
      const formattedData = response.data.moodLogs?.map((log: any) => ({
        id: log._id || Date.now().toString(),
        mood: log.mood,
        date: log.date,
        score: log.score
      })) || [];
      setMoodHistory(formattedData);
    } catch (error) {
      console.log('Failed to fetch mood history from backend');
      setMoodHistory([]);
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