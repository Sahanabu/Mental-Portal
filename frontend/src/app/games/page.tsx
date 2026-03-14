'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Hash, Type, Layers, Trophy, Star, RotateCcw, ChevronRight, Lock, CheckCircle2, XCircle, Loader2, TrendingUp, Target, Award, Medal, ChevronLeft, Users } from 'lucide-react';
import { gameAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

// ── Types ──────────────────────────────────────────────────────────────────
type GameType = 'logic' | 'pattern' | 'word' | 'number' | 'memory';
type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'hub' | 'loading' | 'memorizing' | 'playing' | 'result';

interface Challenge {
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  hint?: string;
  memorySequence?: string[] | null;
  memoryDuration?: number | null;
}

interface GameStats { total: number; correct: number; accuracy: number; totalXP: number; }
interface LeaderboardEntry { userId: string; username: string; bestScore: number; totalXP: number; gamesPlayed: number; accuracy: number; }
interface LeaderboardPagination { page: number; pageSize: number; total: number; totalPages: number; }

// ── Game category config ───────────────────────────────────────────────────
const getGameCategories = (g: any) => [
  {
    id: 'logic' as GameType,
    label: g?.categories?.logic ?? 'Logic Challenges',
    icon: Brain,
    desc: g?.categories?.logicDesc ?? 'Test your reasoning and deductive thinking',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    emoji: '🧠',
  },
  {
    id: 'pattern' as GameType,
    label: g?.categories?.pattern ?? 'Pattern Recognition',
    icon: Layers,
    desc: g?.categories?.patternDesc ?? 'Spot sequences and visual patterns',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/30',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    emoji: '🔷',
  },
  {
    id: 'word' as GameType,
    label: g?.categories?.word ?? 'Word Puzzles',
    icon: Type,
    desc: g?.categories?.wordDesc ?? 'Riddles, anagrams and wordplay',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    emoji: '📝',
  },
  {
    id: 'number' as GameType,
    label: g?.categories?.number ?? 'Number Puzzles',
    icon: Hash,
    desc: g?.categories?.numberDesc ?? 'Sequences, arithmetic and math tricks',
    gradient: 'from-orange-500 to-amber-600',
    glow: 'shadow-orange-500/30',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    emoji: '🔢',
  },
  {
    id: 'memory' as GameType,
    label: g?.categories?.memory ?? 'Memory Challenges',
    icon: Zap,
    desc: g?.categories?.memoryDesc ?? 'Train your short-term memory',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/30',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    emoji: '⚡',
  },
];

const DIFFICULTY_CONFIG = {
  easy:   { color: 'text-green-600 bg-green-50 border-green-200',   xp: 10,  score: 100 },
  medium: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', xp: 20,  score: 200 },
  hard:   { color: 'text-red-600 bg-red-50 border-red-200',          xp: 35,  score: 350 },
};

// ── Confetti component ─────────────────────────────────────────────────────
function Confetti() {
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const pieces = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: 2 + Math.random() * 1.5,
      delay: Math.random() * 0.5,
    }))
  )[0];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div key={p.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: colors[p.id % colors.length], left: p.left, top: '-10px' }}
          animate={{ y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function GamesPage() {
  const { t: translations, language } = useLanguage();
  const g = translations?.games ?? {};
  const GAME_CATEGORIES = getGameCategories(g);
  const diffLabel = { easy: g.easy ?? 'Easy', medium: g.medium ?? 'Medium', hard: g.hard ?? 'Hard' };
  const [phase, setPhase] = useState<Phase>('hub');
  const [selectedType, setSelectedType] = useState<GameType>('logic');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [memCountdown, setMemCountdown] = useState(5);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbPagination, setLbPagination] = useState<LeaderboardPagination | null>(null);
  const [lbPage, setLbPage] = useState(1);
  const [lbLoading, setLbLoading] = useState(false);
  const PAGE_SIZE = 50;

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  // Load user stats on mount
  useEffect(() => {
    if (!userId || !isLoggedIn) return;
    gameAPI.getUserSessions(userId)
      .then(res => {
        setStats(res.data.stats);
        setRecentGames(res.data.sessions.slice(0, 5));
      })
      .catch(() => {});
  }, [userId, isLoggedIn]);

  // Load leaderboard
  const loadLeaderboard = useCallback((page: number) => {
    setLbLoading(true);
    gameAPI.getLeaderboard({ page, pageSize: PAGE_SIZE })
      .then(res => {
        setLeaderboard(res.data.leaderboard);
        setLbPagination(res.data.pagination);
        setLbPage(page);
      })
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, []);

  useEffect(() => { loadLeaderboard(1); }, [loadLeaderboard]);

  const startGame = useCallback(async (type: GameType, diff: Difficulty) => {
    setSelectedType(type);
    setDifficulty(diff);
    setPhase('loading');
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    try {
      const res = await gameAPI.generateChallenge({ gameType: type, difficulty: diff, language });
      setChallenge(res.data.challenge);
      if (type === 'memory' && res.data.challenge.memorySequence?.length) {
        setMemCountdown(res.data.challenge.memoryDuration ?? 8);
        setPhase('memorizing');
      } else {
        setPhase('playing');
      }
    } catch {
      setPhase('hub');
    }
  }, []);

  // Countdown timer for memorizing phase
  useEffect(() => {
    if (phase !== 'memorizing') return;
    if (memCountdown <= 0) { setPhase('playing'); return; }
    const t = setTimeout(() => setMemCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, memCountdown]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!challenge || selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer.trim().toLowerCase() === challenge.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);

    const diff = (challenge.difficulty as Difficulty) || difficulty;
    const s = correct ? DIFFICULTY_CONFIG[diff]?.score ?? 200 : 0;
    const xp = correct ? DIFFICULTY_CONFIG[diff]?.xp ?? 20 : 2;
    setScore(s);
    setXpEarned(xp);

    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }

    setSessionScore(prev => prev + s);
    setSessionXP(prev => prev + xp);
    setGamesPlayed(prev => prev + 1);

    // Save to DB (non-blocking)
    if (isLoggedIn) {
      gameAPI.saveSession({
        gameType: selectedType,
        difficulty,
        challenge: challenge.question,
        options: challenge.options,
        correctAnswer: challenge.correctAnswer,
        userAnswer: answer,
      }).then(() => {
        // Refresh stats after save
        if (userId) {
          gameAPI.getUserSessions(userId)
            .then(res => { setStats(res.data.stats); setRecentGames(res.data.sessions.slice(0, 5)); })
            .catch(() => {});
        }
        loadLeaderboard(lbPage);
      }).catch(() => {});
    }

    setTimeout(() => setPhase('result'), 800);
  }, [challenge, selectedAnswer, difficulty, selectedType, isLoggedIn, userId, loadLeaderboard, lbPage]);

  const playAgain = () => startGame(selectedType, difficulty);
  const backToHub = () => { setPhase('hub'); setChallenge(null); setSelectedAnswer(null); setIsCorrect(null); };

  const selectedCategory = GAME_CATEGORIES.find(c => c.id === selectedType);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 pt-6 sm:pt-8">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{g.title ?? 'Game Hub'}</h1>
              <p className="text-xs text-muted-foreground">{g.subtitle ?? 'AI-powered cognitive challenges'}</p>
            </div>
          </div>

          {/* Session stats pill */}
          {gamesPlayed > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 glass rounded-2xl px-4 py-2 border border-white/30">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{g.score ?? 'Score'}</p>
                <p className="text-sm font-black text-primary">{sessionScore}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{g.xp ?? 'XP'}</p>
                <p className="text-sm font-black text-amber-500">+{sessionXP}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{g.played ?? 'Played'}</p>
                <p className="text-sm font-black text-foreground">{gamesPlayed}</p>
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ══ HUB ══════════════════════════════════════════════════════════ */}
          {phase === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Difficulty selector */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-semibold text-muted-foreground mr-1">{g.difficulty ?? 'Difficulty'}:</span>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      difficulty === d
                        ? DIFFICULTY_CONFIG[d].color + ' scale-105 shadow-sm'
                        : 'border-border/50 bg-white/40 text-muted-foreground hover:border-primary/40'
                    }`}>
                    {diffLabel[d]}
                  </button>
                ))}
              </div>

              {/* Game category cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {GAME_CATEGORIES.map((cat, i) => (
                  <motion.button key={cat.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startGame(cat.id, difficulty)}
                    className={`group relative glass rounded-3xl p-6 text-left border ${cat.border} shadow-xl ${cat.glow} hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                  >
                    {/* Gradient blob */}
                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${cat.gradient} opacity-20 group-hover:opacity-30 transition-opacity blur-xl`} />

                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-4 shadow-lg text-xl`}>
                      {cat.emoji}
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-1">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{cat.desc}</p>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${DIFFICULTY_CONFIG[difficulty].color}`}>
                        {diffLabel[difficulty]} · +{DIFFICULTY_CONFIG[difficulty].xp} {g.xp ?? 'XP'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Stats panel */}
              {stats && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="glass rounded-3xl border border-white/30 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h2 className="font-bold text-foreground">{g.yourStats ?? 'Your Stats'}</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: g.gamesPlayed ?? 'Games Played', value: stats.total, icon: '🎮' },
                      { label: g.correct ?? 'Correct', value: stats.correct, icon: '✅' },
                      { label: g.accuracy ?? 'Accuracy', value: `${stats.accuracy}%`, icon: '🎯' },
                      { label: g.totalXP ?? 'Total XP', value: stats.totalXP, icon: '⭐' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 bg-white/40 rounded-2xl">
                        <div className="text-xl mb-1">{s.icon}</div>
                        <p className="text-lg font-black text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {recentGames.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{g.recentGames ?? 'Recent Games'}</p>
                      <div className="space-y-2">
                        {recentGames.map((g, i) => {
                          const firstQ = g.questions?.[0];
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {g.correctCount > 0
                                  ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                  : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                                <span className="text-foreground/80 truncate max-w-[200px]">
                                  {firstQ?.question ?? g.gameType}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_CONFIG[g.difficulty as Difficulty]?.color || ''}`}>
                                  {g.difficulty}
                                </span>
                                <span className="text-xs font-bold text-amber-500">+{g.totalXP} XP</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Leaderboard */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                className="glass rounded-3xl border border-white/30 p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-500" />
                    <h2 className="font-bold text-foreground">{g.leaderboard ?? 'Leaderboard'}</h2>
                    {lbPagination && lbPagination.total > 0 && (
                      <span className="text-xs text-muted-foreground bg-white/40 border border-border/30 rounded-full px-2 py-0.5">
                        {(lbPage - 1) * PAGE_SIZE + 1}–{Math.min(lbPage * PAGE_SIZE, lbPagination.total)} {g.of ?? 'of'} {lbPagination.total}
                      </span>
                    )}
                  </div>
                  {lbPagination && lbPagination.totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        disabled={lbPage <= 1 || lbLoading}
                        onClick={() => loadLeaderboard(lbPage - 1)}
                        className="w-7 h-7 rounded-full border border-border/50 bg-white/40 flex items-center justify-center disabled:opacity-30 hover:bg-white/60 transition-colors">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-muted-foreground px-1">{lbPage}/{lbPagination.totalPages}</span>
                      <button
                        disabled={lbPage >= lbPagination.totalPages || lbLoading}
                        onClick={() => loadLeaderboard(lbPage + 1)}
                        className="w-7 h-7 rounded-full border border-border/50 bg-white/40 flex items-center justify-center disabled:opacity-30 hover:bg-white/60 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {lbLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {g.noGames ?? 'No games played yet. Be the first!'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => {
                      const rank = (lbPage - 1) * PAGE_SIZE + i + 1;
                      const isMe = userId && entry.userId?.toString() === userId;
                      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                      return (
                        <motion.div key={entry.userId}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                            isMe ? 'bg-primary/10 border-primary/30' : 'bg-white/30 border-border/20 hover:bg-white/50'
                          }`}>
                          <div className="w-8 text-center shrink-0">
                            {medal
                              ? <span className="text-lg">{medal}</span>
                              : <span className="text-xs font-black text-muted-foreground">#{rank}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                              {entry.username}{isMe && <span className="text-xs font-normal ml-1 text-primary/70">({translations?.dashboard?.you ?? 'you'})</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.gamesPlayed} {g.games ?? 'games'} · {entry.accuracy}% acc</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-foreground">{entry.bestScore.toLocaleString()}</p>
                            <p className="text-xs text-amber-500 font-bold">⭐ {entry.totalXP} XP</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {!isLoggedIn && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="mt-4 flex items-center gap-2 text-sm text-muted-foreground glass rounded-2xl p-4 border border-white/30">
                  <Lock className="w-4 h-4 shrink-0" />
                  {g.signInToSave ?? 'Sign in to save your game progress and track XP across sessions.'}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ MEMORIZING ═══════════════════════════════════════════════════ */}
          {phase === 'memorizing' && challenge && (() => {
            const items = challenge.memorySequence ?? [];
            const total = challenge.memoryDuration ?? 8;
            const radius = 28;
            const circ = 2 * Math.PI * radius;
            const progress = (memCountdown / total) * circ;
            return (
              <motion.div key="memorizing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-8 py-12">

                {/* Label */}
                <div className="text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-500 bg-pink-500/10 border border-pink-500/30 px-3 py-1 rounded-full">
                    ⚡ {g.memorize ?? 'Memorize this sequence'}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">{g.memorizeDesc ?? 'It will disappear when the timer ends'}</p>
                </div>

                {/* Sequence display */}
                <div className="glass rounded-3xl border border-pink-500/30 px-8 py-6 shadow-xl shadow-pink-500/10 max-w-lg w-full">
                  <div className="flex flex-wrap justify-center gap-3">
                    {items.map((item, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-2xl px-4 py-2">
                        <span className="text-xs font-bold text-pink-400 w-5 text-center">{i + 1}.</span>
                        <span className="text-base font-bold text-foreground">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Countdown ring */}
                <div className="relative flex items-center justify-center">
                  <svg width="72" height="72" className="-rotate-90">
                    <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
                    <motion.circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
                      className="text-pink-500"
                      strokeDasharray={circ}
                      strokeDashoffset={circ - progress}
                      strokeLinecap="round"
                      animate={{ strokeDashoffset: circ - progress }}
                      transition={{ duration: 0.8, ease: 'linear' }}
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-foreground">{memCountdown}</span>
                </div>

                <button onClick={() => setPhase('playing')}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                  {g.skip ?? 'Skip → Go to question'}
                </button>
              </motion.div>
            );
          })()}

          {/* ══ LOADING ══════════════════════════════════════════════════════ */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${selectedCategory?.gradient} flex items-center justify-center shadow-2xl text-3xl`}>
                {selectedCategory?.emoji}
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">{g.generating ?? 'Generating Challenge...'}</p>
                <p className="text-sm text-muted-foreground mt-1">{g.aiCrafting ?? 'AI is crafting a unique puzzle for you'}</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ PLAYING ══════════════════════════════════════════════════════ */}
          {phase === 'playing' && challenge && (
            <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-5">

              {/* Top bar */}
              <div className="flex items-center justify-between">
                <button onClick={backToHub} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {g.back ?? '← Back'}
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${DIFFICULTY_CONFIG[challenge.difficulty as Difficulty]?.color || ''}`}>
                    {diffLabel[challenge.difficulty as Difficulty] ?? challenge.difficulty}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {selectedCategory?.label}
                  </span>
                </div>
              </div>

              {/* Question card */}
              <div className={`glass rounded-3xl border ${selectedCategory?.border} p-6 sm:p-8 relative overflow-hidden`}>
                <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${selectedCategory?.gradient} opacity-10 blur-2xl`} />
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedCategory?.gradient} flex items-center justify-center text-xl shrink-0 shadow-lg`}>
                    {selectedCategory?.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{selectedCategory?.label}</p>
                    <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">{challenge.question}</p>
                  </div>
                </div>

                {/* Hint */}
                {challenge.hint && (
                  <div className="mt-4">
                    {!showHint ? (
                      <button onClick={() => setShowHint(true)}
                        className="text-xs text-primary/70 hover:text-primary transition-colors underline underline-offset-2">
                        {g.showHint ?? 'Show hint'}
                      </button>
                    ) : (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 mt-2">
                        💡 {challenge.hint}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challenge.options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  const isRight = opt === challenge.correctAnswer;
                  let style = 'border-border/50 bg-white/40 hover:border-primary/50 hover:bg-primary/5 text-foreground';
                  if (selectedAnswer) {
                    if (isRight) style = 'border-green-500 bg-green-50 text-green-700';
                    else if (isSelected && !isRight) style = 'border-red-400 bg-red-50 text-red-600';
                    else style = 'border-border/30 bg-white/20 text-muted-foreground opacity-60';
                  }

                  return (
                    <motion.button key={i}
                      whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                      whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                      animate={isSelected && !isRight ? { x: [-6, 6, -4, 4, 0] } : {}}
                      transition={{ duration: 0.3 }}
                      onClick={() => !selectedAnswer && submitAnswer(opt)}
                      disabled={!!selectedAnswer}
                      className={`p-4 rounded-2xl border-2 text-left transition-all font-medium text-sm flex items-center gap-3 ${style}`}
                    >
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected && isRight ? 'border-green-500 bg-green-500 text-white' :
                        isSelected && !isRight ? 'border-red-400 bg-red-400 text-white' :
                        selectedAnswer && isRight ? 'border-green-500 bg-green-500 text-white' :
                        'border-current'
                      }`}>
                        {selectedAnswer && isRight ? '✓' : selectedAnswer && isSelected ? '✗' : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══ RESULT ═══════════════════════════════════════════════════════ */}
          {phase === 'result' && challenge && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-8">

              {/* Result icon */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl ${
                  isCorrect ? 'bg-green-100 shadow-green-200' : 'bg-red-50 shadow-red-100'
                }`}
              >
                {isCorrect ? '🎉' : '😅'}
              </motion.div>

              <div className="text-center">
                <h2 className={`text-2xl font-black mb-1 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                  {isCorrect ? (g.correct_answer ?? 'Correct!') : (g.wrong_answer ?? 'Not quite!')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isCorrect ? (g.correctMsg ?? 'Great thinking! Keep it up.') : `${g.wrongMsg ?? 'The correct answer was:'} "${challenge.correctAnswer}"`}
                </p>
              </div>

              {/* Score / XP */}
              {isCorrect && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="flex gap-4">
                  <div className="text-center glass rounded-2xl px-6 py-4 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">{g.score ?? 'Score'}</p>
                    <p className="text-3xl font-black text-primary">+{score}</p>
                  </div>
                  <div className="text-center glass rounded-2xl px-6 py-4 border border-amber-200">
                    <p className="text-xs text-muted-foreground mb-1">{g.xp ?? 'XP'}</p>
                    <p className="text-3xl font-black text-amber-500">+{xpEarned}</p>
                  </div>
                </motion.div>
              )}

              {/* Session running total */}
              <div className="glass rounded-2xl px-6 py-3 border border-white/30 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{g.session ?? 'Session'}:</span>
                <span className="font-bold text-foreground">{gamesPlayed} {g.games ?? 'games'}</span>
                <span className="text-primary font-bold">{sessionScore} {g.pts ?? 'pts'}</span>
                <span className="text-amber-500 font-bold">+{sessionXP} {g.xp ?? 'XP'}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full max-w-sm">
                <button onClick={backToHub}
                  className="flex-1 py-3 rounded-2xl border border-border/50 bg-white/40 text-sm font-semibold hover:bg-white/60 transition-colors flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" /> {g.hub ?? 'Hub'}
                </button>
                <button onClick={playAgain}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> {g.playAgain ?? 'Play Again'}
                </button>
              </div>

              {!isLoggedIn && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {g.signInProgress ?? 'Sign in to save your progress'}
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
