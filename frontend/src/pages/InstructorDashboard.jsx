import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
    GraduationCap, LogOut, Car, Plus, Trash2, Calendar,
    CheckCircle, Send, Bell, X, ChevronLeft, ChevronRight,
    User, Clock, BookOpen, TrendingUp
} from 'lucide-react';
import { getCurrentEmail, getCurrentRole, getCurrentUserId } from '../auth/jwt';
import { useNotifications } from '../hooks/useNotifications';

const DAYS = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
const MONTHS = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const email = getCurrentEmail();
    const role = getCurrentRole();
    const userId = getCurrentUserId();

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState({});
    const [scheduledLessons, setScheduledLessons] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [completingLesson, setCompletingLesson] = useState(null);
    const [proposing, setProposing] = useState(null);
    const [notifOpen, setNotifOpen] = useState(false);

    // UI state
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const { notifications, unreadCount, connected, markAllRead, clearAll } = useNotifications(userId);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const res = await api.get('/api/candidates');
                const myCandidates = res.data.filter(
                    c => String(c.assignedInstructor?.user?.userId) === String(userId)
                );
                setCandidates(myCandidates);
                if (myCandidates.length > 0) setSelectedCandidateId(myCandidates[0].candidateId);

                const lessonMap = {};
                await Promise.all(myCandidates.map(async c => {
                    try {
                        const lr = await api.get(`/api/driving-lessons/candidate/${c.candidateId}`);
                        lessonMap[c.candidateId] = lr.data;
                    } catch { lessonMap[c.candidateId] = []; }
                }));
                setLessons(lessonMap);
            } catch { showError('Greška pri učitavanju kandidata.'); }
            finally { setLoading(false); }
        };
        loadAll();
    }, []);

    useEffect(() => {
        const loadScheduled = async () => {
            try {
                const res = await api.get(
                    `/api/lessons/instructor-lessons?userId=${userId}&size=200&sortBy=dateTime&sortDir=asc`
                );
                setScheduledLessons(res.data.content || []);
            } catch (e) {
                console.error('Greška pri učitavanju zakazanih časova:', e?.response?.status, e?.message);
                setScheduledLessons([]);
            }
        };
        loadScheduled();
    }, []);

    const refreshScheduled = async () => {
        try {
            const res = await api.get(
                `/api/lessons/instructor-lessons?userId=${userId}&size=200&sortBy=dateTime&sortDir=asc`
            );
            setScheduledLessons(res.data.content || []);
        } catch (e) {
            console.error('Greška pri refreshu zakazanih časova:', e?.response?.status, e?.message);
            setScheduledLessons([]);
        }
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

    const showSuccess = (msg) => { setSuccessMsg(msg); setErrorMsg(''); setTimeout(() => setSuccessMsg(''), 3000); };
    const showError   = (msg) => { setErrorMsg(msg); setSuccessMsg(''); setTimeout(() => setErrorMsg(''), 3000); };

    // ─── Calendar helpers ──────────────────────────────────────────────────────
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
    const firstWeekDay = new Date(year, month, 1).getDay(); // 0=Sun
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

    if (loading) return <div className="p-10 text-center text-slate-500">Učitavanje...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
                            <Car className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">DriveSchool</h1>
                            <p className="text-xs text-slate-500">Instruktor panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{email}</p>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">{role}</span>
                        </div>
                        {/* Bell */}
                        <div className="relative">
                            <button
                                onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markAllRead(); }}
                                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                        <span className="font-semibold text-sm text-slate-800">Notifikacije</span>
                                        <div className="flex items-center gap-2">
                                            {notifications.length > 0 && (
                                                <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600">Obriši sve</button>
                                            )}
                                            <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 text-xs flex items-center gap-1.5 border-b ${connected ? 'text-green-600 bg-green-50 border-green-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-amber-400'}`} />
                                        {connected ? 'Povezan — notifikacije uživo' : 'Nije povezan...'}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {notifications.length === 0
                                            ? <p className="text-sm text-slate-400 text-center py-6">Nema novih notifikacija</p>
                                            : notifications.map(n => (
                                                <div key={n.id} className={`px-4 py-3 border-b border-slate-50 ${!n.read ? 'bg-indigo-50' : ''}`}>
                                                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                                                    <p className="text-xs text-slate-600 mt-0.5">{n.body}</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(n.timestamp).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <LogOut size={16} /> Odjava
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-6xl mx-auto px-4">
                    <nav className="flex gap-1 border-t border-slate-100">
                        {[
                            { id: 'calendar',   label: 'Kalendar',   icon: Calendar },
                            { id: 'candidates', label: 'Kandidati',  icon: User },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Icon size={15} /> {label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* ── Toasts ──────────────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 pt-4">
                {successMsg && <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-100 text-sm">{successMsg}</div>}
                {errorMsg   && <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 text-sm">{errorMsg}</div>}
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-10">

                {/* ══ KALENDAR ══════════════════════════════════════════════════ */}
                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calendar grid */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                            {/* Month nav */}
                            <div className="flex items-center justify-between mb-5">
                                <button
                                    onClick={() => { setCalendarDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <h2 className="text-base font-bold text-slate-800">
                                    {MONTHS[month]} {year}
                                </h2>
                                <button
                                    onClick={() => { setCalendarDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map(d => (
                                    <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarCells.map((day, idx) => {
                                    if (!day) return <div key={`empty-${idx}`} />;
                                    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                    const dayLessonList = lessonsByDate[dateStr] || [];
                                    const isToday    = dateStr === todayStr;
                                    const isSelected = day === selectedDay;
                                    const zakazano   = dayLessonList.filter(l => l.status === 'ZAKAZANO').length;
                                    const odradeno   = dayLessonList.filter(l => l.status === 'ODRAĐENO').length;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                            className={`relative rounded-lg p-1.5 min-h-[52px] flex flex-col items-center transition-all ${
                                                isSelected
                                                    ? 'bg-blue-500 text-white shadow-sm'
                                                    : isToday
                                                        ? 'bg-blue-50 text-blue-700 font-bold'
                                                        : dayLessonList.length > 0
                                                            ? 'hover:bg-slate-50 bg-white border border-slate-100'
                                                            : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className={`text-sm font-semibold ${isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                                {day}
                                            </span>
                                            {dayLessonList.length > 0 && (
                                                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                                                    {zakazano > 0 && (
                                                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white/70' : 'bg-blue-400'}`} />
                                                    )}
                                                    {odradeno > 0 && (
                                                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white/70' : 'bg-green-400'}`} />
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Zakazano
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Odrađeno
                                </div>
                            </div>
                        </div>

                        {/* Day detail panel */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5">
                            {!selectedDay ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <Calendar size={32} className="text-slate-200 mb-3" />
                                    <p className="text-sm text-slate-400">Klikni na dan u kalendaru</p>
                                    <p className="text-xs text-slate-300 mt-1">da vidiš zakazane časove</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-slate-800 text-sm">
                                            {String(selectedDay).padStart(2,'0')}. {MONTHS[month]} {year}
                                        </h3>
                                        <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                    </div>
                                    {dayLessons.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic text-center py-8">Nema časova ovaj dan.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {dayLessons
                                                .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
                                                .map(lesson => {
                                                    const time = new Date(lesson.dateTime).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
                                                    const cand = candidates.find(
                                                        c => String(c.user?.userId) === String(lesson.candidate?.userId)
                                                    );
                                                    return (
                                                        <div key={lesson.lessonId} className={`rounded-lg border p-3 ${
                                                            lesson.status === 'ZAKAZANO' ? 'border-blue-200 bg-blue-50' :
                                                            lesson.status === 'ODRAĐENO' ? 'border-green-200 bg-green-50' :
                                                            'border-slate-200 bg-slate-50'
                                                        }`}>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800">
                                                                        {lesson.candidate?.firstName} {lesson.candidate?.lastName}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                                        <Clock size={11} /> {time}
                                                                        {lesson.notes && ` · ${lesson.notes}`}
                                                                    </p>
                                                                </div>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                                                                    lesson.status === 'ZAKAZANO' ? 'bg-blue-100 text-blue-700' :
                                                                    lesson.status === 'ODRAĐENO' ? 'bg-green-100 text-green-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {lesson.status}
                                                                </span>
                                                            </div>
                                                            {lesson.status === 'ZAKAZANO' && (
                                                                <button
                                                                    onClick={() => setCompletingLesson({
                                                                        lessonId: lesson.lessonId,
                                                                        candidateId: cand?.candidateId,
                                                                        topic: '',
                                                                        notes: '',
                                                                    })}
                                                                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium"
                                                                >
                                                                    <CheckCircle size={12} /> Označi kao odrađen
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    )}

                                    {/* Upcoming this month summary */}
                                    <div className="mt-5 pt-4 border-t border-slate-100">
                                        <p className="text-xs font-semibold text-slate-500 mb-2">OVAJ MJESEC</p>
                                        {Object.entries(lessonsByDate)
                                            .filter(([d]) => d.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .slice(0, 5)
                                            .map(([date, ls]) => {
                                                const d = parseInt(date.split('-')[2]);
                                                const zakazanih = ls.filter(l => l.status === 'ZAKAZANO').length;
                                                return (
                                                    <button
                                                        key={date}
                                                        onClick={() => setSelectedDay(d)}
                                                        className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-slate-50 ${d === selectedDay ? 'bg-slate-100' : ''}`}
                                                    >
                                                        <span className="text-slate-600">{String(d).padStart(2,'0')}. {MONTHS[month]}</span>
                                                        <span className={`px-1.5 py-0.5 rounded font-semibold ${zakazanih > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                            {ls.length} {ls.length === 1 ? 'čas' : 'časa'}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        }
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ══ KANDIDATI ═════════════════════════════════════════════════ */}
                {activeTab === 'candidates' && (
                    candidates.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
                            Nemate dodijeljenih kandidata.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Candidate list sidebar */}
                            <div className="space-y-2">
                                {candidates.map(c => {
                                    const cl = lessons[c.candidateId] || [];
                                    const pct = Math.round((cl.length / 40) * 100);
                                    const isSelected = c.candidateId === selectedCandidateId;
                                    const initials = ((c.user?.firstName?.[0] || '') + (c.user?.lastName?.[0] || '')).toUpperCase();

                                    return (
                                        <button
                                            key={c.candidateId}
                                            onClick={() => setSelectedCandidateId(c.candidateId)}
                                            className={`w-full text-left rounded-xl border p-4 transition-all ${
                                                isSelected
                                                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-800 text-sm truncate">
                                                        {c.user?.firstName} {c.user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">{c.user?.email}</p>
                                                    <div className="mt-1.5">
                                                        <div className="flex items-center justify-between text-xs mb-0.5">
                                                            <span className={cl.length >= 40 ? 'text-green-600 font-semibold' : 'text-slate-500'}>
                                                                {cl.length}/40 časova
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-1">
                                                            <div
                                                                className={`h-1 rounded-full transition-all ${cl.length >= 40 ? 'bg-green-500' : 'bg-blue-400'}`}
                                                                style={{ width: `${Math.min(100, pct)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Candidate detail */}
                            {selectedCandidate ? (
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Header card */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                                                    {((selectedCandidate.user?.firstName?.[0] || '') + (selectedCandidate.user?.lastName?.[0] || '')).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-slate-800">
                                                        {selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}
                                                    </h2>
                                                    <p className="text-sm text-slate-500">{selectedCandidate.user?.email}</p>
                                                    {selectedCandidate.rule && (
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            Pravilo: {selectedCandidate.rule.ruleName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {(() => {
                                                const cl = lessons[selectedCandidate.candidateId] || [];
                                                const total = selectedCandidate.rule?.minPracticalLessons ?? 40;
                                                const allDone = cl.length >= total;
                                                return !allDone ? (
                                                    <button
                                                        onClick={() => setProposing({
                                                            candidateId: selectedCandidate.candidateId,
                                                            candidateName: `${selectedCandidate.user?.firstName} ${selectedCandidate.user?.lastName}`,
                                                            date: '', time: '', notes: '',
                                                        })}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium"
                                                    >
                                                        <Send size={14} /> Predloži termin
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-medium">
                                                        <GraduationCap size={14} /> Obuka završena
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                                            {(() => {
                                                const cl = lessons[selectedCandidate.candidateId] || [];
                                                const total = selectedCandidate.rule?.minPracticalLessons ?? 40;
                                                const pct = Math.round((cl.length / total) * 100);
                                                return (
                                                    <>
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-green-600">{cl.length}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">Odrađenih časova</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-slate-700">{total}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">Ukupno potrebno</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className={`text-2xl font-bold ${pct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>{Math.min(100, pct)}%</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">Napredak</p>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Driving lessons evidence */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen size={16} className="text-blue-500" />
                                            <h3 className="font-semibold text-slate-800 text-sm">Evidencija časova vožnje</h3>
                                        </div>

                                        {(() => {
                                            const cl = lessons[selectedCandidate.candidateId] || [];
                                            const total = selectedCandidate.rule?.minPracticalLessons ?? 40;
                                            const allDone = cl.length >= total;

                                            return (
                                                <>
                                                    {allDone && (
                                                        <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg border border-green-200 text-sm font-semibold">
                                                            <GraduationCap size={16} /> Svi časovi vožnje završeni!
                                                        </div>
                                                    )}

                                                    {cl.length > 0 ? (
                                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                                            {cl.map(lesson => (
                                                                <div key={lesson.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                                            {lesson.lessonNumber}
                                                                        </span>
                                                                        <div>
                                                                            <p className="text-xs font-medium text-slate-700">{lesson.date}</p>
                                                                            {lesson.notes && <p className="text-xs text-slate-400 truncate max-w-[100px]">{lesson.notes}</p>}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => deleteLesson(selectedCandidate.candidateId, lesson.lessonNumber)}
                                                                        className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic mb-4">Nema odrađenih časova vožnje.</p>
                                                    )}

                                                    {!allDone && (
                                                        <AddDrivingLessonForm
                                                            candidateId={selectedCandidate.candidateId}
                                                            existingNumbers={cl.map(l => l.lessonNumber)}
                                                            onAdd={addLesson}
                                                        />
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Upcoming lessons for this candidate */}
                                    {(() => {
                                        const candLessons = scheduledLessons
                                            .filter(l => String(l.candidate?.userId) === String(selectedCandidate.user?.userId))
                                            .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
                                            .slice(0, 5);
                                        if (candLessons.length === 0) return null;
                                        return (
                                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <TrendingUp size={16} className="text-indigo-500" />
                                                    <h3 className="font-semibold text-slate-800 text-sm">Zakazani / Prošli termini</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    {candLessons.map(lesson => (
                                                        <div key={lesson.lessonId} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-700">
                                                                    {new Date(lesson.dateTime).toLocaleString('bs-BA', {
                                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </p>
                                                                {lesson.notes && <p className="text-xs text-slate-400 mt-0.5">{lesson.notes}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                                    lesson.status === 'ZAKAZANO' ? 'bg-blue-100 text-blue-700' :
                                                                    lesson.status === 'ODRAĐENO' ? 'bg-green-100 text-green-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>{lesson.status}</span>
                                                                {lesson.status === 'ZAKAZANO' && (
                                                                    <button
                                                                        onClick={() => setCompletingLesson({
                                                                            lessonId: lesson.lessonId,
                                                                            candidateId: selectedCandidate.candidateId,
                                                                            topic: '', notes: '',
                                                                        })}
                                                                        className="flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg"
                                                                    >
                                                                        <CheckCircle size={11} /> Odrađeno
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="lg:col-span-2 flex items-center justify-center bg-white rounded-xl border border-slate-200 p-10 text-slate-400">
                                    Odaberi kandidata
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* ── Modal: Predloži termin ──────────────────────────────────────── */}
            {proposing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="font-bold text-slate-800 mb-1">Predloži termin</h3>
                        <p className="text-sm text-slate-500 mb-4">{proposing.candidateName}</p>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Datum</label>
                                    <input type="date" value={proposing.date} min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setProposing(p => ({ ...p, date: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Vrijeme</label>
                                    <input type="time" value={proposing.time}
                                        onChange={e => setProposing(p => ({ ...p, time: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Napomena (opcionalno)</label>
                                <input type="text" value={proposing.notes} placeholder="Npr. parking, gradska vožnja..."
                                    onChange={e => setProposing(p => ({ ...p, notes: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setProposing(null)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Odustani</button>
                            <button onClick={submitProposal} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium flex items-center gap-1.5">
                                <Send size={14} /> Pošalji prijedlog
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Odrađen čas ─────────────────────────────────────────── */}
            {completingLesson && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Označi čas kao odrađen</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Tema / gradivo (opcionalno)</label>
                                <input type="text" value={completingLesson.topic} placeholder="Npr. parking, kružni tok..."
                                    onChange={e => setCompletingLesson(p => ({ ...p, topic: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Napomena (opcionalno)</label>
                                <textarea rows={2} value={completingLesson.notes} placeholder="Opcionalna napomena..."
                                    onChange={e => setCompletingLesson(p => ({ ...p, notes: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setCompletingLesson(null)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Odustani</button>
                            <button onClick={completeLesson} className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-1.5">
                                <CheckCircle size={14} /> Potvrdi odrađeno
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddDrivingLessonForm({ candidateId, existingNumbers, onAdd }) {
    const available = Array.from({ length: 40 }, (_, i) => i + 1).filter(n => !existingNumbers.includes(n));
    const [lessonNumber, setLessonNumber] = useState(available[0] ?? 1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (available.length > 0 && !available.includes(lessonNumber)) setLessonNumber(available[0]);
    }, [existingNumbers.length]);

    return (
        <div className="flex items-center gap-2 flex-wrap bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            <select value={lessonNumber} onChange={e => setLessonNumber(Number(e.target.value))}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {available.map(n => <option key={n} value={n}>Čas {n}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            <input type="text" placeholder="Bilješka (opcionalno)" value={notes} onChange={e => setNotes(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex-1 min-w-28" />
            <button onClick={() => onAdd(candidateId, lessonNumber, date, notes)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                <Plus size={14} /> Dodaj čas
            </button>
        </div>
    );
}
