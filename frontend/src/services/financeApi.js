import { api } from '../api/client';


export const financeApi = {
    // Svi računi
    getAll: () =>
        api.get('/accounts'),

    // Paginirani računi
    getAllPaginated: (page = 0, size = 10) =>
        api.get(`/accounts/paginated?page=${page}&size=${size}&sort=enrollmentDate`),

    // Račun po ID-u
    getById: (id) =>
        api.get(`/accounts/${id}`),

    // Status računa (obaveze + eligibility)
    getStatus: (candidateId) =>
        api.get(`/accounts/${candidateId}/status`),

    // Bulk statusi za više kandidata
    getStatuses: (candidateIds) =>
        api.get(`/accounts/statuses?candidateIds=${candidateIds.join(',')}`),

    // Kreiraj račun ako ne postoji
    ensureAccount: (candidateId) =>
        api.post(`/accounts/ensure/${candidateId}`),

    // Uplata
    recordPayment: (candidateId, amount) =>
        api.post(`/accounts/${candidateId}/pay`, { amount }),
};