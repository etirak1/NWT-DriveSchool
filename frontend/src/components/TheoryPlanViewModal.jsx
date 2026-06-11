import { useState } from 'react';
import { X, BookOpen, CheckCircle, XCircle, Clock, Calendar, Users, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { api } from '../api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const STATUS_COLORS = {
    'PLANIRANO': 'bg-blue-50 text-blue-700 border-blue-200',
    'ODRZANO':   'bg-emerald-50 text-emerald-700 border-emerald-200',
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
    const [expandedSession, setExpandedSession] = useState(null);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [savingSession, setSavingSession] = useState(null);
    const [error, setError] = useState('');
    const [repForm, setRepForm] = useState({ date: '', time: '' });
    const [savingReschedule, setSavingReschedule] = useState(false);
    const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
    const queryClient = useQueryClient();

    const candidates = plan?.candidates || [];

    const { data: allCandidates = [] } = useQuery({
        queryKey: ['candidates'],
        queryFn: () => api.get('/api/candidates').then(r => r.data),
    });

    const candidateNameMap = Object.fromEntries(
        allCandidates
            .filter(c => c.user)
            .map(c => [c.candidateId, `${c.user.firstName} ${c.user.lastName}`])
    );

    const { data: sessions = [], isLoading: loading } = useQuery({
        queryKey: ['sessions', plan?.id],
        queryFn: () => api.get(`/api/theory-plans/${plan.id}/sessions`).then(r => {
            const data = r.data;
            const initMap = {};
            data.forEach(s => {
                initMap[s.id] = candidates.map(c => c.candidateId);
            });
            setAttendanceMap(initMap);
            return data;
        }),
        enabled: !!plan?.id,
    });

    const { data: summary = [], isLoading: summaryLoading } = useQuery({
        queryKey: ['attendanceSummary', plan?.id],
        queryFn: () => api.get(`/api/theory-plans/${plan.id}/attendance-summary`).then(r => r.data),
        enabled: !!plan?.id && activeTab === 'attendance',
    });

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

    const updateSession = async (sessionId, status, note) => {
        setSavingSession(sessionId);
        setError('');
        try {
            await api.patch(`/api/theory-plans/sessions/${sessionId}`, {
                status,
                note: note || null,
                presentCandidateIds: status === 'ODRZANO' ? (attendanceMap[sessionId] || []) : null,
            });
            queryClient.invalidateQueries({ queryKey: ['sessions', plan.id] });
            queryClient.invalidateQueries({ queryKey: ['attendanceSummary', plan.id] });
            setExpandedSession(null);
        } catch (e) {
            setError(e.response?.data?.message || 'Greska pri azuriranju termina.');
        } finally {
            setSavingSession(null);
        }
    };

    const handleExpand = (session) => {
        if (expandedSession === session.id) {
            setExpandedSession(null);
        } else {
            setExpandedSession(session.id);
            if (session.status === 'OTKAZANO') {
                setRepForm({
                    date: session.date || '',
                    time: session.startTime?.slice(0, 5) || '',
                });
            }
        }
    };

    const rescheduleSession = async (sessionId) => {
        if (!repForm.date || !repForm.time) return;
        setSavingReschedule(true);
        setError('');
        try {
            await api.patch(`/api/theory-plans/sessions/${sessionId}`, {
                status: 'PLANIRANO',
                date: repForm.date,
                startTime: repForm.time + ':00',
                note: null,
                presentCandidateIds: null,
            });
            queryClient.invalidateQueries({ queryKey: ['sessions', plan.id] });
            setExpandedSession(null);
            setRescheduleSuccess(true);
            setTimeout(() => setRescheduleSuccess(false), 4000);
        } catch (e) {
            setError(e.response?.data?.message || 'Greška pri zakazivanju termina.');
        } finally {
            setSavingReschedule(false);
        }
    };

    const isHeld = (s) => s.status === 'ODRZANO';
    const isPlanned = (s) => !s.status || s.status === 'PLANIRANO';

    const maintained = sessions.filter(isHeld).length;
    const planned = sessions.filter(isPlanned).length;

    const getCandidateName = (candidateId) =>
        candidateNameMap[candidateId] || `Kandidat #${candidateId}`;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-500 px-6 py-5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <BookOpen className="text-white" size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">{plan.groupName}</h3>
                                <p className="text-blue-200 text-xs mt-0.5">
                                    {maintained}/{sessions.length} termina odrzano &mdash; {planned} planirano
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
                            <X size={22} />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                            <div
                                className="h-1.5 bg-white rounded-full transition-all duration-500"
                                style={{ width: `${sessions.length ? (maintained / sessions.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-0 shrink-0 flex gap-1 border-b border-slate-100 bg-white">
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'sessions'
                                ? 'border-blue-500 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Termini
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === 'attendance'
                                ? 'border-blue-500 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users size={13} />
                        Prisustvo
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-3 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200 shrink-0 flex items-center gap-2">
                        <XCircle size={14} className="shrink-0" /> {error}
                    </div>
                )}

                {rescheduleSuccess && (
                    <div className="mx-6 mt-3 text-sm text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 shrink-0 flex items-center gap-2">
                        <CheckCircle size={14} className="shrink-0" />
                        Termin uspješno prekazan na novi datum!
                    </div>
                )}

                {/* Tab: Termini */}
                {activeTab === 'sessions' && (
                    <div className="overflow-y-auto p-6 space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm">Ucitavanje...</span>
                            </div>
                        ) : sessions.map(session => {
                            const isExpanded = expandedSession === session.id;
                            const isSaving = savingSession === session.id;
                            const held = isHeld(session);

                            const previousPending = sessions.some(
                                s => s.sessionNumber < session.sessionNumber && (!s.status || s.status === 'PLANIRANO')
                            );

                            const nextPlanned = sessions
                                .filter(s => s.sessionNumber > session.sessionNumber && (!s.status || s.status === 'PLANIRANO'))
                                .sort((a, b) => a.sessionNumber - b.sessionNumber)[0];
                            const maxDate = nextPlanned?.date
                                ? new Date(new Date(nextPlanned.date).getTime() - 86400000).toISOString().slice(0, 10)
                                : '';
                            const conflictSameDay = sessions.some(
                                s => s.id !== session.id && s.date === repForm.date && s.startTime?.slice(0, 5) === repForm.time
                            );

                            return (
                                <div key={session.id} className="border border-slate-100 rounded-xl overflow-hidden hover:border-blue-100 transition-colors">
                                    <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50">
                                        <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
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
                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                    Casovi {session.lessonFrom}-{session.lessonTo}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{session.topic}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${getStatusColor(session.status)}`}>
                                            {getStatusLabel(session.status)}
                                        </span>
                                        {!held && (
                                            <button
                                                onClick={() => handleExpand(session)}
                                                className={`shrink-0 transition-colors ${session.status === 'OTKAZANO' ? 'text-red-400 hover:text-red-600' : 'text-slate-400 hover:text-slate-700'}`}
                                                title={session.status === 'OTKAZANO' ? 'Zakaži zamjenski termin' : ''}>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className="px-5 py-4 border-t border-slate-100 bg-white">
                                            {session.status === 'OTKAZANO' ? (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                                                        <span className="text-xs font-semibold text-amber-700">
                                                            Odaberite novi datum
                                                            {maxDate ? ` (najkasnije ${maxDate})` : ''}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 mb-1 block">Datum *</label>
                                                            <input
                                                                type="date"
                                                                value={repForm.date}
                                                                max={maxDate || undefined}
                                                                onChange={e => setRepForm(f => ({ ...f, date: e.target.value }))}
                                                                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 mb-1 block">Početak *</label>
                                                            <input
                                                                type="time"
                                                                value={repForm.time}
                                                                onChange={e => setRepForm(f => ({ ...f, time: e.target.value }))}
                                                                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    {conflictSameDay && (
                                                        <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                                                            <AlertTriangle size={11} /> Već postoji termin u isto vrijeme — odaberite drugu satnicu.
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => rescheduleSession(session.id)}
                                                            disabled={savingReschedule || !repForm.date || !repForm.time || conflictSameDay}
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl transition-colors">
                                                            <Calendar size={13} />
                                                            {savingReschedule ? 'Zakazujem...' : 'Zakaži termin'}
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedSession(null)}
                                                            className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                                            Odustani
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="mb-3">
                                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Teme:</p>
                                                        {session.topic?.split(' | ').map((t, i) => (
                                                            <p key={i} className="text-xs text-slate-600 py-0.5">— {t}</p>
                                                        ))}
                                                    </div>

                                                    {candidates.length > 0 && (
                                                        <div className="mb-3">
                                                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                                <Users size={11} /> Prisustvo:
                                                            </p>
                                                            <div className="space-y-1.5">
                                                                {candidates.map(c => {
                                                                    const name = getCandidateName(c.candidateId);
                                                                    const present = (attendanceMap[session.id] || []).includes(c.candidateId);
                                                                    return (
                                                                        <label key={c.candidateId} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={present}
                                                                                onChange={() => toggleAttendance(session.id, c.candidateId)}
                                                                                className="accent-blue-600 w-4 h-4"
                                                                            />
                                                                            <span className="text-sm text-slate-700">{name}</span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {previousPending && (
                                                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 flex items-center gap-1.5">
                                                            <AlertTriangle size={11} className="shrink-0" />
                                                            Prethodni termin još nije završen ili otkazan.
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => updateSession(session.id, 'ODRZANO', null)}
                                                            disabled={isSaving || previousPending}
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
                                                            <CheckCircle size={13} />
                                                            {isSaving ? 'Cuvam...' : 'Oznaci odrzanim'}
                                                        </button>
                                                        <button
                                                            onClick={() => updateSession(session.id, 'OTKAZANO', null)}
                                                            disabled={isSaving}
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition-colors">
                                                            <XCircle size={13} />
                                                            Otkazi
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedSession(null)}
                                                            className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                                            Zatvori
                                                        </button>
                                                    </div>
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
                    <div className="overflow-y-auto p-6">
                        {summaryLoading ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm">Ucitavanje...</span>
                            </div>
                        ) : maintained === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-sm">
                                Nema odrzanih termina jos.
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-slate-500 mb-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                    Minimum 60% odsušanih časova (od ukupno {plan.totalLessons}) za pravo izlaska na teorijski ispit.
                                    Odrzano termina: <strong className="text-slate-700">{maintained}</strong>.
                                </p>
                                <div className="space-y-3">
                                    {summary.map(s => {
                                        const name = getCandidateName(s.candidateId);
                                        const pct = s.attendancePct;
                                        const eligible = s.eligible;
                                        return (
                                            <div key={s.candidateId}
                                                 className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-colors ${
                                                     eligible
                                                         ? 'border-emerald-200 bg-emerald-50'
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
                                                    <p className={`text-lg font-bold ${eligible ? 'text-emerald-700' : 'text-red-700'}`}>
                                                        {pct}%
                                                    </p>
                                                    {eligible ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                                            <CheckCircle size={10} /> Može na ispit
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                            <AlertTriangle size={10} /> {pct < 60 ? `${s.attendedLessons}/${s.totalLessons} čas.` : 'Nema pravo'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="w-16 shrink-0">
                                                    <div className="w-full bg-white rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${eligible ? 'bg-emerald-500' : 'bg-red-400'}`}
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

                <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end bg-slate-50/50">
                    <button onClick={onClose}
                            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm transition-colors">
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}
