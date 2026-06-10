import { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../api/client';
import { getErrorMessage } from '../utils/helpers';
import { TOTAL_THEORY_LESSONS } from '../constants';

export default function TheoryAttendanceModal({ candidate, onClose }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const candidateId = candidate?.candidateId;
    const candidateName = candidate?.user
        ? `${candidate.user.firstName} ${candidate.user.lastName}`
        : `Kandidat #${candidateId}`;

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/api/theory-plans/candidate/${candidateId}/session-attendance`);
                setSessions(res.data);
            } catch (e) {
                setError(getErrorMessage(e));
            } finally {
                setLoading(false);
            }
        };
        if (candidateId) load();
    }, [candidateId]);

    const attended = sessions.filter(s => s.present);
    const attendedLessons = attended.reduce((sum, s) => sum + (s.lessonTo - s.lessonFrom + 1), 0);
    const totalHeld = sessions.reduce((sum, s) => sum + (s.lessonTo - s.lessonFrom + 1), 0);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="font-bold text-slate-800">Teorijska nastava — evidencija prisustva</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{candidateName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress summary */}
                {!loading && !error && (
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-6 text-sm">
                        <span className="text-slate-600">
                            Odrađenih termina: <strong>{sessions.length}</strong>
                        </span>
                        <span className="text-slate-600">
                            Prisustvo: <strong className="text-green-700">{attended.length}/{sessions.length}</strong>
                        </span>
                        <span className="text-slate-600">
                            Lekcije: <strong className="text-indigo-700">{attendedLessons}/{TOTAL_THEORY_LESSONS}</strong>
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading && <p className="text-center text-slate-400 py-8">Učitavanje...</p>}
                    {error && <p className="text-center text-red-500 py-8">{error}</p>}
                    {!loading && !error && sessions.length === 0 && (
                        <p className="text-center text-slate-400 py-8 text-sm">
                            Još nisu održani termini.
                        </p>
                    )}
                    {!loading && !error && sessions.length > 0 && (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                                    <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Datum</th>
                                    <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lekcije</th>
                                    <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tema</th>
                                    <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prisustvo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((s, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="py-2.5 pr-3 text-slate-500">{s.sessionNumber}</td>
                                        <td className="py-2.5 pr-3 text-slate-700 whitespace-nowrap">{s.date}</td>
                                        <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">
                                            {s.lessonFrom}–{s.lessonTo}
                                        </td>
                                        <td className="py-2.5 pr-3 text-slate-600 text-xs">{s.topic}</td>
                                        <td className="py-2.5">
                                            {s.present ? (
                                                <span className="flex items-center gap-1 text-green-600 font-medium text-xs">
                                                    <CheckCircle2 size={14} /> Prisutan
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-500 text-xs">
                                                    <XCircle size={14} /> Odsutan
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}
