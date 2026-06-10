import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        api.get('/api/announcements')
            .then(res => setAnnouncements(res.data))
            .catch(() => { /* optional */ });
    }, []);

    return { announcements };
}
