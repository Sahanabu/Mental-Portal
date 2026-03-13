'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, X, Sparkles, Mic2 } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Track {
  title: string;
  artist: string;
  youtubeSearch: string;
  language: string;
  moodType: 'relaxing' | 'uplifting' | 'calming' | 'motivating';
}

const MOOD_COLORS: Record<string, string> = {
  relaxing:   'bg-teal-100 text-teal-700',
  uplifting:  'bg-yellow-100 text-yellow-700',
  calming:    'bg-blue-100 text-blue-700',
  motivating: 'bg-orange-100 text-orange-700',
};

interface Props {
  moodCategory: string;
  state?: string; // raw mood from check-in (happy/sad/anxious etc) or assessment category
}

export function MusicTherapySection({ moodCategory, state }: Props) {
  const { t, language } = useLanguage();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const effectiveState = state || moodCategory;

  useEffect(() => {
    if (!effectiveState) return;
    setLoading(true);
    aiAPI.generateMusicRecommendations({ moodCategory: effectiveState, language })
      .then(res => setTracks(res.data.tracks || []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, [effectiveState, language]);

  const mt = (t as any)?.music;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
          <Music className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            {mt?.title || 'Music Therapy'}
            <Sparkles className="w-4 h-4 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground">
            {mt?.description || 'Recommended music to improve your mood'}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-10 justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">{mt?.loading || 'Finding music for you...'}</p>
        </div>
      )}

      {/* Track cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track, i) => (
            <motion.div
              key={`${track.youtubeSearch}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-mobile rounded-2xl overflow-hidden border border-white/40 shadow-lg"
            >
              {/* Thumbnail area with gradient */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_white,_transparent_70%)]" />
                <Mic2 className="w-12 h-12 text-white/60" />
                {/* Mood badge */}
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${MOOD_COLORS[track.moodType] || 'bg-gray-100 text-gray-700'}`}>
                  {mt?.[track.moodType] || track.moodType}
                </span>
                {/* Language badge */}
                <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {track.language}
                </span>
                {/* Play overlay */}
                <button
                  onClick={() => setActiveSearch(track.youtubeSearch)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
                  aria-label={`Play ${track.title}`}
                >
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </button>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="font-bold text-foreground text-sm leading-snug mb-1 line-clamp-1">{track.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{track.artist}</p>
                <button
                  onClick={() => setActiveSearch(track.youtubeSearch)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" fill="white" />
                  {mt?.play || 'Play Music'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* YouTube embed modal */}
      <AnimatePresence>
        {activeSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setActiveSearch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveSearch(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Close player"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(activeSearch)}&autoplay=1`}
                  title="Music player"
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
