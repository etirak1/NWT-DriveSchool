
const BASE_URL = '';

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
    // Svi računi (paginiran)
    getAllPaginated: (page = 0, size = 10) =>
        request('GET', `/accounts/paginated?page=${page}&size=${size}&sort=enrollmentDate`),

    // Svi računi (lista)
    getAll: () => request('GET', '/accounts'),

    // Jedan račun po ID-u
    getById: (id) => request('GET', `/accounts/${id}`),

    // Preostali dug kandidata
    getRemainingDebt: (id) => request('GET', `/accounts/${id}/debt`),

    // Patch računa
    patchAccount: (id, patchData) =>
        fetch(`${BASE_URL}/accounts/${id}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify(patchData),
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        }),
};


export const paymentApi = {
    // Uplate po kandidatu
    getByCandidateId: (candidateId) =>
        request('GET', `/payments/candidate/${candidateId}`),

    // Kreiraj uplatu
    create: (data) => request('POST', '/payments', data),
};