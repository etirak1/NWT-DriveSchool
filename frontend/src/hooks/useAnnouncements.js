import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useAnnouncements() {
    const { data: announcements = [], isLoading, isError } = useQuery({
        queryKey: ['announcements'],
        queryFn: () => api.get('/api/announcements').then(r => r.data),
    });

    return { announcements, isLoading, isError };
}
