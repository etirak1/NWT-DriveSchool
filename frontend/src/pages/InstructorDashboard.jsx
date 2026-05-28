import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { GraduationCap, LogOut, Car, ChevronDown, ChevronUp, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { getCurrentEmail, getCurrentRole, getCurrentUserId } from '../auth/jwt';

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const email = getCurrentEmail();
    const role = getCurrentRole();
    const userId = getCurrentUserId();

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCandidate, setExpandedCandidate] = useState(null);
    const [lessons, setLessons] = useState({});
    const [scheduledLessons, setScheduledLessons] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadCandidates = async () => {
            try {
                const res = await api.get('/api/candidates');
                const myCandidates = res.data.filter(
                    c => String(c.assignedInstructor?.user?.userId) === String(userId)
                );
                setCandidates(myCandidates);
            } catch (err) {
                showError('Greška pri učitavanju kandidata.');
            } finally {
                setLoading(false);
            }
        };
        loadCandidates();
    }, []);

    useEffect(() => {
        const loadScheduled = async () => {
            try {
                const res = await api.get(
                    `/api/lessons/instructor-lessons?userId=${userId}&size=50&sortBy=dateTime&sortDir=asc`
                );
                setScheduledLessons(res.data.content || []);
            } catch (err) {
                console.error('Greška pri učitavanju zakazanih časova:', err);
            }
        };
        loadScheduled();
    }, []);

    const loadLessons = async (candidateId) => {
        if (lessons[candidateId]) return;
        try {
            const res = await api.get(`/api/driving-lessons/candidate/${candidateId}`);
            setLessons(prev => ({ ...prev, [candidateId]: res.data }));
        } catch (err) {
            setLessons(prev => ({ ...prev, [candidateId]: [] }));
        }
    };

    const toggleExpand = async (candidateId) => {
        if (expandedCandidate === candidateId) {
            setExpandedCandidate(null);
        } else {
            setExpandedCandidate(candidateId);
            await loadLessons(candidateId);
        }
    };

    const addLesson = async (candidateId, lessonNumber, date, notes) => {
        try {
            await api.post(`/api/driving-lessons/candidate/${candidateId}`, {
                lessonNumber,
                date,
                notes
            });
            const res = await api.get(`/api/driving-lessons/candidate/${candidateId}`);
            setLessons(prev => ({ ...prev, [candidateId]: res.data }));
            showSuccess('Čas uspješno dodan!');
        } catch (err) {
            showError(err.response?.data?.message || 'Greška pri dodavanju časa.');
        }
    };

    const deleteLesson = async (candidateId, lessonNumber) => {
        try {
            await api.delete(`/api/driving-lessons/candidate/${candidateId}/lesson/${lessonNumber}`);
            const res = await api.get(`/api/driving-lessons/candidate/${candidateId}`);
            setLessons(prev => ({ ...prev, [candidateId]: res.data }));
            showSuccess('Čas obrisan.');
        } catch (err) {
            showError('Greška pri brisanju časa.');
        }
    };

    const completeLesson = async (lessonId) => {
        try {
            await api.post(`/api/lessons/${lessonId}/complete`);
            const res = await api.get(
                `/api/lessons/instructor-lessons?userId=${userId}&size=50&sortBy=dateTime&sortDir=asc`
            );
            setScheduledLessons(res.data.content || []);
            showSuccess('Čas označen kao odrađen!');
        } catch (err) {
            showError('Greška pri označavanju časa.');
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setErrorMsg('');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setSuccessMsg('');
        setTimeout(() => setErrorMsg(''), 3000);
    };

    if (loading) return <div className="p-10 text-center">Učitavanje...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
                            <Car className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">DriveSchool</h1>
                            <p className="text-xs text-slate-500">Instruktor panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:underline">
                            ← Nazad
                        </button>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{email}</p>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">{role}</span>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {successMsg && (
                    <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-100 text-sm">{successMsg}</div>
                )}
                {errorMsg && (
                    <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 text-sm">{errorMsg}</div>
                )}

                {/* Zakazani časovi od kandidata */}
                {scheduledLessons.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            Zakazani časovi
                        </h3>
                        <div className="space-y-2">
                            {scheduledLessons.map(lesson => (
                                <div key={lesson.lessonId} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {lesson.candidate?.firstName} {lesson.candidate?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {new Date(lesson.dateTime).toLocaleString('bs-BA', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                            {lesson.topic && ` · ${lesson.topic}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                            lesson.status === 'ZAKAZANO' ? 'bg-blue-100 text-blue-700'  :
                                            lesson.status === 'ODRAĐENO' ? 'bg-green-100 text-green-700' :
                                            lesson.status === 'OTKAZANO' ? 'bg-red-100 text-red-700'    :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {lesson.status}
                                        </span>
                                        {lesson.status === 'ZAKAZANO' && (
                                            <button
                                                onClick={() => completeLesson(lesson.lessonId)}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg"
                                                title="Označi kao odrađen"
                                            >
                                                <CheckCircle size={12} /> Odrađeno
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h2 className="text-2xl font-bold text-slate-900 mb-6">Moji kandidati</h2>

                {candidates.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                        Nemate dodijeljenih kandidata.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {candidates.map(candidate => {
                            const candidateLessons = lessons[candidate.candidateId] || [];
                            const count = candidateLessons.length;
                            const pct = Math.round((count / 40) * 100);
                            const allDone = count >= 40;

                            return (
                                <div key={candidate.candidateId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="p-5 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {candidate.user?.firstName} {candidate.user?.lastName}
                                            </p>
                                            <p className="text-sm text-slate-500">{candidate.user?.email}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Napredak: <span className="font-medium text-blue-600">{candidate.progressPercentage}%</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(candidate.candidateId)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
                                        >
                                            <Car size={14} />
                                            Časovi vožnje
                                            {expandedCandidate === candidate.candidateId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>

                                    {expandedCandidate === candidate.candidateId && (
                                        <div className="border-t border-slate-100 p-5 bg-slate-50">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-slate-700">Časovi vožnje</h4>
                                                <span className={`text-sm font-bold ${allDone ? 'text-green-600' : 'text-blue-600'}`}>
                                                    {count}/40 ({pct}%)
                                                </span>
                                            </div>

                                            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${allDone ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>

                                            {allDone && (
                                                <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg border border-green-200 text-sm font-semibold">
                                                    <GraduationCap size={16} />
                                                    Svi časovi vožnje završeni! Faza je automatski postavljena na POLOŽENO.
                                                </div>
                                            )}

                                            {candidateLessons.length > 0 ? (
                                                <div className="space-y-2 mb-4">
                                                    {candidateLessons.map(lesson => (
                                                        <div key={lesson.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-slate-200">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                                                                    {lesson.lessonNumber}
                                                                </span>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-700">{lesson.date}</p>
                                                                    {lesson.notes && (
                                                                        <p className="text-xs text-slate-400">{lesson.notes}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteLesson(candidate.candidateId, lesson.lessonNumber)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic mb-4">Nema odrađenih časova.</p>
                                            )}

                                            {!allDone && (
                                                <AddDrivingLessonForm
                                                    candidateId={candidate.candidateId}
                                                    existingNumbers={candidateLessons.map(l => l.lessonNumber)}
                                                    onAdd={addLesson}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function AddDrivingLessonForm({ candidateId, existingNumbers, onAdd }) {
    const available = Array.from({ length: 40 }, (_, i) => i + 1)
        .filter(n => !existingNumbers.includes(n));

    const [lessonNumber, setLessonNumber] = useState(available[0] ?? 1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (available.length > 0 && !available.includes(lessonNumber)) {
            setLessonNumber(available[0]);
        }
    }, [existingNumbers.length]);

    return (
        <div className="flex items-center gap-2 flex-wrap bg-white rounded-lg px-4 py-3 border border-slate-200">
            <select
                value={lessonNumber}
                onChange={e => setLessonNumber(Number(e.target.value))}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {available.map(n => (
                    <option key={n} value={n}>Čas {n}</option>
                ))}
            </select>
            <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="text"
                placeholder="Bilješka (opciono)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-32"
            />
            <button
                onClick={() => onAdd(candidateId, lessonNumber, date, notes)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
                <Plus size={14} /> Dodaj čas
            </button>
        </div>
    );
}
