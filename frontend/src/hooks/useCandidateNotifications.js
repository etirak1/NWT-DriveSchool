import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

const POLL_INTERVAL_MS = 15_000;

export function useCandidateNotifications(userId) {
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ['candidateNotifications', userId],
        queryFn: () =>
            api.get(`/api/notifications/candidate/${userId}`)
               .then(r => (r.data || []).map(n => ({
                   id: n.id,
                   type: n.type,
                   title: n.title,
                   body: n.body,
                   read: n.read,
                   timestamp: n.timestamp,
               }))),
        enabled: !!userId,
        refetchInterval: POLL_INTERVAL_MS,
        refetchOnWindowFocus: true,
    });

    const markAllRead = useCallback(() => {
        if (!userId) return;
        api.put(`/api/notifications/candidate/${userId}/read-all`).catch(() => {});
        queryClient.setQueryData(['candidateNotifications', userId], (prev = []) =>
            prev.map(n => ({ ...n, read: true }))
        );
    }, [userId, queryClient]);

    const clearAll = useCallback(() => {
        if (!userId) return;
        api.delete(`/api/notifications/candidate/${userId}`).catch(() => {});
        queryClient.setQueryData(['candidateNotifications', userId], []);
    }, [userId, queryClient]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, markAllRead, clearAll };
}
