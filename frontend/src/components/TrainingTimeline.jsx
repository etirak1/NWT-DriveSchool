import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { getErrorMessage } from '../utils/helpers';
import {
    CheckCircle2, Lock, Clock, AlertCircle, ChevronDown, ChevronUp,
    BookOpen, Car, FileCheck, GraduationCap, Award, ClipboardList
} from 'lucide-react';
import TheoryAttendanceModal from './TheoryAttendanceModal';

const PHASE_ICONS = {
    UPIS:            <ClipboardList size={16} />,
    TEORIJA:         <BookOpen size={16} />,
    TEORIJSKI_ISPIT: <FileCheck size={16} />,
    VOZNJA:          <Car size={16} />,
    PRAKTICNI_ISPIT: <GraduationCap size={16} />,
    ZAVRSENO:        <Award size={16} />,
};

const STATUS_BADGE = {
    'ZAVRŠENO':      'bg-green-100 text-green-700',
    'U TOKU':        'bg-blue-100 text-blue-700',
    'NIJE ZAPOČETO': 'bg-slate-100 text-slate-500',
    'ZAKLJUČANO':    'bg-slate-100 text-slate-400',
};

const STATUS_ICON = {
    'ZAVRŠENO':      <CheckCircle2 size={16} className="text-green-500" />,
    'U TOKU':        <Clock size={16} className="text-blue-500" />,
    'NIJE ZAPOČETO': <AlertCircle size={16} className="text-slate-400" />,
    'ZAKLJUČANO':    <Lock size={16} className="text-slate-300" />,
};

const EXAM_STATUS_LABEL = {
    'POLOŽENO':   { cls: 'text-green-700 bg-green-50', label: 'Položeno' },
    'NEPOLOŽENO': { cls: 'text-red-700 bg-red-50',     label: 'Nije položio' },
    'ZAKAZANO':   { cls: 'text-yellow-700 bg-yellow-50', label: 'Zakazano' },
};

export default function TrainingTimeline({ candidate, onOpenTheory, refreshToken = 0, onPhaseSaved }) {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [examModal, setExamModal] = useState(null); // { key, phaseType, label, current }
    const [expandedKey, setExpandedKey] = useState(null);
    const [attendanceOpen, setAttendanceOpen] = useState(false);

    const candidateId = candidate?.candidateId;

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
        if (phase.status === 'ZAKLJUČANO') return null;

        switch (phase.key) {
            case 'UPIS':
                return null;
            case 'TEORIJA':
                return (
                    <button
                        onClick={() => setAttendanceOpen(true)}
                        className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium"
                    >
                        Otvori evidenciju
                    </button>
                );
            case 'TEORIJSKI_ISPIT':
                return (
                    <button
                        onClick={() => setExamModal({
                            key: phase.key,
                            phaseType: 'TEORIJSKI ISPIT',
                            label: 'Teorijski ispit',
                            current: phase,
                        })}
                        className="text-xs px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium"
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
                        onClick={() => setExamModal({
                            key: phase.key,
                            phaseType: 'PRAKTIČNI ISPIT',
                            label: 'Praktični ispit',
                            current: phase,
                        })}
                        className="text-xs px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium"
                    >
                        {phase.examStatus ? 'Ažuriraj rezultat' : 'Unesi rezultat'}
                    </button>
                );
            case 'ZAVRSENO':
                return phase.status === 'ZAVRŠENO'
                    ? <span className="text-xs font-semibold text-green-600">🎓 Čestitamo!</span>
                    : null;
            default:
                return null;
        }
    };

    if (loading) return <p className="text-sm text-slate-400 py-2">Učitavanje toka obuke...</p>;
    if (error) return <p className="text-sm text-red-500 py-2">{error}</p>;

    return (
        <div className="mt-2">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Faza</th>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Napredak</th>
                            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Akcija</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeline.map((phase) => (
                            <>
                                <tr
                                    key={phase.key}
                                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                                >
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`shrink-0 ${phase.status === 'ZAKLJUČANO' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {PHASE_ICONS[phase.key]}
                                            </span>
                                            <span className={`font-medium ${phase.status === 'ZAKLJUČANO' ? 'text-slate-400' : 'text-slate-700'}`}>
                                                {phase.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-1.5">
                                            {STATUS_ICON[phase.status]}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[phase.status] || ''}`}>
                                                {phase.status}
                                            </span>
                                        </div>
                                        {phase.examStatus && EXAM_STATUS_LABEL[phase.examStatus] && (
                                            <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${EXAM_STATUS_LABEL[phase.examStatus].cls}`}>
                                                {EXAM_STATUS_LABEL[phase.examStatus].label}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 pr-4">
                                        {phase.progress
                                            ? <span className="text-slate-600">{phase.progress}</span>
                                            : <span className="text-slate-300">—</span>
                                        }
                                        {phase.examDate && (
                                            <p className="text-xs text-slate-400 mt-0.5">{phase.examDate}</p>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            {getAction(phase)}
                                            {phase.notes && (
                                                <button
                                                    onClick={() => setExpandedKey(expandedKey === phase.key ? null : phase.key)}
                                                    className="text-slate-400 hover:text-slate-600"
                                                >
                                                    {expandedKey === phase.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedKey === phase.key && phase.notes && (
                                    <tr key={`${phase.key}-notes`} className="bg-amber-50">
                                        <td colSpan={4} className="px-4 py-2 text-xs text-amber-800 italic">
                                            📝 {phase.notes}
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
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
                    onSaved={(msg) => { setExamModal(null); loadTimeline(); if (onPhaseSaved) onPhaseSaved(msg); }}
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
            const today = new Date().toISOString().split('T')[0];
            if (examDate > today) {
                setError('Datum ispita ne može biti u budućnosti za status "Položeno" ili "Nije položio".');
                return;
            }
        }

        setSaving(true);
        setError('');
        try {
            await api.patch(`/api/phases/candidate/${candidateId}/exam`, {
                phaseType,
                status,
                examDate: examDate || null,
                notes: notes || null,
            });
            onSaved('Rezultat uspješno sačuvan!');
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="font-bold text-slate-800 mb-4">{label} — rezultat</h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Status</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                            <option value="ZAKAZANO">Zakazano</option>
                            <option value="POLOŽENO">Položeno</option>
                            <option value="NEPOLOŽENO">Nije položio</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Datum ispita</label>
                        <input
                            type="date"
                            value={examDate}
                            onChange={e => setExamDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Napomena</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Opcionalno..."
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                        Odustani
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium"
                    >
                        {saving ? 'Čuvanje...' : 'Sačuvaj'}
                    </button>
                </div>
            </div>
        </div>
    );
}
