import { useState, useEffect } from 'react';
import { authAPI, tokenManager } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getToken();
      if (token) {
        setIsAuthenticated(true);
        // Load from localStorage or fetch profile
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');
        if (email && name) {
          setUser({ id: localStorage.getItem('userId') || '', name, email });
        } else {
          try {
            const response = await authAPI.getProfile();
            const { userId, name, email } = response.data;
            localStorage.setItem('userId', userId);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            setUser({ id: userId, name, email });
          } catch (error) {
            console.log('Profile load failed');
            tokenManager.removeToken();
            setIsAuthenticated(false);
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, userId, email: loginEmail, name } = response.data;
      
      tokenManager.setToken(token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', loginEmail);
      localStorage.setItem('userName', name);
      setUser({ id: userId, email: loginEmail, name });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { token, userId, email: regEmail, name: regName } = response.data;
      
      tokenManager.setToken(token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', regEmail);
      localStorage.setItem('userName', regName);
      setUser({ id: userId, email: regEmail, name: regName });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    tokenManager.removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
}