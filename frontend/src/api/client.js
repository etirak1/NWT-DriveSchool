import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(new Error('Token istekao'));
            }
        } catch (e) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:logout'));
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
            window.dispatchEvent(new Event('auth:logout'));
            window.location.href = '/login?reason=session_expired';
            return new Promise(() => {});
        }

        if (!error.response || error.code === 'ECONNABORTED') {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:logout'));
            window.location.href = '/login?reason=service_offline';
            return new Promise(() => {});
        }

        if (status === 403) {
            window.location.href = '/forbidden';
            return new Promise(() => {});
        }

        if (status >= 500) {
            window.dispatchEvent(new CustomEvent('api:server-error', {
                detail: { status, message: 'Serverska greška, pokušajte ponovo.' }
            }));
        }

        return Promise.reject(error);
    }
);

export const userApi = {
    getActiveInstructors: () => api.get('/api/users/active?role=INSTRUCTOR'),
    getAll:               () => api.get('/api/users'),
    getById:              (id) => api.get(`/api/users/${id}`),
    create:               (data) => api.post('/api/users', data),
    updateUser: (userId, patchData) => api.patch(`/api/users/${userId}`, patchData, {
        headers: { 'Content-Type': 'application/json-patch+json' }
    }),
    delete: (id) => api.delete(`/api/users/${id}`),
};

export const instructorApi = {
    getAll:             ()              => api.get('/api/instructors'),
    getById:            (id)            => api.get(`/api/instructors/${id}`),
    create:             (data)          => api.post('/api/instructors', data),
    updateAvailability: (id, note)      => api.patch(`/api/instructors/${id}/availability`, { availabilityNote: note }),
    assignVehicle:      (id, vehicleId) => api.patch(`/api/instructors/${id}/assign-vehicle`, { vehicleId }),
};

export const vehicleApi = {
    getAll:    ()         => api.get('/vehicles'),
    getById:   (id)       => api.get(`/vehicles/${id}`),
    create:    (data)     => api.post('/vehicles', data),
    update:    (id, data) => api.put(`/vehicles/${id}`, data),
    delete:    (id)       => api.delete(`/vehicles/${id}`),
};

export const repairApi = {
    getAll:    ()         => api.get('/repairs'),
    getById:   (id)       => api.get(`/repairs/${id}`),
    create:    (data)     => api.post('/repairs', data),
    update:    (id, data) => api.put(`/repairs/${id}`, data),
    delete:    (id)       => api.delete(`/repairs/${id}`),
};