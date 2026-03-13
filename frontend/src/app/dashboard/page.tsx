'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, HeartPulse, List, Target, TrendingUp } from 'lucide-react';
import { MoodChart } from '@/components/MoodChart';
import { moodAPI } from '@/services/api';

function DashboardContent() {
  const searchParams = useSearchParams();
  const rawScore = searchParams.get('score');
  const [score, setScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (rawScore) {
        setScore(parseInt(rawScore, 10));
        // Get recommendations from stored assessment
        const stored = localStorage.getItem('lastAssessment');
        if (stored) {
          const data = JSON.parse(stored);
          setRecommendations(data.recommendations || []);
        }
      } else {
        setScore(4); // Default mock
      }

      // Fetch real mood data from MongoDB
      try {
        const response = await moodAPI.getHistory();
        if (response.data.moodLogs && response.data.moodLogs.length > 0) {
          // Transform mood data for chart
          const chartData = response.data.moodLogs.map((log: any) => ({
            name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: log.score
          }));
          setWeeklyData(chartData);
        } else {
          // Default data if no mood logs
          setWeeklyData([
            { name: 'Mon', mood: 5 },
            { name: 'Tue', mood: 5 },
            { name: 'Wed', mood: 5 },
            { name: 'Thu', mood: 5 },
            { name: 'Fri', mood: 5 },
            { name: 'Sat', mood: 5 },
            { name: 'Sun', mood: 5 },
          ]);
        }
      } catch (error) {
        console.log('Using default mood data');
        setWeeklyData([
          { name: 'Mon', mood: 5 },
          { name: 'Tue', mood: 5 },
          { name: 'Wed', mood: 5 },
          { name: 'Thu', mood: 5 },
          { name: 'Fri', mood: 5 },
          { name: 'Sat', mood: 5 },
          { name: 'Sun', mood: 5 },
        ]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [rawScore]);

  if (score === null || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;

  // Derive status
  let status = "Minimal";
  let colorClass = "from-green-400 to-emerald-600";
  let message = "You're doing great! Keep maintaining your positive habits.";
  
  if (score > 5 && score <= 9) {
    status = "Mild";
    colorClass = "from-teal-400 to-cyan-500";
    message = "You are experiencing mild symptoms. Consider light mindfulness exercises.";
  } else if (score > 9 && score <= 14) {
    status = "Moderate";
    colorClass = "from-amber-400 to-orange-500";
    message = "You have moderate symptoms. Taking a break and guided breathing might help.";
  } else if (score > 14) {
    status = "Severe";
    colorClass = "from-rose-400 to-red-500";
    message = "You have significant symptoms. Please consider reaching out to a professional.";
  }

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 space-y-6 sm:space-y-8 max-w-7xl mx-auto pt-16 sm:pt-20 md:pt-24">
      <header className="flex flex-col gap-2 relative z-10 w-full mb-2 sm:mb-4">
        <h1 className="responsive-heading font-extrabold tracking-tight">Your Wellness Overview</h1>
        <p className="text-muted-foreground responsive-text">Here is a snapshot of your recent assessment and mood trends.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-1 glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 shadow-xl relative overflow-hidden"
        >
          <div className="absolute -top-12 sm:-top-16 md:-top-24 -right-12 sm:-right-16 md:-right-24 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-primary/20 rounded-full blur-2xl sm:blur-3xl z-0"></div>
          
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground/80 z-10 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" /> Current Status
          </h2>
          <div className={`mt-3 sm:mt-4 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center bg-gradient-to-tr ${colorClass} shadow-2xl relative z-10`}>
            <div className="w-[85%] h-[85%] bg-background rounded-full flex flex-col items-center justify-center">
               <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr text-foreground">
                 {score}
               </span>
               <span className="text-xs uppercase font-bold text-muted-foreground mt-1">/ 27</span>
            </div>
          </div>
          <p className={`text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${colorClass} z-10 mt-2`}>
            {status}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground z-10 px-2 sm:px-4 pt-2">
            {message}
          </p>
        </motion.div>

        {/* Weekly Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-1 lg:col-span-2 glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col"
        >
           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
             <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> Weekly Mood Trend
             </h2>
             <span className="text-xs font-semibold bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">Last 7 Days</span>
           </div>

           <div className="flex-1 w-full min-h-[200px] sm:min-h-[250px] relative z-10">
             <MoodChart data={weeklyData} type="area" height={window?.innerWidth < 640 ? 200 : 250} />
           </div>
        </motion.div>
      </div>

      {/* Suggested Actions */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.2 }}
         className="mt-6 sm:mt-8"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Recommended for You
          </h2>
          <a 
            href="/history" 
            className="text-sm font-medium text-primary hover:underline"
          >
            View Full History →
          </a>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="glass-mobile responsive-padding rounded-2xl sm:rounded-3xl mb-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-primary">AI-Powered Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        
        <div className="responsive-grid gap-4 sm:gap-6">
          <div className="glass-mobile responsive-padding rounded-2xl sm:rounded-3xl hover:-translate-y-1 transition-transform cursor-pointer group touch-target">
             <div className="bg-blue-100 text-blue-600 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
               <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
             </div>
             <h3 className="text-base sm:text-lg font-bold">Guided Breathing</h3>
             <p className="text-xs sm:text-sm text-muted-foreground mt-2">Take a 3-minute breather to lower anxiety and center your mind.</p>
          </div>
          <div className="glass-mobile responsive-padding rounded-2xl sm:rounded-3xl hover:-translate-y-1 transition-transform cursor-pointer group touch-target">
             <div className="bg-purple-100 text-purple-600 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
               <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
             </div>
             <h3 className="text-base sm:text-lg font-bold">AI Companion</h3>
             <p className="text-xs sm:text-sm text-muted-foreground mt-2">Chat out your feelings in a safe, judgment-free space.</p>
          </div>
          <div className="glass-mobile responsive-padding rounded-2xl sm:rounded-3xl hover:-translate-y-1 transition-transform cursor-pointer group touch-target">
             <div className="bg-orange-100 text-orange-600 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
               <List className="w-5 h-5 sm:w-6 sm:h-6" />
             </div>
             <h3 className="text-base sm:text-lg font-bold">Daily Check-In</h3>
             <p className="text-xs sm:text-sm text-muted-foreground mt-2">Log your current mood to keep your weekly tracking accurate.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
