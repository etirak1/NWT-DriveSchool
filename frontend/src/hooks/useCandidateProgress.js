import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useCandidateProgress(userId) {
    const queryClient = useQueryClient();

    const { data: candidate = null, isLoading } = useQuery({
        queryKey: ['candidate', userId],
        queryFn: () => api.get(`/api/candidates/by-user/${userId}`).then(r => r.data),
        enabled: !!userId,
    });

    const candidateId = candidate?.candidateId;

    const { data: theoryCompleted = 0 } = useQuery({
        queryKey: ['theoryLessons', candidateId],
        queryFn: () =>
            api.get(`/api/theory-lessons/candidate/${candidateId}`)
               .then(r => (r.data || []).filter(l => l.completed).length),
        enabled: !!candidateId,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });

    const { data: drivingCompleted = 0 } = useQuery({
        queryKey: ['drivingCount', candidateId],
        queryFn: () =>
            api.get(`/api/driving-lessons/candidate/${candidateId}/count`)
               .then(r => r.data?.completed || 0),
        enabled: !!candidateId,
        staleTime: 0,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: phases = [] } = useQuery({
        queryKey: ['phases', candidateId],
        queryFn: () => api.get(`/api/phases/candidate/${candidateId}`).then(r => r.data),
        enabled: !!candidateId,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });

    const { data: timeline = [] } = useQuery({
        queryKey: ['timeline', candidateId],
        queryFn: () => api.get(`/api/phases/candidate/${candidateId}/timeline`).then(r => r.data),
        enabled: !!candidateId,
        staleTime: 0,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: alreadyRated = false } = useQuery({
        queryKey: ['alreadyRated', candidateId],
        queryFn: () =>
            api.get(`/api/feedbacks/candidate/${candidateId}/exists`).then(r => r.data),
        enabled: !!candidateId,
    });

    const { data: theoryEligibility = null } = useQuery({
        queryKey: ['theoryEligibility', candidateId],
        queryFn: () =>
            api.get(`/api/theory-plans/candidate/${candidateId}/theory-eligibility`)
               .then(r => r.data),
        enabled: !!candidateId,
    });

    const setAlreadyRated = (val) =>
        queryClient.setQueryData(['alreadyRated', candidateId], val);

    return {
        candidate,
        phases,
        timeline,
        theoryEligibility,
        alreadyRated,
        setAlreadyRated,
        theoryCompleted,
        drivingCompleted,
        loading: isLoading,
    };
}
