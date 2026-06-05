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

// ── USERS (User Microservice) ────────────────────────────────────────────────
export const userApi = {
    // Ova funkcija je bila problem - SADA JE TU
    getActiveInstructors: () => api.get('/api/users/active?role=INSTRUCTOR'),
    getAll: () => api.get('/api/users'),
    getById: (id) => api.get(`/api/users/${id}`),
    create: (data) => api.post('/api/users', data),
    // JSON Patch verzija za update
    updateUser: (userId, patchData) => api.patch(`/api/users/${userId}`, patchData, {
        headers: { 'Content-Type': 'application/json-patch+json' }
    }),
    delete: (id) => api.delete(`/api/users/${id}`),
};

// ── INSTRUCTORS (Resource Microservice) ──────────────────────────────────────
export const instructorApi = {
    getAll: () => api.get('/api/instructors'),
    getById: (id) => api.get(`/api/instructors/${id}`),
    create: (data) => api.post('/api/instructors', data),
    updateAvailability: (id, note) => api.patch(`/api/instructors/${id}/availability`, { availabilityNote: note }),
    assignVehicle: (id, vehicleId) => api.patch(`/api/instructors/${id}/assign-vehicle`, { vehicleId })
};

// ── VEHICLES (Resource Microservice) ─────────────────────────────────────────
export const vehicleApi = {
    getAll: () => api.get('/vehicles'),
    getById: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
};

// ── REPAIRS (Resource Microservice) ──────────────────────────────────────────
export const repairApi = {
    getAll: () => api.get('/repairs'),
    getById: (id) => api.get(`/repairs/${id}`),
    create: (data) => api.post('/repairs', data),
    update: (id, data) => api.put(`/repairs/${id}`, data),
    delete: (id) => api.delete(`/repairs/${id}`),
};