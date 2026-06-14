import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

const POLL_INTERVAL_MS = 30_000;

export function useNotifications(userId) {
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', userId],
        queryFn: () =>
            api.get(`/api/notifications/instructor/${userId}`)
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
        api.put(`/api/notifications/instructor/${userId}/read-all`).catch(() => {});
        queryClient.setQueryData(['notifications', userId], (prev = []) =>
            prev.map(n => ({ ...n, read: true }))
        );
    }, [userId, queryClient]);

    const clearAll = useCallback(() => {
        if (!userId) return;
        api.delete(`/api/notifications/instructor/${userId}`).catch(() => {});
        queryClient.setQueryData(['notifications', userId], []);
    }, [userId, queryClient]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, markAllRead, clearAll };
}
