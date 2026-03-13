'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  className?: string;
}

export function ChatWindow({ 
  messages, 
  onSendMessage, 
  isTyping = false, 
  className 
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Header */}
      <div className="flex bg-primary/5 border border-primary/20 backdrop-blur-md p-4 rounded-t-3xl items-center gap-3">
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
          <Bot className="responsive-icon" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">Aura</h2>
          <p className="text-xs text-muted-foreground font-medium">Your AI Companion • Always here</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 glass overflow-y-auto p-6 space-y-6 rounded-none border-t-0 border-b-0 border-white/20 custom-scrollbar relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-purple-50/20 pointer-events-none -z-10" />
        
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-white/80 border border-white filter backdrop-blur-md rounded-tl-sm text-foreground'
              }`}>
                <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-3 max-w-[80%]"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white/50 border border-white/20 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Aura is typing...</span>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-white/60 backdrop-blur-xl border border-white/40 p-4 shrink-0 rounded-b-3xl shadow-lg flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type how you're feeling..."
          className="flex-1 bg-white/50 border border-border/50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none max-h-32 text-foreground font-medium placeholder:text-muted-foreground"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="p-4 bg-primary text-primary-foreground rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}