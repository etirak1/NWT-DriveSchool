const BASE_URL = import.meta.env.VITE_API_URL;

// ── JWT helper ────────────────────────────────────────────────────────────────
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ── Generički HTTP helper ─────────────────────────────────────────────────────
const request = async (method, path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: getAuthHeaders(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    if (res.status === 204) return null;
    return res.json();
};

// ── Vehicles (/vehicles) ──────────────────────────────────────────────────────
export const vehicleApi = {
    getAll:   ()          => request('GET',    '/vehicles'),
    getById:  (id)        => request('GET',    `/vehicles/${id}`),
    create:   (data)      => request('POST',   '/vehicles', data),
    update:   (id, data)  => request('PUT',    `/vehicles/${id}`, data),
    delete:   (id)        => request('DELETE', `/vehicles/${id}`),
};

// ── Repairs (/repairs) ────────────────────────────────────────────────────────
export const repairApi = {
    getAll:      ()              => request('GET',   '/repairs'),
    getById:     (id)            => request('GET',   `/repairs/${id}`),
    create:      (data)          => request('POST',  '/repairs', data),
    update:      (id, data)      => request('PUT',   `/repairs/${id}`, data),
    patch:       (id, data)      => request('PATCH', `/repairs/${id}`, data),
    delete:      (id)            => request('DELETE',`/repairs/${id}`),
    getExpensive:(cost)          => request('GET',   `/repairs/expensive?cost=${cost}`),
    getPage:     (page=0,size=10)=> request('GET',   `/repairs/page?page=${page}&size=${size}`),
};

// ── Instructors (/api/instructors) ────────────────────────────────────────────
export const instructorApi = {
    getAll:             ()          => request('GET',   '/api/instructors'),
    getById:            (id)        => request('GET',   `/api/instructors/${id}`),
    create:             (data)      => request('POST',  '/api/instructors', data),
    updateAvailability: (id, note)  => request('PATCH', `/api/instructors/${id}/availability`, { availabilityNote: note }),
};

// ── Users (/users) ────────────────────────────────────────────────────────────
export const userApi = {
    getAll:  ()         => request('GET',    '/users'),
    getById: (id)       => request('GET',    `/users/${id}`),
    create:  (data)     => request('POST',   '/users', data),
    update:  (id, data) => request('PUT',    `/users/${id}`, data),
    delete:  (id)       => request('DELETE', `/users/${id}`),
};

// ── Finance – uplate (/api/payments) ─────────────────────────────────────────
export const financeApi = {
    // Sve uplate
    getAll: () => request('GET', '/api/payments'),

    // Uplate za konkretnog kandidata
    getByCandidate: (candidateId) =>
        request('GET', `/api/payments/candidate/${candidateId}`),

    // Kreiranje nove rate
    // Oblik koji PaymentController (@Valid) očekuje:
    // { amount, status, dueDate, datePaid, candidateAccount: { id } }
    create: (data) => request('POST', '/api/payments', data),
};

// ── Finance – kandidatski računi (/accounts) ──────────────────────────────────
export const accountApi = {
    // Lista svih računa
    getAll: () => request('GET', '/accounts'),

    // Paginirana lista
    getPaginated: (page = 0, size = 10) =>
        request('GET', `/accounts/paginated?page=${page}&size=${size}`),

    // Detalji jednog računa
    getById: (id) => request('GET', `/accounts/${id}`),

    // Preostali dug – direktno sa servera (server vrši obračun)
    getDebt: (id) => request('GET', `/accounts/${id}/debt`),

    // PATCH (JSON Patch)
    patch: (id, patchOps) =>
        fetch(`${BASE_URL}/accounts/${id}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify(patchOps),
        }).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),
};