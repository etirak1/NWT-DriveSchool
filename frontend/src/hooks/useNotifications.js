import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api } from '../api/client';

const WS_URL = 'http://localhost:8083/ws'; 
if (import.meta.env.DEV) {
    console.warn('[useNotifications] WebSocket ide direktno na :8083, ne kroz gateway. Promijeni za produkciju.');
}

export function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);

  
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
       
        api.put(`/api/notifications/instructor/${userId}/read-all`).catch(() => {});
        
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
