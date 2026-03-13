'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI, tokenManager } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AuthPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login({ email: formData.username, password: formData.password });
        tokenManager.setToken(response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userName', response.data.name || '');
        router.push('/assessment');
      } else {
        const response = await authAPI.register({ 
          name: formData.name, 
          email: formData.username, 
          password: formData.password 
        });
        tokenManager.setToken(response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userName', response.data.name || '');
        router.push('/assessment');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] p-4 relative z-10 w-full overflow-hidden">
      {/* Background soft blur shapes */}
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-blue-300/30 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-purple-300/30 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10 mix-blend-multiply"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-mobile responsive-padding rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] w-full max-w-sm sm:max-w-md shadow-2xl relative"
      >
        <div className="text-center mb-8 sm:mb-10">
          <div className="mx-auto bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isLogin ? (t?.auth?.login || 'Welcome Back') : (t?.auth?.register || 'Create Account')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 font-medium">
            Take the next step in your mental wellness journey.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-foreground ml-1">Name</label>
              <input 
                type="text" 
                placeholder="How should we call you?"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
                className="w-full px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm sm:text-base touch-target"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-foreground ml-1">Email</label>
            <input 
              type="email" 
              placeholder="your.email@example.com"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm sm:text-base touch-target"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-foreground ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm sm:text-base touch-target"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full touch-button mt-4 bg-primary text-primary-foreground rounded-full text-base sm:text-lg font-bold hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLogin ? (t?.auth?.login || 'Sign In') : (t?.auth?.register || 'Sign Up'))} 
            {!isLoading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors touch-target"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
          
          <div className="relative flex items-center py-3 sm:py-4">
            <div className="flex-grow border-t border-border/50"></div>
            <span className="flex-shrink-0 mx-3 sm:mx-4 text-muted-foreground text-xs uppercase font-semibold">Or</span>
            <div className="flex-grow border-t border-border/50"></div>
          </div>

          <Link href="/assessment">
            <button className="w-full touch-button bg-secondary/80 text-secondary-foreground rounded-full text-sm sm:text-base font-semibold hover:bg-secondary transition-colors border border-border/30">
              {t?.auth?.anonymousMode || 'Continue Anonymously'}
            </button>
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="mt-10 flex items-start gap-3 p-4 bg-green-50/60 rounded-2xl border border-green-100/50 nature-border">
          <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-800 font-medium leading-relaxed">
            Your data is strictly confidential, encrypted, and never used for medical diagnosis. Your privacy is our priority.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
