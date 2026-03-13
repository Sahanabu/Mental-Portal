'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

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
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 font-medium">
            Take the next step in your mental wellness journey.
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-foreground ml-1">Name</label>
              <input 
                type="text" 
                placeholder="How should we call you?"
                className="w-full px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm sm:text-base touch-target"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-foreground ml-1">Email</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              className="w-full px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm sm:text-base touch-target"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-foreground ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm sm:text-base touch-target"
            />
          </div>

          <button 
            type="button" 
            className="w-full touch-button mt-4 bg-primary text-primary-foreground rounded-full text-base sm:text-lg font-bold hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
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
              Continue Anonymously
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
