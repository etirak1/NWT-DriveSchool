import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useFinance(candidateId) {
    const { data: financeStatus = null } = useQuery({
        queryKey: ['financeStatus', candidateId],
        queryFn: () => api.get(`/accounts/${candidateId}/status`).then(r => r.data),
        enabled: !!candidateId,
        retry: false,
        throwOnError: false,
    });

    const { data: payments = [] } = useQuery({
        queryKey: ['payments', candidateId],
        queryFn: () => api.get(`/accounts/${candidateId}/payments`).then(r => r.data || []),
        enabled: !!candidateId,
        retry: false,
        throwOnError: false,
    });

    return { financeStatus, payments };
}
