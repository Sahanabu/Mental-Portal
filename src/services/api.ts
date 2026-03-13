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
};

// Assessment API
export const assessmentAPI = {
  submit: (data: { answers: Record<number, number>; totalScore: number }) =>
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
  sendMessage: (message: string) =>
    api.post('/chat', { message }),
};

// Resources API
export const resourcesAPI = {
  get: () =>
    api.get('/resources'),
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
  },
};