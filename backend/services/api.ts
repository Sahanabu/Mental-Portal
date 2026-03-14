import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mental-portal.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure interceptor to pass the JWT token from localStorage 
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Added error interceptor for common status codes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You could handle 401 unauth redirect globally here if needed
    return Promise.reject(error);
  }
);
