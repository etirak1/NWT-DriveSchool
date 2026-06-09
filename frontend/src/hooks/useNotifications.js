import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../api/client';

const POLL_INTERVAL_MS = 30_000;

export function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const intervalRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await api.get(`/api/notifications/instructor/${userId}`);
            setNotifications(
                (res.data || []).map(n => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    body: n.body,
                    read: n.read,
                    timestamp: n.timestamp,
                }))
            );
        } catch { /* ignore */ }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
        intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, [fetchNotifications]);

    const markAllRead = useCallback(() => {
        if (!userId) return;
        api.put(`/api/notifications/instructor/${userId}/read-all`).catch(() => {});
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, [userId]);

    const clearAll = useCallback(() => {
        if (!userId) return;
        api.delete(`/api/notifications/instructor/${userId}`).catch(() => {});
        setNotifications([]);
    }, [userId]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, markAllRead, clearAll };
}
