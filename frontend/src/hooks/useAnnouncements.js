import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useAnnouncements(userId, role) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);

    const { data: announcements = [], isLoading, isError } = useQuery({
        queryKey: ['announcements', userId, role],
        queryFn: () => api.get(`/api/announcements?${params.toString()}`).then(r => r.data),
    });

    return { announcements, isLoading, isError };
}
