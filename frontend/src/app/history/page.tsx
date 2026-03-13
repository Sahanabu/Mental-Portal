'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { assessmentAPI, moodAPI, aiAPI } from '@/services/api';

interface Assessment {
  id: string;
  score: number;
  category: string;
  date: string;
  answers: number[];
}

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await assessmentAPI.getHistory();
        const formattedData = response.data.assessments?.map((assessment: any) => ({
          id: assessment.id || assessment._id,
          score: assessment.score,
          category: assessment.category,
          date: new Date(assessment.date || assessment.createdAt).toLocaleDateString(),
          answers: assessment.answers
        })) || [];
        setAssessments(formattedData);
        
        // Get AI analysis if there are assessments
        if (formattedData.length > 0) {
          try {
            const moodResponse = await moodAPI.getHistory();
            const analysis = await aiAPI.getHistoryAnalysis({
              assessments: formattedData,
              moodLogs: moodResponse.data.moodLogs || []
            });
            setAiAnalysis(analysis.data.analysis);
          } catch (error) {
            setAiAnalysis('Your consistent tracking shows dedication to your mental wellness journey.');
          }
        }
      } catch (error) {
        console.log('Failed to fetch assessment history');
        setAssessments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Minimal': return 'from-green-400 to-emerald-600';
      case 'Mild': return 'from-teal-400 to-cyan-500';
      case 'Moderate': return 'from-amber-400 to-orange-500';
      case 'Severe': return 'from-rose-400 to-red-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your assessment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto pt-20">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
          Assessment History
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Track your mental wellness journey over time
        </p>
      </header>

      {assessments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-mobile responsive-padding rounded-3xl text-center py-12"
        >
          <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">No Assessments Yet</h2>
          <p className="text-muted-foreground mb-6">
            Complete your first assessment to start tracking your wellness journey
          </p>
          <a
            href="/assessment"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform"
          >
            Take Assessment
          </a>
        </motion.div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 mb-8">
            {assessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-mobile responsive-padding rounded-2xl sm:rounded-3xl hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${getCategoryColor(assessment.category)} shadow-lg flex-shrink-0`}>
                      <span className="text-2xl sm:text-3xl font-black text-white">
                        {assessment.score}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getCategoryColor(assessment.category)}`}>
                        {assessment.category}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{assessment.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Score: {assessment.score} / 27
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {(assessment.answers || []).map((answer, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold"
                        title={`Question ${idx + 1}: ${answer}`}
                      >
                        {answer}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {assessments.length > 1 && (
            <>
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-mobile p-6 rounded-3xl mb-6 border-2 border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-primary">AI Progress Analysis</h2>
                  </div>
                  <p className="text-sm sm:text-base text-foreground/80">{aiAnalysis}</p>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-mobile responsive-padding rounded-3xl"
              >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Progress Overview</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{assessments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {assessments[0]?.score || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Latest Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {assessments[0]?.category || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                </div>
              </div>
            </motion.div>
            </>
          )}
        </>
      )}
    </div>
  );
}
