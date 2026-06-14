import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { getErrorMessage } from '../utils/helpers';
import {
    CheckCircle2, Lock, Clock, AlertCircle, ChevronDown, ChevronUp,
    BookOpen, Car, FileCheck, GraduationCap, Award, ClipboardList
} from 'lucide-react';
import TheoryAttendanceModal from './TheoryAttendanceModal';

const PHASE_ICONS = {
    UPIS:            <ClipboardList size={15} />,
    TEORIJA:         <BookOpen size={15} />,
    TEORIJSKI_ISPIT: <FileCheck size={15} />,
    VOZNJA:          <Car size={15} />,
    PRAKTICNI_ISPIT: <GraduationCap size={15} />,
    ZAVRSENO:        <Award size={15} />,
};

const STATUS_CONFIG = {
    'ZAVRŠENO':      { badge: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 size={14} className="text-green-500" /> },
    'U TOKU':        { badge: 'bg-blue-100 text-blue-700 border-blue-200',    icon: <Clock size={14} className="text-blue-500" /> },
    'NIJE ZAPOČETO': { badge: 'bg-slate-100 text-slate-500 border-slate-200', icon: <AlertCircle size={14} className="text-slate-400" /> },
    'ZAKLJUČANO':    { badge: 'bg-slate-100 text-slate-400 border-slate-200', icon: <Lock size={14} className="text-slate-300" /> },
};

const EXAM_STATUS_CONFIG = {
    'POLOŽENO':   { cls: 'bg-green-50 text-green-700 border-green-200',   label: 'Položeno' },
    'NEPOLOŽENO': { cls: 'bg-red-50 text-red-700 border-red-200',         label: 'Nije položio' },
    'ZAKAZANO':   { cls: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Zakazano' },
};

const PHASE_ICON_BG = {
    UPIS:            'bg-slate-100 text-slate-500',
    TEORIJA:         'bg-blue-100 text-blue-600',
    TEORIJSKI_ISPIT: 'bg-indigo-100 text-indigo-600',
    VOZNJA:          'bg-emerald-100 text-emerald-600',
    PRAKTICNI_ISPIT: 'bg-violet-100 text-violet-600',
    ZAVRSENO:        'bg-amber-100 text-amber-600',
};

export default function TrainingTimeline({ candidate, onOpenTheory, refreshToken = 0, isAdmin = false }) {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [examModal, setExamModal] = useState(null);
    const [expandedKey, setExpandedKey] = useState(null);
    const [attendanceOpen, setAttendanceOpen] = useState(false);

    const candidateId = candidate?.candidateId;

    // Fetch attendance eligibility for admin — needed to gate theory exam scheduling
    const { data: theoryEligibility } = useQuery({
        queryKey: ['theoryEligibility-timeline', candidateId],
        queryFn: () => api.get(`/api/theory-plans/candidate/${candidateId}/theory-eligibility`).then(r => r.data),
        enabled: !!candidateId && isAdmin,
        staleTime: 30_000,
    });

    const loadTimeline = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/api/phases/candidate/${candidateId}/timeline`);
            setTimeline(res.data);
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (candidateId) loadTimeline(); }, [candidateId, refreshToken]);

    const getAction = (phase) => {
        // Admin: handle TEORIJSKI_ISPIT regardless of lock status
        if (isAdmin && phase.key === 'TEORIJSKI_ISPIT') {
            // Block if backend explicitly says candidate is not eligible (attendance < 60%)
            if (theoryEligibility?.eligible === false) {
                const attended = theoryEligibility.attendedLessons ?? theoryEligibility.attendedCount ?? null;
                const total    = theoryEligibility.totalLessons    ?? theoryEligibility.requiredCount ?? null;
                const pct      = theoryEligibility.attendancePct   ?? (attended != null && total ? Math.round(attended / total * 100) : null);
                return (
                    <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg font-medium leading-snug">
                        Prisustvo {pct != null ? `${pct}%` : 'ispod 60%'} — ispit nije moguć
                    </span>
                );
            }

            return (
                <button
                    onClick={() => setExamModal({ key: phase.key, phaseType: 'TEORIJSKI ISPIT', label: 'Teorijski ispit', current: phase })}
                    className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold border border-indigo-600 transition-colors shadow-sm"
                >
                    {phase.examStatus ? 'Ažuriraj rezultat' : 'Zakaži ispit'}
                </button>
            );
        }

        if (phase.status === 'ZAKLJUČANO') return null;

        switch (phase.key) {
            case 'UPIS':
                return null;
            case 'TEORIJA':
                return (
                    <button
                        onClick={() => setAttendanceOpen(true)}
                        className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold border border-blue-200 transition-colors"
                    >
                        Otvori evidenciju
                    </button>
                );
            case 'TEORIJSKI_ISPIT':
                return (
                    <button
                        onClick={() => setExamModal({ key: phase.key, phaseType: 'TEORIJSKI ISPIT', label: 'Teorijski ispit', current: phase })}
                        className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold border border-indigo-200 transition-colors"
                    >
                        {phase.examStatus ? 'Ažuriraj rezultat' : 'Unesi rezultat'}
                    </button>
                );
            case 'VOZNJA':
                return (
                    <span className="text-xs text-slate-400 italic">
                        {phase.status === 'NIJE ZAPOČETO' ? 'Čeka zakazivanje' : 'Evidentira se automatski'}
                    </span>
                );
            case 'PRAKTICNI_ISPIT':
                return (
                    <button
                        onClick={() => setExamModal({ key: phase.key, phaseType: 'PRAKTIČNI ISPIT', label: 'Praktični ispit', current: phase })}
                        className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold border border-indigo-200 transition-colors"
                    >
                        {phase.examStatus ? 'Ažuriraj rezultat' : 'Unesi rezultat'}
                    </button>
                );
            case 'ZAVRSENO':
                return phase.status === 'ZAVRŠENO'
                    ? <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">Čestitamo!</span>
                    : null;
            default:
                return null;
        }
    };

    if (loading) return (
        <div className="py-6 text-center">
            <p className="text-sm text-slate-400 animate-pulse">Učitavanje toka obuke...</p>
        </div>
    );
    if (error) return (
        <div className="py-4 px-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
    );

    return (
        <div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Faza</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Napredak</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Akcija</th>
                    </tr>
                    </thead>
                    <tbody>
                    {timeline.map((phase) => {
                        const locked = phase.status === 'ZAKLJUČANO';
                        // Admin can always interact with TEORIJSKI_ISPIT — don't dim that row
                        const adminActive = isAdmin && phase.key === 'TEORIJSKI_ISPIT';
                        const dimRow = locked && !adminActive;
                        const iconBg = dimRow ? 'bg-slate-100 text-slate-300' : (PHASE_ICON_BG[phase.key] || 'bg-slate-100 text-slate-500');
                        const statusCfg = STATUS_CONFIG[phase.status] || STATUS_CONFIG['NIJE ZAPOČETO'];

                        return (
                            <>
                                <tr
                                    key={phase.key}
                                    className={`border-b border-slate-100 last:border-0 transition-colors ${dimRow ? 'opacity-50' : 'hover:bg-slate-50/60'}`}
                                >
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                                    {PHASE_ICONS[phase.key]}
                                                </span>
                                            <span className={`font-medium ${dimRow ? 'text-slate-400' : 'text-slate-700'}`}>
                                                    {phase.label}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            {statusCfg.icon}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${statusCfg.badge}`}>
                                                    {phase.status}
                                                </span>
                                        </div>
                                        {phase.examStatus && EXAM_STATUS_CONFIG[phase.examStatus] && (
                                            <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-semibold border ${EXAM_STATUS_CONFIG[phase.examStatus].cls}`}>
                                                    {EXAM_STATUS_CONFIG[phase.examStatus].label}
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {phase.progress
                                            ? <span className="text-slate-600 font-medium">{phase.progress}</span>
                                            : <span className="text-slate-300">—</span>
                                        }
                                        {phase.examDate && (
                                            <p className="text-xs text-slate-400 mt-0.5">{phase.examDate}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {getAction(phase)}
                                            {phase.notes && (
                                                <button
                                                    onClick={() => setExpandedKey(expandedKey === phase.key ? null : phase.key)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                >
                                                    {expandedKey === phase.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedKey === phase.key && phase.notes && (
                                    <tr key={`${phase.key}-notes`} className="bg-amber-50/70 border-b border-amber-100 last:border-0">
                                        <td colSpan={4} className="px-4 py-3 text-xs text-amber-800">
                                            <span className="font-semibold">Napomena:</span> {phase.notes}
                                        </td>
                                    </tr>
                                )}
                            </>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {attendanceOpen && (
                <TheoryAttendanceModal
                    candidate={candidate}
                    onClose={() => setAttendanceOpen(false)}
                />
            )}

            {examModal && (
                <ExamModal
                    candidateId={candidateId}
                    phaseType={examModal.phaseType}
                    label={examModal.label}
                    current={examModal.current}
                    onClose={() => setExamModal(null)}
                    onSaved={() => { setExamModal(null); loadTimeline(); }}
                />
            )}
        </div>
    );
}

function ExamModal({ candidateId, phaseType, label, current, onClose, onSaved }) {
    const [status, setStatus] = useState(current?.examStatus || 'ZAKAZANO');
    const [examDate, setExamDate] = useState(current?.examDate || '');
    const [notes, setNotes] = useState(current?.notes || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!status) { setError('Status je obavezan.'); return; }

        if ((status === 'POLOŽENO' || status === 'NEPOLOŽENO') && examDate) {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            if (examDate > today) {
                setError('Datum ispita ne može biti u budućnosti za status "Položeno" ili "Nije položio".');
                return;
            }
        }

        setSaving(true);
        try {
            await api.patch(`/api/phases/candidate/${candidateId}/exam`, {
                phaseType,
                status,
                examDate: examDate || null,
                notes: notes || null,
            });
            onSaved();
        } catch (e) {
            const data = e.response?.data;
            let msg = 'Greška pri čuvanju.';
            if (typeof data === 'string' && data.includes('interpolatedMessage=')) {
                const match = data.match(/interpolatedMessage='([^']+)'/);
                if (match) msg = match[1];
            } else if (data?.message) {
                msg = data.message;
            }
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4">
                    <h3 className="font-bold text-white text-base">{label} — rezultat</h3>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Status</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors"
                        >
                            <option value="ZAKAZANO">Zakazano</option>
                            <option value="POLOŽENO">Položeno</option>
                            <option value="NEPOLOŽENO">Nije položio</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Datum ispita</label>
                        <input
                            type="date"
                            value={examDate}
                            onChange={e => setExamDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Napomena</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Opcionalno..."
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors resize-none"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition-colors"
                    >
                        Odustani
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200"
                    >
                        {saving ? 'Čuvanje...' : 'Sačuvaj'}
                    </button>
                </div>
            </div>
        </div>
    );
}
