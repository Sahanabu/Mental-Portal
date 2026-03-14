import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add language to all requests
  const language = localStorage.getItem('language') || 'en';
  if (config.data && typeof config.data === 'object') {
    config.data.language = language;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () =>
    api.get('/auth/profile'),
};

// Assessment API
export const assessmentAPI = {
  generateQuestions: () =>
    api.post('/assessment/questions'),
  analyzeAnswers: (data: { answers: number[]; questions?: any[]; language?: string }) =>
    api.post('/assessment/analyze', data),
  submit: (data: { answers: number[]; totalScore: number }) =>
    api.post('/assessment/submit', data),
  getHistory: () =>
    api.get('/assessment/history'),
};

// Mood API
export const moodAPI = {
  log: (data: { mood: string; date: string }) =>
    api.post('/mood/log', data),
  getHistory: () =>
    api.get('/mood/history'),
};

// Chat API
export const chatAPI = {
  sendMessage: (message: string, sessionId?: string, language?: string) =>
    api.post('/chat', { message, sessionId, language }),
  getConversations: (limit?: number) =>
    api.get('/chat/conversations', { params: { limit } }),
  getConversation: (sessionId: string) =>
    api.get(`/chat/conversations/${sessionId}`),
  deleteConversation: (sessionId: string) =>
    api.delete(`/chat/conversations/${sessionId}`),
  deleteAllConversations: () =>
    api.delete('/chat/conversations'),
};

// Resources API
export const resourcesAPI = {
  get: () =>
    api.get('/resources'),
};

// AI API
export const aiAPI = {
  getBreathingTips: (data: { currentMood?: string; stressLevel?: string; language?: string }) =>
    api.post('/ai/breathing-tips', data),
  getAmbientGuidance: (data: { timeOfDay?: string; mood?: string; language?: string }) =>
    api.post('/ai/ambient-guidance', data),
  getResourceRecommendations: (data: { userConcerns?: string; assessmentScore?: number; language?: string }) =>
    api.post('/ai/resource-recommendations', data),
  getCheckinInsights: (data: { mood: string; recentMoods?: string[]; language?: string }) =>
    api.post('/ai/checkin-insights', data),
  getHistoryAnalysis: (data: { assessments?: any[]; moodLogs?: any[]; language?: string }) =>
    api.post('/ai/history-analysis', data),
  generateExercises: (data: { mood: string; language?: string }) =>
    api.post('/ai/generate-exercises', data),
  generateVideoRecommendations: (data: { category: string; score: number; language?: string }) =>
    api.post('/ai/video-recommendations', data),
  generateMusicRecommendations: (data: { moodCategory: string; language?: string; assessmentScore?: number }) =>
    api.post('/ai/music-recommendations', data),
  generateMovieSuggestions: (data: { mood: string; language?: string }) =>
    api.post('/ai/movie-suggestions', data),
};

// Adaptive AI Assessment API
export const adaptiveAssessmentAPI = {
  start: (data: { language?: string }) =>
    api.post('/ai-assessment/start', data),
  respond: (data: { sessionId: string; message?: string; language?: string; phase?: string; predefinedAnswers?: number[] }) =>
    api.post('/ai-assessment/respond', data),
  getSessions: () =>
    api.get('/ai-assessment/sessions'),
};

// Interactions API (encrypted payloads)
export const interactionsAPI = {
  save: (data: { type: string; encryptedPayload: string }) =>
    api.post('/interactions/save', data),
  getForUser: (userId: string, type?: string) =>
    api.get(`/interactions/user/${userId}`, { params: type ? { type } : {} }),
};

// Dashboard API
export const dashboardAPI = {
  get: (userId: string) =>
    api.get(`/dashboard/user/${userId}`),
};

// Games API
export const gameAPI = {
  generateChallenge: (data: { gameType: string; difficulty: string }) =>
    api.post('/games/challenge', data),
  generateSession: (data: { gameType: string; difficulty: string; count: number }) =>
    api.post('/games/session/generate', data),
  saveSession: (data: {
    gameType: string; difficulty: string;
    challenge?: string; options?: string[]; correctAnswer?: string; userAnswer?: string;
    questions?: { question: string; options: string[]; correctAnswer: string; userAnswer: string }[];
  }) => api.post('/games/session/save', data),
  getUserSessions: (userId: string) =>
    api.get(`/games/sessions/${userId}`),
  getLeaderboard: (params?: { gameType?: string; difficulty?: string; page?: number; pageSize?: number }) =>
    api.get('/games/leaderboard', { params }),
};

// Token management
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};