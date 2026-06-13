import { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle, XCircle, Clock, Calendar, Users, ChevronDown, ChevronUp, AlertTriangle, CalendarX } from 'lucide-react';
import { api } from '../api/client';

const STATUS_COLORS = {
    'PLANIRANO': 'bg-blue-50 text-blue-700 border-blue-200',
    'ODRZANO':   'bg-green-50 text-green-700 border-green-200',
    'OTKAZANO':  'bg-red-50 text-red-700 border-red-200',
};

function getStatusColor(status) {
    if (!status) return STATUS_COLORS['PLANIRANO'];
    if (status === 'ODRZANO') return STATUS_COLORS['ODRZANO'];
    if (status === 'OTKAZANO') return STATUS_COLORS['OTKAZANO'];
    return STATUS_COLORS['PLANIRANO'];
}

function getStatusLabel(status) {
    if (!status || status === 'PLANIRANO') return 'Planirano';
    if (status === 'OTKAZANO') return 'Otkazano';
    return 'Odrzano';
}

export default function TheoryPlanViewModal({ plan, onClose }) {
    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [expandedSession, setExpandedSession] = useState(null);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [savingSession, setSavingSession] = useState(null);
    const [error, setError] = useState('');
    const [candidateNameMap, setCandidateNameMap] = useState({});
    const [cancelState, setCancelState] = useState({ sessionId: null, rescheduleDate: '' });
    const [cancelError, setCancelError] = useState('');

    // Bez timezone bugova — radi isključivo s string datumima
    const subtractOneDay = (dateStr) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        const prev = new Date(y, m - 1, d - 1);
        return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    };

    const getTomorrow = () => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    };

    const candidates = plan?.candidates || [];

    useEffect(() => {
        api.get('/api/candidates').then(res => {
            const map = {};
            res.data.forEach(c => {
                if (c.user) {
                    map[c.candidateId] = `${c.user.firstName} ${c.user.lastName}`;
                }
            });
            setCandidateNameMap(map);
        }).catch(() => {});
    }, []);

    useEffect(() => { loadSessions(); }, [plan]);

    useEffect(() => {
        if (activeTab === 'attendance') loadSummary();
    }, [activeTab]);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/theory-plans/${plan.id}/sessions`);
            setSessions(res.data);
            const initMap = {};
            res.data.forEach(s => {
                initMap[s.id] = candidates.map(c => c.candidateId);
            });
            setAttendanceMap(initMap);
        } catch (e) {
            setError('Greska pri ucitavanju termina.');
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        setSummaryLoading(true);
        try {
            const res = await api.get(`/api/theory-plans/${plan.id}/attendance-summary`);
            setSummary(res.data);
        } catch (e) {
            setError('Greska pri ucitavanju prisustva.');
        } finally {
            setSummaryLoading(false);
        }
    };

    const toggleAttendance = (sessionId, candidateId) => {
        setAttendanceMap(prev => {
            const current = prev[sessionId] || [];
            return {
                ...prev,
                [sessionId]: current.includes(candidateId)
                    ? current.filter(id => id !== candidateId)
                    : [...current, candidateId],
            };
        });
    };

    const updateSession = async (sessionId, status, note, newDate) => {
        setSavingSession(sessionId);
        setError('');
        try {
            const body = {
                status,
                note: note || null,
                presentCandidateIds: status === 'ODRZANO'
                    ? (attendanceMap[sessionId] || [])
                    : null,
            };
            if (newDate) body.newDate = newDate;
            const res = await api.patch(`/api/theory-plans/sessions/${sessionId}`, body);
            setSessions(prev => prev.map(s => s.id === sessionId ? res.data : s));
            setExpandedSession(null);
            setCancelState({ sessionId: null, rescheduleDate: '' });
            setCancelError('');
            if (activeTab === 'attendance') loadSummary();
        } catch (e) {
            const msg = e.response?.data?.message || e.response?.data || 'Greska pri azuriranju termina.';
            setError(typeof msg === 'string' ? msg : 'Greška.');
        } finally {
            setSavingSession(null);
        }
    };

    const getNextPlannedDate = (sessionId) => {
        const current = sessions.find(s => s.id === sessionId);
        if (!current) return null;
        const next = sessions
            .filter(s => s.sessionNumber > current.sessionNumber && (!s.status || s.status === 'PLANIRANO'))
            .sort((a, b) => a.sessionNumber - b.sessionNumber)[0];
        return next?.date || null;
    };

    const handleConfirmCancel = (sessionId) => {
        const d = cancelState.rescheduleDate;
        const tomorrow = getTomorrow();
        const nextDate = getNextPlannedDate(sessionId);
        const maxDate = subtractOneDay(nextDate);

        if (!d) {
            setCancelError('Morate odabrati datum za nadoknadu.');
            return;
        }
        if (d < tomorrow) {
            setCancelError('Datum nadoknade mora biti u budućnosti.');
            return;
        }
        if (maxDate && d > maxDate) {
            setCancelError(`Datum mora biti najkasnije ${maxDate} (dan prije termina ${nextDate}).`);
            return;
        }
        setCancelError('');
        updateSession(sessionId, 'OTKAZANO', null, d);
    };

    const isHeld = (s) => s.status === 'ODRZANO';
    const isPlanned = (s) => !s.status || s.status === 'PLANIRANO';

    const maintained = sessions.filter(isHeld).length;
    const planned = sessions.filter(isPlanned).length;

    const getCandidateName = (candidateId) => {
        return candidateNameMap[candidateId] || `Kandidat #${candidateId}`;
    };

    // Termin može biti označen odrzanim samo ako su SVI prethodni termini ODRZANO
    const canMarkHeld = (session) => {
        return !sessions.some(
            s => s.sessionNumber < session.sessionNumber && s.status !== 'ODRZANO'
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 w-9 h-9 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-white" size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{plan.groupName}</h3>
                            <p className="text-xs text-slate-500">
                                {maintained}/{sessions.length} termina odrzano &mdash; {planned} planirano
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X size={22} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-5 pt-3 pb-2 shrink-0">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="h-2 bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${sessions.length ? (maintained / sessions.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-5 pb-0 pt-2 shrink-0 flex gap-1 border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                            activeTab === 'sessions'
                                ? 'border-indigo-500 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Termini
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === 'attendance'
                                ? 'border-indigo-500 text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users size={13} />
                        Prisustvo
                    </button>
                </div>

                {error && (
                    <div className="mx-5 mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 shrink-0">
                        {error}
                    </div>
                )}

                {/* Tab: Termini */}
                {activeTab === 'sessions' && (
                    <div className="overflow-y-auto p-5 space-y-2">
                        {loading ? (
                            <div className="text-center py-10 text-slate-400 text-sm">Ucitavanje...</div>
                        ) : sessions.map(session => {
                            const isExpanded = expandedSession === session.id;
                            const isSaving = savingSession === session.id;
                            const held = isHeld(session);

                            return (
                                <div key={session.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                                            {session.sessionNumber}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-slate-800">
                                                    Termin {session.sessionNumber}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar size={11} /> {session.date}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={11} /> {session.startTime?.slice(0, 5)}
                                                </span>
                                                <span className="text-xs font-medium text-indigo-600">
                                                    Casovi {session.lessonFrom}-{session.lessonTo}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{session.topic}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getStatusColor(session.status)}`}>
                                            {getStatusLabel(session.status)}
                                        </span>
                                        {!isHeld(session) && (
                                            <button
                                                onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                                                className="text-slate-400 hover:text-slate-700 shrink-0">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 py-3 border-t border-slate-100 bg-white">
                                            <div className="mb-3">
                                                <p className="text-xs font-semibold text-slate-600 mb-1">Teme:</p>
                                                {session.topic?.split(' | ').map((t, i) => (
                                                    <p key={i} className="text-xs text-slate-600">- {t}</p>
                                                ))}
                                            </div>

                                            {candidates.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                                        <Users size={11} /> Prisustvo:
                                                    </p>
                                                    <div className="space-y-1">
                                                        {candidates.map(c => {
                                                            const name = getCandidateName(c.candidateId);
                                                            const present = (attendanceMap[session.id] || []).includes(c.candidateId);
                                                            return (
                                                                <label key={c.candidateId} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={present}
                                                                        onChange={() => toggleAttendance(session.id, c.candidateId)}
                                                                        className="accent-indigo-500"
                                                                    />
                                                                    <span className="text-sm text-slate-700">{name}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Za otkazane termine: samo opcija da se oznaci odrzanim (nadoknada) */}
                                            {session.status === 'OTKAZANO' ? (
                                                <div className="mt-2 flex gap-2 items-center">
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => updateSession(session.id, 'ODRZANO', null)}
                                                            disabled={isSaving || !canMarkHeld(session)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg">
                                                            <CheckCircle size={13} />
                                                            {isSaving ? 'Čuvam...' : 'Nadoknada odrzana'}
                                                        </button>
                                                        {!canMarkHeld(session) && (
                                                            <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 w-52 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg">
                                                                Prethodni termini još nisu odrzani.
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setExpandedSession(null)}
                                                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                                                        Zatvori
                                                    </button>
                                                </div>
                                            ) : cancelState.sessionId === session.id ? (() => {
                                                const nextDate = getNextPlannedDate(session.id);
                                                const maxDate = subtractOneDay(nextDate);
                                                const tomorrow = getTomorrow();
                                                return (
                                                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                                    <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                                                        <CalendarX size={13} /> Otkazivanje termina
                                                    </p>
                                                    <p className="text-xs text-amber-700 mb-2">
                                                        Odaberite datum nadoknade.
                                                        {maxDate
                                                            ? <span> Najkasnije: <strong>{maxDate}</strong> (dan prije termina {nextDate}).</span>
                                                            : <span> Nema sljedećeg termina — datum nije ograničen.</span>
                                                        }
                                                    </p>
                                                    <input
                                                        type="date"
                                                        value={cancelState.rescheduleDate}
                                                        min={tomorrow}
                                                        max={maxDate || undefined}
                                                        onChange={e => {
                                                            setCancelError('');
                                                            setCancelState(prev => ({ ...prev, rescheduleDate: e.target.value }));
                                                        }}
                                                        className={`text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 w-full mb-1 ${cancelError ? 'border-red-400 focus:ring-red-400' : 'border-amber-300 focus:ring-amber-400'}`}
                                                    />
                                                    {cancelError && (
                                                        <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                                                            <AlertTriangle size={11} /> {cancelError}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleConfirmCancel(session.id)}
                                                            disabled={isSaving}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg">
                                                            <XCircle size={13} />
                                                            {isSaving ? 'Čuvam...' : 'Potvrdi otkazivanje'}
                                                        </button>
                                                        <button
                                                            onClick={() => { setCancelState({ sessionId: null, rescheduleDate: '' }); setCancelError(''); }}
                                                            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
                                                            Odustani
                                                        </button>
                                                    </div>
                                                </div>
                                                );
                                            })() : (
                                                <div className="flex gap-2 mt-2">
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => updateSession(session.id, 'ODRZANO', null)}
                                                            disabled={isSaving || !canMarkHeld(session)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg">
                                                            <CheckCircle size={13} />
                                                            {isSaving ? 'Cuvam...' : 'Oznaci odrzanim'}
                                                        </button>
                                                        {!canMarkHeld(session) && (
                                                            <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 w-52 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg">
                                                                Prethodni termini još nisu odrzani ili otkazani.
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setCancelState({ sessionId: session.id, rescheduleDate: '' })}
                                                        disabled={isSaving}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg">
                                                        <XCircle size={13} />
                                                        Otkazi
                                                    </button>
                                                    <button
                                                        onClick={() => setExpandedSession(null)}
                                                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                                                        Zatvori
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tab: Prisustvo */}
                {activeTab === 'attendance' && (
                    <div className="overflow-y-auto p-5">
                        {summaryLoading ? (
                            <div className="text-center py-10 text-slate-400 text-sm">Ucitavanje...</div>
                        ) : maintained === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                Nema odrzanih termina jos.
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-slate-500 mb-3">
                                    Minimum 60% odsušanih časova (od ukupno {plan.totalLessons}) za pravo izlaska na teorijski ispit.
                                    Odrzano termina: <strong>{maintained}</strong>.
                                </p>
                                <div className="space-y-2">
                                    {summary.map(s => {
                                        const name = getCandidateName(s.candidateId);
                                        const pct = s.attendancePct;
                                        const eligible = s.eligible;
                                        return (
                                            <div key={s.candidateId}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                                                    eligible
                                                        ? 'border-green-200 bg-green-50'
                                                        : 'border-red-200 bg-red-50'
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Prisutan/a: {s.attended}/{s.heldSessions} termina
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {s.attendedLessons}/{s.totalLessons} časova
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className={`text-lg font-bold ${eligible ? 'text-green-700' : 'text-red-700'}`}>
                                                        {pct}%
                                                    </p>
                                                    {eligible ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                            <CheckCircle size={10} /> Može na ispit
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                            <AlertTriangle size={10} /> {pct < 60 ? `${s.attendedLessons}/${s.totalLessons} čas.` : 'Nema pravo'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Mini progress bar */}
                                                <div className="w-16 shrink-0">
                                                    <div className="w-full bg-white rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${eligible ? 'bg-green-500' : 'bg-red-400'}`}
                                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="w-full relative h-2 -mt-2">
                                                        <div className="absolute left-[60%] top-0 w-px h-2 bg-slate-400" title="60% minimum" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex justify-end">
                    <button onClick={onClose}
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm">
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}
