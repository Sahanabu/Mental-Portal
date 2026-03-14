'use client';

import { Phone, ExternalLink, ShieldAlert, HeartPulse, BookOpen, UserPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { aiAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

const localResources = [
  {
    title: 'National Crisis Lifeline',
    titleKey: 'nationalCrisis',
    description: 'Free, confidential support for people in distress, 24/7.',
    descKey: 'nationalCrisisDesc',
    phone: '988',
    link: 'https://988lifeline.org/',
    icon: ShieldAlert,
    urgent: true
  },
  {
    title: 'Crisis Text Line',
    titleKey: 'crisisText',
    description: 'Text HOME to connect with a volunteer Crisis Counselor 24/7.',
    descKey: 'crisisTextDesc',
    phone: 'Text HOME to 741741',
    link: 'https://www.crisistextline.org/',
    icon: Phone,
    urgent: true
  },
  {
    title: 'Therapist Finder',
    titleKey: 'therapistFinder',
    description: 'Find a licensed therapist within your local area or online.',
    descKey: 'therapistFinderDesc',
    link: 'https://www.psychologytoday.com/us/therapists',
    icon: UserPlus,
    urgent: false
  },
  {
    title: 'Mindfulness Library',
    titleKey: 'mindfulnessLibrary',
    description: 'A curated collection of guided meditations and articles on mental well-being.',
    descKey: 'mindfulnessLibraryDesc',
    link: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
    icon: BookOpen,
    urgent: false
  }
];

export default function ResourcesPage() {
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await aiAPI.getResourceRecommendations({ language });
        setAiRecommendations(response.data.recommendations);
      } catch (error) {
        setAiRecommendations(t?.resources?.subtitle || 'Explore support groups, mental health apps, and professional counseling for personalized guidance.');
      }
    };
    fetchRecommendations();
  }, [language, t]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-12 max-w-7xl mx-auto pt-20">
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-primary">{t?.resources?.title || 'Support & Resources'}</h1>
        <p className="text-lg text-muted-foreground">
          {t?.resources?.subtitle || 'You are not alone. Whether you need immediate help or are just looking for ways to improve your mental well-being, these resources are here for you.'}
        </p>
      </header>

      {aiRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-mobile p-6 rounded-3xl mb-8 max-w-3xl mx-auto border-2 border-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-primary">{t?.resources?.aiRecommendations || 'AI Recommendations for You'}</h2>
          </div>
          <p className="text-sm sm:text-base text-foreground/80">{aiRecommendations}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {localResources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass p-8 rounded-[2.5rem] border hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group ${
                resource.urgent ? 'border-red-200 bg-red-50/50' : 'border-white/40'
              }`}
            >
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                  resource.urgent ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                }`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                       {t?.resources?.[resource.titleKey] || resource.title}
                       {resource.urgent && <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-sm">{t?.resources?.urgent || 'Urgent'}</span>}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{t?.resources?.[resource.descKey] || resource.description}</p>
                  </div>
                  
                  {resource.phone && (
                    <div className="inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl text-foreground font-bold shadow-sm border border-white/40">
                      <Phone className="w-4 h-4" /> {resource.phone}
                    </div>
                  )}
                  
                  <div>
                    <a 
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors pt-2 ${
                        resource.urgent ? 'text-red-600 hover:text-red-800' : 'text-primary hover:text-primary/70'
                      }`}
                    >
                      {t?.resources?.visitSite || 'Visit Site'} <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-20 p-8 md:p-12 glass rounded-[3rem] text-center border-l-4 border-l-primary flex flex-col items-center max-w-4xl mx-auto"
      >
         <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
           <HeartPulse className="w-8 h-8" />
         </div>
         <h2 className="text-3xl font-bold mb-4">{t?.resources?.dailyWellnessTip || 'Daily Wellness Tip'}</h2>
         <p className="text-lg text-muted-foreground italic">
           {t?.resources?.wellnessTip || '"Taking just 5 minutes a day to practice mindful breathing can lower cortisol levels, reducing stress and anxiety significantly over time."'}
         </p>
      </motion.div>
    </div>
  );
}
