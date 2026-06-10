import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useCandidateProgress(userId) {
    const [candidate,         setCandidate]         = useState(null);
    const [phases,            setPhases]            = useState([]);
    const [timeline,          setTimeline]          = useState([]);
    const [theoryEligibility, setTheoryEligibility] = useState(null);
    const [alreadyRated,      setAlreadyRated]      = useState(false);
    const [theoryCompleted,   setTheoryCompleted]   = useState(0);
    const [drivingCompleted,  setDrivingCompleted]  = useState(0);
    const [loading,           setLoading]           = useState(true);

    const loadProgress = async (candId) => {
        try {
            const res = await api.get(`/api/theory-lessons/candidate/${candId}`);
            setTheoryCompleted((res.data || []).filter(l => l.completed).length);
        } catch { /* ignore */ }

        try {
            const res = await api.get(`/api/phases/candidate/${candId}`);
            setPhases(res.data);
        } catch { /* ignore */ }

        try {
            const res = await api.get(`/api/phases/candidate/${candId}/timeline`);
            setTimeline(res.data);
        } catch { /* ignore */ }

        try {
            const res = await api.get(`/api/feedbacks/candidate/${candId}/exists`);
            setAlreadyRated(res.data);
        } catch { /* ignore */ }

        try {
            const res = await api.get(`/api/theory-plans/candidate/${candId}/theory-eligibility`);
            setTheoryEligibility(res.data);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        let candIdRef = null;

        const load = async () => {
            try {
                const res = await api.get(`/api/candidates/by-user/${userId}`);
                const cand = res.data;
                setCandidate(cand);
                candIdRef = cand.candidateId;

                try {
                    const drivingRes = await api.get(`/api/driving-lessons/candidate/${cand.candidateId}/count`);
                    setDrivingCompleted(drivingRes.data.completed || 0);
                } catch { /* ignore */ }

                await loadProgress(cand.candidateId);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && candIdRef) loadProgress(candIdRef);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        const interval = setInterval(() => { if (candIdRef) loadProgress(candIdRef); }, 30000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, []);

    return {
        candidate, phases, timeline, theoryEligibility,
        alreadyRated, setAlreadyRated,
        theoryCompleted, drivingCompleted,
        loading,
    };
}
