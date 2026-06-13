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
            // Samo prikaži "sesija istekla" ako je zahtjev imao token koji je server odbio.
            // Ako nije bio token (korisnik se odjavio), tiho idi na /login bez poruke.
            const hadToken = !!error.config?.headers?.Authorization;
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:logout'));
            window.location.href = hadToken ? '/login?reason=session_expired' : '/login';
            return new Promise(() => {});
        }

        if (!error.response || error.code === 'ECONNABORTED') {
            localStorage.removeItem('token');
            window.location.href = '/login?reason=service_offline';
            return new Promise(() => {});
        }

        if (status === 403) {
            window.location.href = '/forbidden';
            return new Promise(() => {});
        }

        return Promise.reject(error);
    }
);

export const userApi = {
    getActiveInstructors: () => api.get('/api/users/active?role=INSTRUCTOR'),
    updateUser: (userId, patchData) => api.patch(`/api/users/${userId}`, patchData, {
        headers: { 'Content-Type': 'application/json-patch+json' },
    }),
};

export const instructorApi = {
    getAll:               ()         => api.get('/api/instructors'),
    updateAvailability:   (id, note) => api.patch(`/api/instructors/${id}/availability`, { availabilityNote: note }),
    assignVehicle:        (id, vid)  => api.patch(`/api/instructors/${id}/assign-vehicle`, { vehicleId: vid }),
};