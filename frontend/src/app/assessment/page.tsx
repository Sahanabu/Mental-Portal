'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Brain } from 'lucide-react';
import { AssessmentCard } from '@/components/AssessmentCard';
import { assessmentAPI } from '@/services/api';

const options = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

interface Question {
  id: number;
  question: string;
  category?: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const loadQuestions = async () => {
      const cached = localStorage.getItem('assessmentQuestions');
      if (cached) {
        const parsed = JSON.parse(cached);
        setQuestions(parsed);
        setSessionQuestions(parsed);
        setIsLoadingQuestions(false);
        return;
      }

      try {
        const response = await assessmentAPI.generateQuestions();
        if (response.data.questions && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
          setSessionQuestions(response.data.questions);
          localStorage.setItem('assessmentQuestions', JSON.stringify(response.data.questions));
        } else {
          setUseFallback(true);
        }
      } catch (error: any) {
        console.log('Dynamic questions failed, using fallback:', error.message);
        setUseFallback(true);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  const fallbackQuestions: Question[] = [
    { id: 1, question: "Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?", category: "Anxiety" },
    { id: 2, question: "How often have you not been able to stop or control worrying?", category: "Worry" },
    { id: 3, question: "How often have you felt down, depressed, or hopeless?", category: "Mood" },
    { id: 4, question: "How often have you felt tired or had little energy?", category: "Energy" },
    { id: 5, question: "How often have you had little interest in doing things?", category: "Interest" },
    { id: 6, question: "Over the last 2 weeks, how often have you had trouble sleeping?", category: "Sleep" }
  ];

  const currentQuestions = useFallback ? fallbackQuestions : sessionQuestions;
  const currentQ = currentQuestions[currentStep] || { id: currentStep + 1, question: 'Loading...', category: '' };
  const progress = ((currentStep) / currentQuestions.length) * 100;

  const handleOptionSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentStep]: value }));
    
    if (currentStep < currentQuestions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 400);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const answersArray = Object.values(answers).map(Number);
    
    try {
      const analysisResponse = await assessmentAPI.analyzeAnswers({
        answers: answersArray,
        questions: currentQuestions
      });
      localStorage.setItem('lastAssessment', JSON.stringify(analysisResponse.data));
      router.push(`/dashboard?score=${analysisResponse.data.score}`);
    } catch (error) {
      console.log('Analysis failed, using simple score');
      const totalScore = answersArray.reduce((a, b) => a + b, 0);
      localStorage.setItem('lastAssessment', JSON.stringify({ score: totalScore, category: 'Analyzing...' }));
      router.push(`/dashboard?score=${totalScore}`);
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"
          />
          <p>Generating personalized questions...</p>
          <p className="text-sm text-muted-foreground mt-2">Powered by AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] p-4 relative overflow-hidden">
      {useFallback && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-yellow-100/80 border border-yellow-300/50 rounded-xl max-w-sm text-xs text-yellow-800"
        >
          <Brain className="w-4 h-4 inline mr-1" />
          Using standard questions (AI temporarily unavailable)
        </motion.div>
      )}
      
      {/* Dynamic Background based on progress */}
      <div 
        className="absolute inset-0 -z-10 transition-colors duration-1000"
        style={{ 
          background: `linear-gradient(135deg, 
            hsl(120, ${60 - currentStep*5}%, ${98 - currentStep*2}%), 
            hsl(${150 + currentStep*10}, ${40 - currentStep*3}%, ${96 - currentStep*2}%)
          )` 
        }}
      />

      <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl mb-6 sm:mb-8 space-y-2">
        <div className="flex justify-between text-xs sm:text-sm font-semibold text-muted-foreground">
          <span>Question {currentStep + 1} of {currentQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-white/20">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={currentStep}
           initial={{ opacity: 0, x: 50, scale: 0.95 }}
           animate={{ opacity: 1, x: 0, scale: 1 }}
           exit={{ opacity: 0, x: -50, scale: 0.95 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           className="w-full max-w-sm sm:max-w-lg md:max-w-2xl"
        >
          <div className="glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/40 backdrop-blur-3xl">
            <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest mb-4 sm:mb-6 flex items-center gap-1">
              {currentQ.category || `Step ${currentStep + 1}`}
              {!useFallback && <Brain className="w-3 h-3" />}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight mb-6 sm:mb-8 md:mb-10">
              {currentQ.question}
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {options.map((option) => (
                <AssessmentCard
                  key={option.value}
                  option={option}
                  isSelected={answers[currentStep] === option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className="touch-target"
                />
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-6 border-t border-border/30">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="p-2 sm:p-3 rounded-full hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors touch-target"
                aria-label="Previous question"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>
              
              {currentStep === currentQuestions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={answers[currentStep] === undefined || isSubmitting}
                  className="px-6 sm:px-8 py-3 bg-primary text-primary-foreground rounded-full text-base sm:text-lg font-bold disabled:opacity-50 hover:scale-105 transition-all flex items-center gap-2 touch-target"
                >
                  {isSubmitting ? 'AI Analyzing...' : 'Get AI Analysis'}
                  {!isSubmitting && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(Math.min(currentQuestions.length - 1, currentStep + 1))}
                  disabled={answers[currentStep] === undefined}
                  className="p-2 sm:p-3 bg-foreground text-background rounded-full hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 transition-all touch-target"
                  aria-label="Next question"
                >
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
