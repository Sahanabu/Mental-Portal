'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, X, Sparkles, Mic2, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Track {
  title: string;
  artist: string;
  deezerQuery: string;
  language: string;
  moodType: 'relaxing' | 'uplifting' | 'calming' | 'motivating';
  albumArt?: string;
  previewUrl?: string;
}

const MOOD_COLORS: Record<string, string> = {
  relaxing:   'bg-teal-100 text-teal-700',
  uplifting:  'bg-yellow-100 text-yellow-700',
  calming:    'bg-blue-100 text-blue-700',
  motivating: 'bg-orange-100 text-orange-700',
};

interface Props {
  moodCategory: string;
  state?: string;
  assessmentScore?: number;
}

async function enrichWithItunes(track: Track): Promise<Track> {
  try {
    const q = encodeURIComponent(track.deezerQuery);
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=music&limit=1&entity=song`);
    const data = await res.json();
    const hit = data?.results?.[0];
    if (!hit) return track;
    return {
      ...track,
      albumArt: hit.artworkUrl100?.replace('100x100', '300x300'),
      previewUrl: hit.previewUrl,
      title: hit.trackName || track.title,
      artist: hit.artistName || track.artist,
    };
  } catch {
    return track;
  }
}

function MusicPlayer({
  tracks,
  initialIndex,
  onClose,
}: {
  tracks: Track[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = tracks[idx];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => { if (idx < tracks.length - 1) setIdx(i => i + 1); else setPlaying(false); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDur);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDur);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
    };
  }, [idx, tracks.length]);

  // load new track when idx changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setProgress(0);
    setDuration(0);
    if (track.previewUrl) {
      audio.src = track.previewUrl;
      audio.load();
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      setPlaying(false);
    }
  }, [idx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const fmt = (s: number) => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}
      >
        <audio ref={audioRef} preload="none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Album art */}
        <div className="relative w-full aspect-square">
          {track.albumArt ? (
            <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-800/50">
              <Music className="w-20 h-20 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] via-transparent to-transparent" />
          {/* Mood badge */}
          <span className={`absolute top-4 left-4 text-xs font-bold px-2 py-1 rounded-full ${MOOD_COLORS[track.moodType] || 'bg-gray-100 text-gray-700'}`}>
            {track.moodType}
          </span>
        </div>

        {/* Info + controls */}
        <div className="px-6 pb-6 pt-2 text-white">
          <div className="mb-4">
            <h3 className="text-lg font-bold leading-tight line-clamp-1">{track.title}</h3>
            <p className="text-sm text-white/60">{track.artist}</p>
            {!track.previewUrl && (
              <p className="text-xs text-yellow-400 mt-1">Preview not available — open on iTunes</p>
            )}
          </div>

          {/* Seek bar */}
          <div className="mb-1">
            <input
              type="range" min={0} max={duration || 30} step={0.1} value={progress}
              onChange={e => {
                const v = Number(e.target.value);
                setProgress(v);
                if (audioRef.current) audioRef.current.currentTime = v;
              }}
              className="w-full h-1 accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40 font-mono mt-1">
              <span>{fmt(progress)}</span>
              <span>{duration > 0 ? fmt(duration) : '0:30'}</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-6 my-4">
            <button
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipBack className="w-6 h-6" fill="currentColor" />
            </button>
            <button
              onClick={() => track.previewUrl ? setPlaying(p => !p) : window.open(`https://music.apple.com/search?term=${encodeURIComponent(track.deezerQuery)}`, '_blank')}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {playing
                ? <Pause className="w-6 h-6 text-purple-900" fill="currentColor" />
                : <Play className="w-6 h-6 text-purple-900 ml-1" fill="currentColor" />
              }
            </button>
            <button
              onClick={() => setIdx(i => Math.min(tracks.length - 1, i + 1))}
              disabled={idx === tracks.length - 1}
              className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipForward className="w-6 h-6" fill="currentColor" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full h-1 accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Track dots */}
          <div className="flex justify-center gap-2 mt-4">
            {tracks.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MusicTherapySection({ moodCategory, state, assessmentScore }: Props) {
  const { t, language } = useLanguage();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);

  const effectiveState = state || moodCategory;

  useEffect(() => {
    if (!effectiveState) return;
    setLoading(true);
    aiAPI.generateMusicRecommendations({ moodCategory: effectiveState, language, assessmentScore })
      .then(async (res) => {
        const raw: Track[] = res.data.tracks || [];
        const enriched = await Promise.all(raw.map(enrichWithItunes));
        setTracks(enriched);
      })
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, [effectiveState, language, assessmentScore]);

  const mt = (t as any)?.music;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
          <Music className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            {mt?.title || 'Music Therapy'} <Sparkles className="w-4 h-4 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground">{mt?.description || 'Recommended music to improve your mood'}</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-10 justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">{mt?.loading || 'Finding music for you...'}</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track, i) => (
            <motion.div
              key={`${track.deezerQuery}-${i}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-mobile rounded-2xl overflow-hidden border border-white/40 shadow-lg"
            >
              <div className="relative w-full aspect-video bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center overflow-hidden">
                {track.albumArt
                  ? <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                  : <Mic2 className="w-12 h-12 text-white/60" />
                }
                <div className="absolute inset-0 bg-black/20" />
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${MOOD_COLORS[track.moodType] || 'bg-gray-100 text-gray-700'}`}>
                  {mt?.[track.moodType] || track.moodType}
                </span>
                <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {track.language}
                </span>
                <button
                  onClick={() => setPlayerIndex(i)}
                  className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground text-sm leading-snug mb-1 line-clamp-1">{track.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{track.artist}</p>
                <button
                  onClick={() => setPlayerIndex(i)}
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

      <AnimatePresence>
        {playerIndex !== null && tracks.length > 0 && (
          <MusicPlayer
            tracks={tracks}
            initialIndex={playerIndex}
            onClose={() => setPlayerIndex(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
