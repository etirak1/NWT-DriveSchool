
const BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const request = async (method, path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: getAuthHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    if (res.status === 204) return null;
    return res.json();
};

export const financeApi = {
    // Svi računi sa obavezama
    getAll: () => request('GET', '/accounts'),

    // Paginiran
    getAllPaginated: (page = 0, size = 10) =>
        request('GET', `/accounts/paginated?page=${page}&size=${size}&sort=enrollmentDate`),

    // Jedan račun po ID-u
    getById: (id) => request('GET', `/accounts/${id}`),

    // Puni status: obaveze + eligibility
    getStatus: (candidateId) => request('GET', `/accounts/${candidateId}/status`),

    // Kreiraj račun ako ne postoji
    ensureAccount: (candidateId) => request('POST', `/accounts/ensure/${candidateId}`),

    // Evidentiraj uplatu — backend raspoređuje automatski
    recordPayment: (candidateId, amount) =>
        request('POST', `/accounts/${candidateId}/pay`, { amount }),
};

export const paymentApi = {
    getByCandidateId: (candidateId) =>
        request('GET', `/payments/candidate/${candidateId}`),
    create: (data) => request('POST', '/payments', data),
};
