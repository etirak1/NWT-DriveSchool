import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api } from '../api/client';

// Direktno na training-service — gateway ima probleme sa SockJS HTTP polling transportom
const WS_URL = 'http://localhost:8083/ws';

export function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);

    // Učitaj postojeće notifikacije iz baze pri mountu
    useEffect(() => {
        if (!userId) return;
        api.get(`/api/notifications/instructor/${userId}`)
            .then(res => {
                const loaded = (res.data || []).map(n => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    body: n.body,
                    read: n.read,
                    timestamp: n.timestamp,
                }));
                setNotifications(loaded);
            })
            .catch(() => {});
    }, [userId]);

    // WebSocket za real-time — dodaje nove notifikacije bez zamjene postojećih
    useEffect(() => {
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/instructor.${userId}`, (message) => {
                    try {
                        const n = JSON.parse(message.body);
                        setNotifications(prev => {
                            // Izbjegni duplikat ako je notifikacija već učitana iz baze
                            const notifId = n.data?.notificationId;
                            if (notifId && prev.some(p => p.id === notifId)) return prev;
                            return [
                                { ...n, id: notifId || Date.now(), read: false },
                                ...prev,
                            ];
                        });
                    } catch (e) {
                        console.error('Failed to parse notification', e);
                    }
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: (frame) => {
                console.error('STOMP error', frame);
                setConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => { client.deactivate(); };
    }, [userId]);

    const markAllRead = useCallback(() => {
        if (!userId) return;
        // Označi u bazi
        api.put(`/api/notifications/instructor/${userId}/read-all`).catch(() => {});
        // Lokalno
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, [userId]);

    const clearAll = useCallback(() => {
        if (!userId) return;
        api.delete(`/api/notifications/instructor/${userId}`).catch(() => {});
        setNotifications([]);
    }, [userId]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, connected, markAllRead, clearAll };
}
