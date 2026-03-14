'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Star, X, Sparkles, ExternalLink } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Movie {
  title: string;
  year: string;
  genre: string;
  imdbId: string;
  reason: string;
  language: string;
  poster?: string;
  rating?: string;
}

interface Props {
  mood: string;
}

const GENRE_COLORS: Record<string, string> = {
  Comedy:    'bg-yellow-100 text-yellow-700',
  Drama:     'bg-blue-100 text-blue-700',
  Animation: 'bg-green-100 text-green-700',
  Romance:   'bg-pink-100 text-pink-700',
};

function genreColor(genre: string) {
  const first = genre.split(/[/|,]/)[0].trim();
  return GENRE_COLORS[first] || 'bg-purple-100 text-purple-700';
}

async function fetchPoster(imdbId: string): Promise<{ poster: string; rating: string }> {
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=trilogy`);
    const data = await res.json();
    return {
      poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : '',
      rating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : '',
    };
  } catch {
    return { poster: '', rating: '' };
  }
}

export function MovieSuggestionSection({ mood }: Props) {
  const { t, language } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Movie | null>(null);

  useEffect(() => {
    if (!mood) return;
    setLoading(true);
    aiAPI.generateMovieSuggestions({ mood, language })
      .then(async (res) => {
        const raw: Movie[] = res.data.movies || [];
        const enriched = await Promise.all(
          raw.map(async (m) => {
            const { poster, rating } = await fetchPoster(m.imdbId);
            return { ...m, poster, rating };
          })
        );
        setMovies(enriched);
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [mood, language]);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Film className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            Movies That Bring a Smile <Sparkles className="w-4 h-4 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground">AI-picked feel-good films just for you</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-10 justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Finding the perfect movies for you...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {movies.map((movie, i) => (
            <motion.div
              key={`${movie.imdbId}-${i}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-mobile rounded-2xl overflow-hidden border border-white/40 shadow-lg cursor-pointer group"
              onClick={() => setActive(movie)}
            >
              {/* Poster */}
              <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 overflow-hidden">
                {movie.poster
                  ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center"><Film className="w-12 h-12 text-white/30" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {movie.rating && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white font-bold">{movie.rating}</span>
                  </div>
                )}
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${genreColor(movie.genre)}`}>
                  {movie.genre.split(/[/|,]/)[0].trim()}
                </span>
              </div>
              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-1">{movie.title}</h3>
                <p className="text-xs text-muted-foreground">{movie.year} · {movie.language}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setActive(null)} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>

              {/* Poster */}
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                {active.poster
                  ? <img src={active.poster} alt={active.title} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full bg-gradient-to-br from-amber-900 to-red-900 flex items-center justify-center"><Film className="w-16 h-16 text-white/30" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
              </div>

              <div className="px-6 pb-6 -mt-8 relative">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xl font-black text-white leading-tight">{active.title}</h3>
                  {active.rating && (
                    <div className="flex items-center gap-1 shrink-0 bg-yellow-500/20 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-yellow-300 font-bold">{active.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/50 mb-3">{active.year} · {active.genre} · {active.language}</p>
                <p className="text-sm text-white/80 leading-relaxed mb-5">{active.reason}</p>
                <a
                  href={`https://www.imdb.com/title/${active.imdbId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl transition-colors text-sm"
                >
                  <Film className="w-4 h-4" />
                  View on IMDB
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
