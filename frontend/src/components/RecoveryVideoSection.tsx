'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Youtube, Sparkles } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Video {
  title: string;
  youtubeId: string;
  description: string;
  category: 'entertainment' | 'laughing' | 'relaxation' | 'motivation';
}

const CATEGORY_COLORS: Record<string, string> = {
  entertainment: 'bg-purple-100 text-purple-700',
  laughing:      'bg-yellow-100 text-yellow-700',
  relaxation:    'bg-teal-100 text-teal-700',
  motivation:    'bg-orange-100 text-orange-700',
};

interface Props {
  category: string;
  score: number;
}

export function RecoveryVideoSection({ category, score }: Props) {
  const { t, language } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    aiAPI.generateVideoRecommendations({ category, score, language })
      .then(res => setVideos(res.data.videos || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [category, score, language]);

  const vt = t?.videos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
          <Youtube className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            {vt?.title || 'Recommended Videos For You'}
            <Sparkles className="w-4 h-4 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground">{vt?.description || 'These videos may help improve your mood'}</p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-10 justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">{vt?.loading || 'Finding the best videos for you...'}</p>
        </div>
      )}

      {/* Video cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, i) => (
            <motion.div
              key={`${video.youtubeId}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-mobile rounded-2xl overflow-hidden border border-white/40 shadow-lg group"
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play overlay */}
                <button
                  onClick={() => setActiveId(video.youtubeId)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                  aria-label={`Play ${video.title}`}
                >
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </button>
                {/* Category badge */}
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${CATEGORY_COLORS[video.category] || 'bg-gray-100 text-gray-700'}`}>
                  {vt?.[video.category] || video.category}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="font-bold text-foreground text-sm leading-snug mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
                <button
                  onClick={() => setActiveId(video.youtubeId)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" fill="white" />
                  {vt?.watch || 'Watch Video'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* YouTube embed modal */}
      <AnimatePresence>
        {activeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setActiveId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveId(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
