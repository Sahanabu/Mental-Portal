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
  analyzeAnswers: (data: { answers: number[]; questions?: any[] }) =>
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
  sendMessage: (message: string, sessionId?: string) =>
    api.post('/chat', { message, sessionId }),
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
  getBreathingTips: (data: { currentMood?: string; stressLevel?: string }) =>
    api.post('/ai/breathing-tips', data),
  getAmbientGuidance: (data: { timeOfDay?: string; mood?: string }) =>
    api.post('/ai/ambient-guidance', data),
  getResourceRecommendations: (data: { userConcerns?: string; assessmentScore?: number }) =>
    api.post('/ai/resource-recommendations', data),
  getCheckinInsights: (data: { mood: string; recentMoods?: string[] }) =>
    api.post('/ai/checkin-insights', data),
  getHistoryAnalysis: (data: { assessments?: any[]; moodLogs?: any[] }) =>
    api.post('/ai/history-analysis', data),
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