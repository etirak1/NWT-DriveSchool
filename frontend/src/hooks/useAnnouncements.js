import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useAnnouncements(userId, role) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);

    const { data: raw = [], isLoading, isError } = useQuery({
        queryKey: ['announcements', userId, role],
        queryFn: () => api.get(`/api/announcements?${params.toString()}`).then(r => r.data),
    });

    // Client-side filter — defence layer in case backend leaks data:
    // - adminOnly = true  → never show to non-admins
    // - targetUserId set  → only that user sees it
    // - targetRole set    → only that role sees it
    // - neither set       → general announcement, visible to all
    const announcements = role === 'ADMIN' ? raw : raw.filter(a => {
        if (a.adminOnly)    return false;
        if (a.targetUserId) return String(a.targetUserId) === String(userId);
        if (a.targetRole)   return a.targetRole === role;
        return true;
    });

    return { announcements, isLoading, isError };
}
