import { api } from '../api/client';

// ── USERS ────────────────────────────────────────────────────────────────────
export const userApi = {
    getActiveInstructors: () => api.get('/api/users/active?role=INSTRUCTOR'),
    getAll:               () => api.get('/api/users'),
    getById:          (id) => api.get(`/api/users/${id}`),
    create:          (data) => api.post('/api/users', data),
    updateUser: (userId, patchData) => api.patch(`/api/users/${userId}`, patchData, {
        headers: { 'Content-Type': 'application/json-patch+json' }
    }),
    delete: (id) => api.delete(`/api/users/${id}`),
};

// ── INSTRUCTORS ───────────────────────────────────────────────────────────────
export const instructorApi = {
    getAll:    ()           => api.get('/api/instructors'),
    getById:   (id)         => api.get(`/api/instructors/${id}`),
    create:    (data)       => api.post('/api/instructors', data),
    updateAvailability: (id, note)     => api.patch(`/api/instructors/${id}/availability`, { availabilityNote: note }),
    assignVehicle:      (id, vehicleId) => api.patch(`/api/instructors/${id}/assign-vehicle`, { vehicleId }),
};

// ── VEHICLES ──────────────────────────────────────────────────────────────────
export const vehicleApi = {
    getAll:    ()         => api.get('/vehicles'),
    getById:   (id)       => api.get(`/vehicles/${id}`),
    create:    (data)     => api.post('/vehicles', data),
    update:    (id, data) => api.put(`/vehicles/${id}`, data),
    delete:    (id)       => api.delete(`/vehicles/${id}`),
};

// ── REPAIRS ───────────────────────────────────────────────────────────────────
export const repairApi = {
    getAll:    ()         => api.get('/repairs'),
    getById:   (id)       => api.get(`/repairs/${id}`),
    create:    (data)     => api.post('/repairs', data),
    update:    (id, data) => api.put(`/repairs/${id}`, data),
    delete:    (id)       => api.delete(`/repairs/${id}`),
};

