import axios from 'axios';

const API_BASE = 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        window.location.href = '/login?reason=session_expired';
        return Promise.reject(new Error('Token istekao'));
      }
    } catch (e) {
     
      localStorage.removeItem('token');
      window.location.href = '/login?reason=session_expired';
      return Promise.reject(new Error('Token neispravan'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = error.config?.url?.includes('/api/auth/');

    
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    
    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?reason=session_expired';
      return new Promise(() => {});
    }

   
    return Promise.reject(error);
  }
);