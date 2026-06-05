import axios from 'axios';

// Sve ide kroz API gateway na portu 8080
const API_BASE = 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Automatski dodaj JWT token na svaki zahtjev ako postoji
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout ako backend vrati 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const userApi = {
    getActiveInstructors: () => api.get('/api/users/active?role=INSTRUCTOR'),
    updateUser: (userId, patchData) => api.patch(`/api/users/${userId}`, patchData, {
        headers: { 'Content-Type': 'application/json-patch+json' }
    })
};

export const instructorApi = {
    getAll: () => api.get('/api/instructors'),
    updateAvailability: (id, note) => api.patch(`/api/instructors/${id}/availability`, { availabilityNote: note }),
    assignVehicle: (id, vehicleId) => api.patch(`/api/instructors/${id}/assign-vehicle`, { vehicleId })
};