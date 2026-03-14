'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, HeartPulse, List, Target, TrendingUp, User, MessageSquare, Shield, Trash2 } from 'lucide-react';
import { MoodChart } from '@/components/MoodChart';
import { RecoveryVideoSection } from '@/components/RecoveryVideoSection';
import { MusicTherapySection } from '@/components/MusicTherapySection';
import { MovieSuggestionSection } from '@/components/MovieSuggestionSection';
import Link from 'next/link';
import { moodAPI, chatAPI, authAPI, dashboardAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { decrypt } from '@/lib/crypto';

function DashboardContent() {
  const searchParams = useSearchParams();
  const rawScore = searchParams.get('score');
  const { t } = useLanguage();
  const [score, setScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [scoreTrend, setScoreTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [dbStats, setDbStats] = useState<{ totalAssessments: number; totalMoodLogs: number; totalInteractions: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Check token first
      const token = localStorage.getItem('token');
      if (token) {
        let email = localStorage.getItem('userEmail') || '';
        let name = localStorage.getItem('userName') || '';
        
        if (!email || !name) {
          try {
            const profileResponse = await authAPI.getProfile();
            email = profileResponse.data.email;
            name = profileResponse.data.name;
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
          } catch {
            console.log('Profile fetch failed');
          }
        }
        
        setUserEmail(email);
        setUserName(name);
      } else {
        setUserEmail('Anonymous User');
        setUserName('');
      }

      if (rawScore) {
        setScore(parseInt(rawScore, 10));
        const stored = localStorage.getItem('lastAssessment');
        if (stored) {
          const data = JSON.parse(stored);
          setRecommendations(data.recommendations || []);
          setAiSummary(data.summary || '');
        }
      }

      // Pull from new dashboard API if authenticated
      const userId = localStorage.getItem('userId');
      let resolvedScore = rawScore ? parseInt(rawScore, 10) : null;
      if (userId && token) {
        try {
          const dash = await dashboardAPI.get(userId);
          const d = dash.data;
          if (!rawScore && d.summary.latestScore !== null) {
            resolvedScore = d.summary.latestScore;
            setScore(d.summary.latestScore);
          }
          if (d.summary.latestRecommendations?.length) setRecommendations(d.summary.latestRecommendations);
          if (d.summary.latestSummary) setAiSummary(d.summary.latestSummary);
          if (d.moodTrend?.length) {
            setWeeklyData(d.moodTrend.map((m: any) => ({ name: m.date, mood: m.score })));
          }
          if (d.scoreTrend?.length) setScoreTrend(d.scoreTrend);
          setDbStats({
            totalAssessments: d.summary.totalAssessments || 0,
            totalMoodLogs: d.summary.totalMoodLogs || 0,
            totalInteractions: d.summary.totalInteractions || 0
          });
        } catch { /* fallback below */ }
      }

      if (resolvedScore === null) setScore(4);

      // Fetch mood data
      try {
        const response = await moodAPI.getHistory();
        if (response.data.moodLogs && response.data.moodLogs.length > 0) {
          const chartData = response.data.moodLogs.map((log: any) => ({
            name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: log.score
          }));
          setWeeklyData(chartData);
        } else {
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

      // Fetch conversations
      try {
        const convResponse = await chatAPI.getConversations(5);
        setConversations(convResponse.data.conversations || []);
      } catch (error) {
        console.log('No conversations found');
      }

      setIsLoading(false);
    };

    loadData();
  }, [rawScore]);

  const handleDeleteConversation = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        await chatAPI.deleteConversation(sessionId);
        setConversations(conversations.filter(c => c.sessionId !== sessionId));
      } catch (error) {
        alert('Failed to delete conversation');
      }
    }
  };

  const handleDeleteAllConversations = async () => {
    if (confirm('Are you sure you want to delete ALL conversations? This action cannot be undone.')) {
      try {
        await chatAPI.deleteAllConversations();
        setConversations([]);
      } catch (error) {
        alert('Failed to delete conversations');
      }
    }
  };

  if (score === null || isLoading) return <div className="min-h-screen flex items-center justify-center">{t?.dashboard?.loadingDashboard || 'Loading dashboard...'}</div>;

  // Derive status
  let status = "Minimal";
  let colorClass = "from-green-400 to-emerald-600";
  let message = t?.dashboard?.statusMinimal || "You're doing great! Keep maintaining your positive habits.";
  
  if (score > 5 && score <= 9) {
    status = "Mild";
    colorClass = "from-teal-400 to-cyan-500";
    message = t?.dashboard?.statusMild || "You are experiencing mild symptoms. Consider light mindfulness exercises.";
  } else if (score > 9 && score <= 14) {
    status = "Moderate";
    colorClass = "from-amber-400 to-orange-500";
    message = t?.dashboard?.statusModerate || "You have moderate symptoms. Taking a break and guided breathing might help.";
  } else if (score > 14) {
    status = "Severe";
    colorClass = "from-rose-400 to-red-500";
    message = t?.dashboard?.statusSevere || "You have significant symptoms. Please consider reaching out to a professional.";
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* User Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-mobile p-6 rounded-2xl flex items-center gap-4 border-2 border-primary/20"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        {localStorage.getItem('token') ? (
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userName || 'Welcome'}</h2>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Shield className="w-4 h-4" />
          <span>{t?.dashboard?.encrypted || 'Encrypted'}</span>
        </div>
      </motion.div>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">{t?.dashboard?.title || 'Your Wellness Overview'}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t?.dashboard?.snapshot || 'Here is a snapshot of your recent assessment and mood trends.'}</p>
      </header>

      {/* Live DB stats */}
      {dbStats && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Assessments', value: dbStats.totalAssessments, color: 'text-primary' },
            { label: 'Mood Logs', value: dbStats.totalMoodLogs, color: 'text-teal-600' },
            { label: 'Interactions', value: dbStats.totalInteractions, color: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="glass-mobile p-4 rounded-2xl text-center border border-white/30">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}

        {aiSummary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-mobile p-5 rounded-2xl border border-primary/20 flex gap-3 items-start"
          >
            <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">AI Assessment Summary</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{aiSummary}</p>
            </div>
          </motion.div>
        )}

        {scoreTrend.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-mobile p-6 rounded-2xl border border-white/30"
          >
            <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" /> Assessment Score Trend
            </h2>
            <MoodChart data={scoreTrend.map(s => ({ name: s.date, mood: s.score }))} type="line" height={180} />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-1 glass-mobile p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center space-y-4 shadow-xl relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 sm:w-48 sm:h-48 bg-primary/20 rounded-full blur-3xl"></div>
          
          <h2 className="text-sm sm:text-base font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4" /> {t?.dashboard?.currentStatus || 'Current Status'}
          </h2>
          <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center bg-gradient-to-tr ${colorClass} shadow-2xl relative`}>
            <div className="w-[85%] h-[85%] bg-background rounded-full flex flex-col items-center justify-center">
               <span className="text-4xl sm:text-5xl font-black text-foreground">
                 {score}
               </span>
               <span className="text-xs uppercase font-bold text-muted-foreground">/ 27</span>
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${colorClass}`}>
            {status}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            {message}
          </p>
        </motion.div>

        {/* Weekly Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-1 lg:col-span-2 glass-mobile p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden flex flex-col"
        >
           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
             <h2 className="text-sm sm:text-base font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> {t?.dashboard?.weeklyMoodTrend || 'Weekly Mood Trend'}
             </h2>
             <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full self-start">{t?.dashboard?.last7Days || 'Last 7 Days'}</span>
           </div>

           <div className="flex-1 w-full min-h-[200px] sm:min-h-[280px]">
             <MoodChart data={weeklyData} type="area" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : 280} />
           </div>
        </motion.div>
      </div>

      {/* Suggested Actions */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.2 }}
         className="mt-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> {t?.dashboard?.recommendedForYou || 'Recommended for You'}
          </h2>
          <a 
            href="/history" 
            className="text-xs sm:text-sm font-medium text-primary hover:underline"
          >
            {t?.dashboard?.viewHistory || 'View History →'}
          </a>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="glass-mobile p-6 rounded-2xl mb-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-primary flex items-center gap-2">
              <Brain className="w-5 h-5" /> {t?.dashboard?.aiPoweredRecommendations || 'AI-Powered Recommendations'}
            </h3>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-foreground">
                  <span className="text-primary text-lg">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/breathe" className="glass-mobile p-6 rounded-2xl hover:-translate-y-1 transition-all cursor-pointer group block">
             <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <HeartPulse className="w-6 h-6" />
             </div>
             <h3 className="text-base sm:text-lg font-bold mb-2">{t?.dashboard?.guidedBreathing || 'Guided Breathing'}</h3>
             <p className="text-xs sm:text-sm text-muted-foreground">{t?.dashboard?.guidedBreathingDesc || 'Take a 3-minute breather to lower anxiety and center your mind.'}</p>
          </Link>
          <a href="/chat" className="glass-mobile p-6 rounded-2xl hover:-translate-y-1 transition-all cursor-pointer group block">
             <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Brain className="w-6 h-6" />
             </div>
             <h3 className="text-base sm:text-lg font-bold mb-2">{t?.dashboard?.aiCompanion || 'AI Companion'}</h3>
             <p className="text-xs sm:text-sm text-muted-foreground">{t?.dashboard?.aiCompanionDesc || 'Chat out your feelings in a safe, judgment-free space.'}</p>
          </a>
          <Link href="/checkin" className="glass-mobile p-6 rounded-2xl hover:-translate-y-1 transition-all cursor-pointer group block">
             <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <List className="w-6 h-6" />
             </div>
             <h3 className="text-base sm:text-lg font-bold mb-2">{t?.dashboard?.dailyCheckin || 'Daily Check-In'}</h3>
             <p className="text-xs sm:text-sm text-muted-foreground">{t?.dashboard?.dailyCheckinDesc || 'Log your current mood to keep your weekly tracking accurate.'}</p>
          </Link>
        </div>
      </motion.div>

      {/* AI Mood Recovery Videos — only shown when coming from assessment */}
      {rawScore && (
        <RecoveryVideoSection category={status} score={score} />
      )}

      {/* AI Music Therapy — only shown when coming from assessment */}
      {rawScore && (
        <MusicTherapySection moodCategory={status} assessmentScore={rawScore} />
      )}

      {rawScore && (
        <MovieSuggestionSection mood={status} />
      )}

      {/* Conversations Section */}
      {localStorage.getItem('token') && conversations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> {t?.dashboard?.yourConversations || 'Your Conversations'}
            </h2>
            <button
              onClick={() => setShowConversations(!showConversations)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {showConversations ? (t?.dashboard?.hide || 'Hide') : (t?.dashboard?.show || 'Show')} ({conversations.length})
            </button>
          </div>

          {showConversations && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-1" />
                  {t?.dashboard?.allConversationsEncrypted || 'All conversations are encrypted and auto-deleted after 90 days'}
                </p>
                {conversations.length > 0 && (
                  <button
                    onClick={handleDeleteAllConversations}
                    className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {t?.dashboard?.deleteAll || 'Delete All'}
                  </button>
                )}
              </div>

              {conversations.map((conv, idx) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-mobile p-4 rounded-2xl"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.createdAt).toLocaleDateString()} at {new Date(conv.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {conv.messages.length} {t?.dashboard?.messages || 'messages'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteConversation(conv.sessionId)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {conv.messages.slice(-3).map((msg: any, msgIdx: number) => (
                      <div
                        key={msgIdx}
                        className={`text-xs p-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-primary/10 text-foreground ml-4'
                            : 'bg-secondary/50 text-foreground mr-4'
                        }`}
                      >
                        <span className="font-semibold">{msg.role === 'user' ? (t?.dashboard?.you || 'You') : (t?.dashboard?.ai || 'AI')}:</span>{' '}
                        {msg.content.substring(0, 100)}{msg.content.length > 100 ? '...' : ''}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
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
