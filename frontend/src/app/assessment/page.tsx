'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Brain, Send, CheckCircle2, Loader2, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import { adaptiveAssessmentAPI, interactionsAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { encrypt } from '@/lib/crypto';

interface Question { id: number; text: string; category: string; }
interface Option { label: string; value: number; }
interface Message { role: 'user' | 'assistant'; text: string; }

type Phase = 'idle' | 'loading' | 'predefined' | 'followup' | 'done';

const CATEGORY_COLORS: Record<string, string> = {
  Minimal:  'text-green-600 bg-green-50 border-green-200',
  Mild:     'text-yellow-600 bg-yellow-50 border-yellow-200',
  Moderate: 'text-orange-600 bg-orange-50 border-orange-200',
  Severe:   'text-red-600 bg-red-50 border-red-200',
};

const SCORE_BAR_COLOR: Record<string, string> = {
  Minimal:  'bg-green-500',
  Mild:     'bg-yellow-500',
  Moderate: 'bg-orange-500',
  Severe:   'bg-red-500',
};

export default function AssessmentPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const a = t?.assessment;

  const [phase, setPhase] = useState<Phase>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [result, setResult] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const startAssessment = async () => {
    setPhase('loading');
    try {
      const res = await adaptiveAssessmentAPI.start({ language });
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      setOptions(res.data.options);
      setAnswers(new Array(res.data.questions.length).fill(-1));
      setPhase('predefined');
    } catch {
      setPhase('idle');
    }
  };

  const selectAnswer = (value: number) => {
    const updated = [...answers];
    updated[currentQ] = value;
    setAnswers(updated);
  };

  const nextQuestion = () => {
    if (answers[currentQ] === -1) return;
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      submitPredefined();
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) setCurrentQ(q => q - 1);
  };

  const submitPredefined = async () => {
    if (!sessionId) return;
    setPhase('loading');
    try {
      const res = await adaptiveAssessmentAPI.respond({
        sessionId,
        phase: 'predefined',
        predefinedAnswers: answers,
        language,
      });
      setMessages([{ role: 'assistant', text: res.data.question }]);
      setPhase('followup');
    } catch {
      setPhase('predefined');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !sessionId) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setSending(true);

    try {
      const res = await adaptiveAssessmentAPI.respond({
        sessionId,
        phase: 'followup',
        message: userText,
        language,
      });

      if (res.data.type === 'result') {
        const r = res.data.result;
        setResult(r);
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `Assessment complete! Your wellness score is ${r.score}/27 — ${r.category}.\n\n${r.summary}`,
        }]);
        setPhase('done');

        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const encrypted = await encrypt(userId, { type: 'assessment', result: r, sessionId });
            await interactionsAPI.save({ type: 'assessment', encryptedPayload: encrypted });
          } catch { /* non-blocking */ }
        }
        localStorage.setItem('lastAssessment', JSON.stringify(r));
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: res.data.question }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Could you tell me more about how this has been affecting you?" }]);
    } finally {
      setSending(false);
    }
  };

  const progress = questions.length ? ((currentQ + 1) / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-3.5rem)] p-4 pt-8">
      <div className="w-full max-w-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{a?.title || 'AI Wellness Assessment'}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" /> {a?.subtitle || 'Structured · Adaptive · Encrypted'}
            </p>
          </div>
        </div>

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl border border-white/30 p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <div className="max-w-sm">
              <h2 className="text-xl font-bold mb-2">{a?.howItWorks || 'How does it work?'}</h2>
              <ol className="text-sm text-muted-foreground text-left space-y-2 mt-3">
                <li className="flex gap-2"><span className="font-bold text-primary">1.</span> {a?.step1 || 'Answer 7 standardized wellness questions (PHQ-9 / GAD-7 style)'}</li>
                <li className="flex gap-2"><span className="font-bold text-primary">2.</span> {a?.step2 || 'Our AI asks 2–3 follow-up questions to understand your context'}</li>
                <li className="flex gap-2"><span className="font-bold text-primary">3.</span> {a?.step3 || 'Get a precise score (0–27) with personalized recommendations'}</li>
              </ol>
            </div>
            <button onClick={startAssessment}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
              {a?.beginAssessment || 'Begin Assessment'}
            </button>
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {phase === 'loading' && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {/* ── PREDEFINED QUESTIONS ── */}
        {phase === 'predefined' && questions.length > 0 && (
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-5">

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
              </div>
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                {currentQ + 1} / {questions.length}
              </span>
            </div>

            {/* Category badge */}
            <div className="glass rounded-3xl border border-white/30 p-6 sm:p-8">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">
                {questions[currentQ].category}
              </span>
              <p className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed mb-6">
                {questions[currentQ].text}
              </p>

              {/* Answer options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map(opt => (
                  <button key={opt.value} onClick={() => selectAnswer(opt.value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all font-medium text-sm ${
                      answers[currentQ] === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 bg-white/40 hover:border-primary/50 hover:bg-primary/5 text-foreground'
                    }`}>
                    <span className={`inline-block w-6 h-6 rounded-full border-2 mr-2 align-middle transition-colors ${
                      answers[currentQ] === opt.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentQ > 0 && (
                <button onClick={prevQuestion}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border/50 bg-white/40 text-sm font-medium hover:bg-white/60 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> {a?.back || 'Back'}
                </button>
              )}
              <button onClick={nextQuestion} disabled={answers[currentQ] === -1}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100 shadow-md">
                {currentQ === questions.length - 1 ? (a?.continueToFollowup || 'Continue to AI Follow-up') : (a?.next || 'Next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── AI FOLLOW-UP CHAT ── */}
        {(phase === 'followup' || phase === 'done') && (
          <div className="flex flex-col gap-4">
            {/* Score summary from predefined */}
            <div className="glass rounded-2xl border border-white/30 p-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{a?.predefinedScore || 'Predefined Score'}</p>
                <p className="text-2xl font-black text-primary">
                  {answers.reduce((s, v) => s + (v >= 0 ? v : 0), 0)}<span className="text-sm text-muted-foreground">/21</span>
                </p>
              </div>
              <div className="flex-1 h-px bg-border" />
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {a?.aiFollowupNote || 'AI follow-up adds up to 6 points based on severity context'}
              </p>
            </div>

            {/* Chat messages */}
            <div className="glass rounded-3xl border border-white/30 p-4 overflow-y-auto min-h-[300px] max-h-[50vh] space-y-4 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                      msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {msg.role === 'assistant' ? '🧠' : '👤'}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'assistant'
                        ? 'bg-white/80 border border-white text-foreground rounded-tl-sm'
                        : 'bg-primary text-primary-foreground rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">🧠</div>
                  <div className="bg-white/80 border border-white p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">{a?.analyzing || 'Analyzing...'}</span>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {phase === 'followup' && (
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-3 items-end">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  placeholder={a?.shareFeeling || "Share how you're feeling..."}
                  rows={2}
                  className="flex-1 bg-white/60 border border-border/50 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button type="submit" disabled={!input.trim() || sending}
                  className="p-4 bg-primary text-primary-foreground rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shrink-0">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Result card */}
            {phase === 'done' && result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Score card */}
                <div className="glass rounded-2xl p-6 border border-primary/20">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{a?.finalScore || 'Final Score'}</p>
                      <p className="text-5xl font-black text-primary">
                        {result.score}<span className="text-lg text-muted-foreground">/27</span>
                      </p>
                    </div>
                    <div className="text-center flex flex-col items-center justify-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{a?.category || 'Category'}</p>
                      <span className={`px-4 py-2 rounded-full border font-bold text-sm ${CATEGORY_COLORS[result.category] || ''}`}>
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`h-full rounded-full ${SCORE_BAR_COLOR[result.category] || 'bg-primary'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(result.score / 27) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 Minimal</span><span>7 Mild</span><span>14 Moderate</span><span>20 Severe</span>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="glass rounded-2xl p-4 border border-white/30">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{a?.scoreBreakdown || 'Score Breakdown'}</p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex-1 text-center p-3 bg-white/40 rounded-xl">
                      <p className="text-muted-foreground text-xs mb-1">{a?.predefined7q || 'Predefined (7 Qs)'}</p>
                      <p className="font-black text-lg text-foreground">
                        {result.predefinedAnswers?.reduce((s: number, v: number) => s + v, 0) ?? '—'}<span className="text-xs text-muted-foreground">/21</span>
                      </p>
                    </div>
                    <div className="flex-1 text-center p-3 bg-white/40 rounded-xl">
                      <p className="text-muted-foreground text-xs mb-1">{a?.aiFollowup || 'AI Follow-up'}</p>
                      <p className="font-black text-lg text-foreground">
                        +{result.followUpBonus ?? 0}<span className="text-xs text-muted-foreground">/6</span>
                      </p>
                    </div>
                    <div className="flex-1 text-center p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <p className="text-primary text-xs mb-1 font-bold">{a?.total || 'Total'}</p>
                      <p className="font-black text-lg text-primary">
                        {result.score}<span className="text-xs text-muted-foreground">/27</span>
                      </p>
                    </div>
                  </div>
                </div>

                {result.recommendations?.length > 0 && (
                  <div className="glass rounded-2xl p-4 border border-white/30">
                    <p className="text-sm font-bold text-primary mb-2">{a?.recommendations || 'Recommendations'}</p>
                    <ul className="space-y-1">
                      {result.recommendations.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-foreground/80 flex gap-2">
                          <span className="text-primary shrink-0">✓</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button onClick={() => router.push(`/dashboard?score=${result.score}`)}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-5 h-5" /> {a?.viewDashboard || 'View Full Dashboard'}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
