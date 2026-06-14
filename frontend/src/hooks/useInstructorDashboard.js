import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNotifications } from './useNotifications';
import { getErrorMessage } from '../utils/helpers';
import { TOTAL_DRIVING_LESSONS } from '../constants';

export function useInstructorDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const userId = user.userId;
    const email  = user.email;
    const role   = user.role;

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState({});
    const [scheduledLessons, setScheduledLessons] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [completingLesson, setCompletingLesson] = useState(null);
    const [proposing, setProposing] = useState(null);
    const [notifOpen, setNotifOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const { notifications, unreadCount, markAllRead, clearAll } = useNotifications(userId);

    const showSuccess = (msg) => { setSuccessMsg(msg); setErrorMsg(''); setTimeout(() => setSuccessMsg(''), 3000); };
    const showError   = (msg) => { setErrorMsg(msg); setSuccessMsg(''); setTimeout(() => setErrorMsg(''), 3000); };

    useEffect(() => {
        const loadAll = async () => {
            try {
                const res = await api.get('/api/candidates');
                const myCandidates = res.data.filter(
                    (c) => String(c.assignedInstructor?.user?.userId) === String(userId)
                );
                setCandidates(myCandidates);
                if (myCandidates.length > 0) setSelectedCandidateId(myCandidates[0].candidateId);

                const lessonMap = {};
                await Promise.all(myCandidates.map(async (c) => {
                    try {
                        const lr = await api.get(`/api/driving-lessons/candidate/${c.candidateId}`);
                        lessonMap[c.candidateId] = lr.data;
                    } catch { lessonMap[c.candidateId] = []; }
                }));
                setLessons(lessonMap);
            } catch (e) { showError(getErrorMessage(e)); }
            finally { setLoading(false); }
        };
        loadAll();
    }, []);

    useEffect(() => {
        const loadScheduled = async () => {
            try {
                const res = await api.get('/api/lessons/instructor-lessons?size=200&sortBy=dateTime&sortDir=asc');
                setScheduledLessons(res.data.content || []);
            } catch { setScheduledLessons([]); }
        };
        loadScheduled();
    }, []);

    const refreshScheduled = async () => {
        try {
            const res = await api.get('/api/lessons/instructor-lessons?size=200&sortBy=dateTime&sortDir=asc');
            setScheduledLessons(res.data.content || []);
        } catch { setScheduledLessons([]); }
    };

    const loadLessons = async (candidateId, force = false) => {
        if (!force && lessons[candidateId]) return;
        try {
            const res = await api.get(`/api/driving-lessons/candidate/${candidateId}`);
            setLessons(prev => ({ ...prev, [candidateId]: res.data }));
        } catch { setLessons(prev => ({ ...prev, [candidateId]: [] })); }
    };

    const addLesson = async (candidateId, lessonNumber, date, notes) => {
        try {
            await api.post(`/api/driving-lessons/candidate/${candidateId}`, { lessonNumber, date, notes });
            await loadLessons(candidateId, true);
            showSuccess('Čas uspješno dodan!');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Greška pri dodavanju časa.';
            showError(String(msg));
        }
    };

    const deleteLesson = async (candidateId, lessonNumber) => {
        try {
            await api.delete(`/api/driving-lessons/candidate/${candidateId}/lesson/${lessonNumber}`);
            await loadLessons(candidateId, true);
            showSuccess('Čas obrisan.');
        } catch { showError('Greška pri brisanju časa.'); }
    };

    const completeLesson = async () => {
        if (!completingLesson) return;
        const { lessonId, candidateId, topic, notes } = completingLesson;
        try {
            const params = new URLSearchParams();
            if (topic) params.append('topicCovered', topic);
            if (notes) params.append('teacherNotes', notes);
            await api.post(`/api/lessons/${lessonId}/complete?${params.toString()}`);
            await refreshScheduled();
            if (candidateId) await loadLessons(candidateId, true);
            setCompletingLesson(null);
            showSuccess('Čas označen kao odrađen!');
        } catch (err) {
            showError(err.response?.data?.message || 'Greška pri označavanju časa.');
        }
    };

    const submitProposal = async () => {
        if (!proposing) return;
        const { candidateId, date, time, notes } = proposing;
        if (!date || !time) { showError('Unesite datum i vrijeme.'); return; }
        try {
            await api.post('/api/lessons/propose', {
                candidateId,
                dateTime: `${date}T${time}:00`,
                duration: 45,
                notes: notes || null,
            });
            setProposing(null);
            showSuccess('Prijedlog termina poslan kandidatu!');
            await refreshScheduled();
        } catch (err) {
            showError(err.response?.data?.message || 'Greška pri slanju prijedloga.');
        }
    };

    const lessonsByDate = useMemo(() => {
        return scheduledLessons.reduce((acc, l) => {
            const date = l.dateTime?.split('T')[0];
            if (!date) return acc;
            if (!acc[date]) acc[date] = [];
            acc[date].push(l);
            return acc;
        }, {});
    }, [scheduledLessons]);

    const year  = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const firstWeekDay = new Date(year, month, 1).getDay();
    const todayStr = new Date().toISOString().split('T')[0];

    const calendarCells = useMemo(() => {
        const cells = [];
        for (let i = 0; i < firstWeekDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        return cells;
    }, [year, month, firstWeekDay, daysInMonth]);

    const selectedCandidate = candidates.find(c => c.candidateId === selectedCandidateId);
    const selectedDayStr = selectedDay
        ? `${year}-${String(month + 1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
        : null;
    const dayLessons = selectedDayStr ? (lessonsByDate[selectedDayStr] || []) : [];

    return {
        // Auth
        userId, email, role, logout, navigate,
        // Data
        candidates, loading, lessons, scheduledLessons,
        // UI state
        successMsg, errorMsg,
        completingLesson, setCompletingLesson,
        proposing, setProposing,
        notifOpen, setNotifOpen,
        activeTab, setActiveTab,
        selectedCandidateId, setSelectedCandidateId,
        calendarDate, setCalendarDate,
        selectedDay, setSelectedDay,
        // Notifications
        notifications, unreadCount, markAllRead, clearAll,
        // Actions
        addLesson, deleteLesson, completeLesson, submitProposal,
        // Calendar computed
        lessonsByDate, year, month, daysInMonth, firstWeekDay,
        todayStr, calendarCells,
        selectedCandidate, selectedDayStr, dayLessons,
    };
}
