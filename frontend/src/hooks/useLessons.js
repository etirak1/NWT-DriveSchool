import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useLessons() {
    const [page, setPage] = useState(0);
    const queryClient = useQueryClient();

    const { data: pageData = { content: [], totalPages: 0, number: 0 } } = useQuery({
        queryKey: ['myLessons', page],
        queryFn: () =>
            api.get(`/api/lessons/my-lessons?page=${page}&size=5&sortBy=dateTime&sortDir=desc`)
               .then(r => r.data),
    });

    const { data: pendingLessons = [] } = useQuery({
        queryKey: ['pendingLessons'],
        queryFn: () => api.get('/api/lessons/pending').then(r => r.data || []),
    });

    const { mutate } = useMutation({
        mutationFn: ({ lessonId, action }) => api.patch(`/api/lessons/${lessonId}/${action}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingLessons'] });
            queryClient.invalidateQueries({ queryKey: ['myLessons'] });
        },
    });

    const respondToLesson = (lessonId, action) => mutate({ lessonId, action });

    const fetchLessons = (p = 0) => setPage(p);

    return { pageData, pendingLessons, fetchLessons, respondToLesson };
}
