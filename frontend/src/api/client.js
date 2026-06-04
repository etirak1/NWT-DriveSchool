import axios from 'axios';

// Sve ide kroz API gateway na portu 8080
const API_BASE = 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
});

// Automatski dodaj JWT token na svaki zahtjev ako postoji
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(new Error('Token istekao'));
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


        if (!error.response || status === 500 || status === 502 || status === 503) {
            console.error("Kritična greška servisa - Redirect na login...");
            localStorage.removeItem('token');
            window.location.href = '/login?reason=service_offline';
            return new Promise(() => {});
        }

        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login?reason=session_expired';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);