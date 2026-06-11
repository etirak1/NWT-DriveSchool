import { api } from '../api/client';


export const financeApi = {
   
    getAll: () =>
        api.get('/accounts'),

    
    getAllPaginated: (page = 0, size = 10) =>
        api.get(`/accounts/paginated?page=${page}&size=${size}&sort=enrollmentDate`),

   
    getById: (id) =>
        api.get(`/accounts/${id}`),

    
    getStatus: (candidateId) =>
        api.get(`/accounts/${candidateId}/status`),

    
    getStatuses: (candidateIds) =>
        api.get(`/accounts/statuses?candidateIds=${candidateIds.join(',')}`),

    
    ensureAccount: (candidateId) =>
        api.post(`/accounts/ensure/${candidateId}`),

    
    recordPayment: (candidateId, amount) =>
        api.post(`/accounts/${candidateId}/pay`, { amount }),
};