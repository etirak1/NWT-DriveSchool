import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useLessons() {
    const [pageData,       setPageData]       = useState({ content: [], totalPages: 0, number: 0 });
    const [pendingLessons, setPendingLessons] = useState([]);

    const fetchLessons = async (page = 0) => {
        try {
            const res = await api.get(
                `/api/lessons/my-lessons?page=${page}&size=5&sortBy=dateTime&sortDir=desc`
            );
            setPageData(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchPending = async () => {
        try {
            const res = await api.get(`/api/lessons/pending`);
            setPendingLessons(res.data || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        fetchLessons(0);
        fetchPending();
    }, []);

    const respondToLesson = async (lessonId, action) => {
        try {
            await api.patch(`/api/lessons/${lessonId}/${action}`);
            await fetchPending();
            await fetchLessons(0);
        } catch (e) { console.error(e); }
    };

    return { pageData, pendingLessons, fetchLessons, respondToLesson };
}
