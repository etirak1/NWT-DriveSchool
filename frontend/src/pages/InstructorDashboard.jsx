import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
    GraduationCap, LogOut, Car, Plus, Trash2, Calendar,
    CheckCircle, Send, Bell, X, ChevronLeft, ChevronRight,
    User, Clock, BookOpen, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { getErrorMessage } from '../utils/helpers';
import AddDrivingLessonForm from '../components/AddDrivingLessonForm';
import { TOTAL_DRIVING_LESSONS } from '../constants';

const DAYS = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
const MONTHS = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

export default function InstructorDashboard() {
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

    const showSuccess = (msg) => { setSuccessMsg(msg); setErrorMsg(''); setTimeout(() => setSuccessMsg(''), 3000); };
    const showError   = (msg) => { setErrorMsg(msg); setSuccessMsg(''); setTimeout(() => setErrorMsg(''), 3000); };

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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Učitavanje...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <header className="bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm w-9 h-9 rounded-lg flex items-center justify-center ring-1 ring-white/30">
                                <Car className="text-white" size={18} />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white leading-tight">DriveSchool</h1>
                                <p className="text-xs text-blue-200 leading-tight">Instruktor panel</p>
                            </div>
                        </div>

                        {/* Nav tabs */}
                        <nav className="hidden md:flex items-center gap-1">
                            {[
                                { id: 'calendar',   label: 'Kalendar',  icon: Calendar },
                                { id: 'candidates', label: 'Kandidati', icon: User },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === id
                                            ? 'bg-white/20 text-white shadow-sm'
                                            : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon size={15} /> {label}
                                </button>
                            ))}
                        </nav>

                        {/* Right: user + actions */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex flex-col items-end mr-1">
                                <p className="text-sm font-semibold text-white leading-tight">{email}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20 text-white ring-1 ring-white/30 leading-tight">
                                    {role}
                                </span>
                            </div>

                            {/* Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markAllRead(); }}
                                    className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white hover:bg-white/15 transition-colors"
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                {notifOpen && (
                                    <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                            <span className="font-semibold text-sm text-slate-800">Notifikacije</span>
                                            <div className="flex items-center gap-2">
                                                {notifications.length > 0 && (
                                                    <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Obriši sve</button>
                                                )}
                                                <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="px-4 py-1.5 text-xs flex items-center gap-1.5 border-b text-slate-400 bg-slate-50 border-slate-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            Ažurira se svakih 30s
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {notifications.length === 0
                                                ? <p className="text-sm text-slate-400 text-center py-8">Nema novih notifikacija</p>
                                                : notifications.map(n => (
                                                    <div key={n.id} className={`px-4 py-3 border-b border-slate-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                                                        <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
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
                                onClick={() => { logout(); navigate('/login'); }}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-100 hover:bg-white/15 hover:text-white rounded-lg transition-colors"
                            >
                                <LogOut size={15} />
                                <span className="hidden sm:inline">Odjava</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile tabs */}
                    <div className="flex md:hidden gap-1 pb-2">
                        {[
                            { id: 'calendar',   label: 'Kalendar',  icon: Calendar },
                            { id: 'candidates', label: 'Kandidati', icon: User },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    activeTab === id
                                        ? 'bg-white/20 text-white'
                                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── Main content ─────────────────────────────────────────────── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">

                {/* ══ KALENDAR ══════════════════════════════════════════════ */}
                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calendar grid */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => { setCalendarDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
                                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <h2 className="text-base font-bold text-slate-800">
                                    {MONTHS[month]} {year}
                                </h2>
                                <button
                                    onClick={() => { setCalendarDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
                                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map(d => (
                                    <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1 uppercase tracking-wide">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarCells.map((day, idx) => {
                                    if (!day) return <div key={`empty-${idx}`} />;
                                    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                    const dayLessonList = lessonsByDate[dateStr] || [];
                                    const isToday    = dateStr === todayStr;
                                    const isSelected = day === selectedDay;
                                    const zakazano   = dayLessonList.filter((l) => l.status === 'ZAKAZANO').length;
                                    const odradeno   = dayLessonList.filter((l) => l.status === 'ODRAĐENO').length;
                                    const otkazano   = dayLessonList.filter((l) => l.status === 'OTKAZANO').length;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                            className={`relative rounded-xl p-1.5 min-h-[52px] flex flex-col items-center transition-all ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : isToday
                                                        ? 'bg-blue-50 ring-2 ring-blue-300'
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
                                                    {otkazano > 0 && (
                                                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white/70' : 'bg-red-400'}`} />
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Zakazano
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Odrađeno
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Otkazano
                                </div>
                            </div>
                        </div>

                        {/* Day detail panel */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                            {!selectedDay ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                        <Calendar size={24} className="text-blue-300" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">Klikni na dan</p>
                                    <p className="text-xs text-slate-300 mt-1">da vidiš zakazane časove</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-bold text-slate-800">
                                            {String(selectedDay).padStart(2,'0')}. {MONTHS[month]} {year}
                                        </h3>
                                        <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {dayLessons.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic text-center py-10">Nema časova ovaj dan.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {dayLessons
                                                .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
                                                .map((lesson) => {
                                                    const time = new Date(lesson.dateTime).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
                                                    const cand = candidates.find(
                                                        c => String(c.user?.userId) === String(lesson.candidate?.userId)
                                                    );
                                                    return (
                                                        <div key={lesson.lessonId} className={`rounded-xl border p-3.5 ${
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
                                                                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-semibold transition-colors"
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

                                    <div className="mt-5 pt-4 border-t border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ovaj mjesec</p>
                                        {Object.entries(lessonsByDate)
                                            .filter(([d]) => d.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .slice(0, 5)
                                            .map(([date, ls]) => {
                                                const d = parseInt(date.split('-')[2]);
                                                const zakazanih = (ls || []).filter(l => l.status === 'ZAKAZANO').length;
                                                return (
                                                    <button
                                                        key={date}
                                                        onClick={() => setSelectedDay(d)}
                                                        className={`w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-xs hover:bg-slate-50 transition-colors ${d === selectedDay ? 'bg-slate-100' : ''}`}
                                                    >
                                                        <span className="text-slate-600 font-medium">{String(d).padStart(2,'0')}. {MONTHS[month]}</span>
                                                        <span className={`px-2 py-0.5 rounded-full font-semibold ${zakazanih > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                            {(ls || []).length} {(ls || []).length === 1 ? 'čas' : 'časa'}
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

                {/* ══ KANDIDATI ══════════════════════════════════════════════ */}
                {activeTab === 'candidates' && (
                    candidates.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <User size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-medium">Nemate dodijeljenih kandidata.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Candidate list */}
                            <div className="space-y-2">
                                {candidates.map(c => {
                                    const cl = lessons[c.candidateId] || [];
                                    const pct = Math.round((cl.length / TOTAL_DRIVING_LESSONS) * 100);
                                    const isSelected = c.candidateId === selectedCandidateId;
                                    const initials = ((c.user?.firstName?.[0] || '') + (c.user?.lastName?.[0] || '')).toUpperCase();

                                    return (
                                        <button
                                            key={c.candidateId}
                                            onClick={() => setSelectedCandidateId(c.candidateId)}
                                            className={`w-full text-left rounded-2xl border p-4 transition-all ${
                                                isSelected
                                                    ? 'border-blue-400 bg-white shadow-md shadow-blue-100 ring-1 ring-blue-300/50'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-800 text-sm truncate">
                                                        {c.user?.firstName} {c.user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">{c.user?.email}</p>
                                                    <div className="mt-2">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className={cl.length >= TOTAL_DRIVING_LESSONS ? 'text-green-600 font-semibold' : 'text-slate-500'}>
                                                                {cl.length}/{TOTAL_DRIVING_LESSONS} časova
                                                            </span>
                                                            <span className="text-slate-400">{Math.min(100, pct)}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all ${cl.length >= TOTAL_DRIVING_LESSONS ? 'bg-green-500' : 'bg-blue-500'}`}
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
                                <div className="lg:col-span-2 space-y-5">
                                    {/* Header card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-200">
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
                                                const total = selectedCandidate.rule?.minPracticalLessons ?? TOTAL_DRIVING_LESSONS;
                                                const allDone = cl.length >= total;
                                                return !allDone ? (
                                                    <button
                                                        onClick={() => setProposing({
                                                            candidateId: selectedCandidate.candidateId,
                                                            candidateName: `${selectedCandidate.user?.firstName} ${selectedCandidate.user?.lastName}`,
                                                            date: '', time: '', notes: '',
                                                        })}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl font-semibold shadow-sm transition-colors"
                                                    >
                                                        <Send size={14} /> Predloži termin
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 text-sm rounded-xl font-semibold">
                                                        <GraduationCap size={14} /> Obuka završena
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
                                            {(() => {
                                                const cl = lessons[selectedCandidate.candidateId] || [];
                                                const total = selectedCandidate.rule?.minPracticalLessons ?? TOTAL_DRIVING_LESSONS;
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
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <BookOpen size={14} className="text-blue-600" />
                                            </div>
                                            <h3 className="font-bold text-slate-800">Evidencija časova vožnje</h3>
                                        </div>

                                        {(() => {
                                            const cl = lessons[selectedCandidate.candidateId] || [];
                                            const total = selectedCandidate.rule?.minPracticalLessons ?? TOTAL_DRIVING_LESSONS;
                                            const allDone = cl.length >= total;

                                            return (
                                                <>
                                                    {allDone && (
                                                        <div className="mb-5 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 text-sm font-semibold">
                                                            <GraduationCap size={16} /> Svi časovi vožnje završeni!
                                                        </div>
                                                    )}

                                                    {cl.length > 0 ? (
                                                        <div className="grid grid-cols-2 gap-2 mb-5">
                                                            {cl.map((lesson) => (
                                                                <div key={lesson.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 hover:border-slate-200 transition-colors">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                                            {lesson.lessonNumber}
                                                                        </span>
                                                                        <div>
                                                                            <p className="text-xs font-semibold text-slate-700">{lesson.date}</p>
                                                                            {lesson.notes && <p className="text-xs text-slate-400 truncate max-w-[100px]">{lesson.notes}</p>}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => deleteLesson(selectedCandidate.candidateId, lesson.lessonNumber)}
                                                                        className="text-slate-300 hover:text-red-500 transition-colors ml-1 p-1 rounded-lg hover:bg-red-50"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic mb-5">Nema odrađenih časova vožnje.</p>
                                                    )}

                                                    {!allDone && (
                                                        <>
                                                            <AddDrivingLessonForm
                                                                candidateId={selectedCandidate.candidateId}
                                                                existingNumbers={cl.map((l) => l.lessonNumber)}
                                                                onAdd={addLesson}
                                                            />
                                                            {successMsg && (
                                                                <div className="mt-3 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 text-sm font-medium">
                                                                    <CheckCircle size={15} className="shrink-0" /> {successMsg}
                                                                </div>
                                                            )}
                                                            {errorMsg && (
                                                                <div className="mt-3 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 text-sm">
                                                                    {errorMsg}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Upcoming lessons */}
                                    {(() => {
                                        const candLessons = scheduledLessons
                                            .filter(l => String(l.candidate?.userId) === String(selectedCandidate.user?.userId))
                                            .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
                                            .slice(0, 5);
                                        if (candLessons.length === 0) return null;
                                        return (
                                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                                                <div className="flex items-center gap-2 mb-5">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <TrendingUp size={14} className="text-blue-600" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-800">Zakazani / Prošli termini</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    {candLessons.map(lesson => (
                                                        <div key={lesson.lessonId} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-700">
                                                                    {(() => {
                                                                        const DANI = ['Nedjelja','Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota'];
                                                                        const MJES = ['januar','februar','mart','april','maj','juni','juli','august','septembar','oktobar','novembar','decembar'];
                                                                        const d = new Date(lesson.dateTime);
                                                                        const h = String(d.getHours()).padStart(2,'0');
                                                                        const m = String(d.getMinutes()).padStart(2,'0');
                                                                        return `${DANI[d.getDay()]}, ${d.getDate()}. ${MJES[d.getMonth()]} ${d.getFullYear()} u ${h}:${m}`;
                                                                    })()}
                                                                </p>
                                                                {lesson.notes && <p className="text-xs text-slate-400 mt-0.5">{lesson.notes}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
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
                                                                        className="flex items-center gap-1 px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-colors"
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
                                <div className="lg:col-span-2 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200/80 p-16">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                            <User size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-medium">Odaberi kandidata</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}
            </main>

            {/* ── Modal: Predloži termin ──────────────────────────────────── */}
            {proposing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Send size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Predloži termin</h3>
                                <p className="text-sm text-slate-500">{proposing.candidateName}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Datum</label>
                                    <input type="date" value={proposing.date} min={new Date().toISOString().split('T')[0]}
                                           onChange={e => setProposing((p) => ({ ...p, date: e.target.value }))}
                                           className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Vrijeme</label>
                                    <input type="time" value={proposing.time}
                                           onChange={e => setProposing((p) => ({ ...p, time: e.target.value }))}
                                           className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Napomena (opcionalno)</label>
                                <input type="text" value={proposing.notes} placeholder="Npr. parking, gradska vožnja..."
                                       onChange={e => setProposing((p) => ({ ...p, notes: e.target.value }))}
                                       className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setProposing(null)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Odustani</button>
                            <button onClick={submitProposal} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-colors">
                                <Send size={14} /> Pošalji prijedlog
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Odrađen čas ─────────────────────────────────────── */}
            {completingLesson && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle size={18} className="text-green-600" />
                            </div>
                            <h3 className="font-bold text-slate-800">Označi čas kao odrađen</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tema / gradivo (opcionalno)</label>
                                <input type="text" value={completingLesson.topic} placeholder="Npr. parking, kružni tok..."
                                       onChange={e => setCompletingLesson((p) => ({ ...p, topic: e.target.value }))}
                                       className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Napomena (opcionalno)</label>
                                <textarea rows={2} value={completingLesson.notes} placeholder="Opcionalna napomena..."
                                          onChange={e => setCompletingLesson((p) => ({ ...p, notes: e.target.value }))}
                                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none bg-white" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setCompletingLesson(null)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Odustani</button>
                            <button onClick={completeLesson} className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-colors">
                                <CheckCircle size={14} /> Potvrdi odrađeno
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
