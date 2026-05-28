import { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle, GraduationCap, Lock } from 'lucide-react';
import { api } from '../api/client';

const TOTAL = 40;

export default function TheoryLessonsModal({ candidate, onClose }) {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [error, setError] = useState('');

    const candidateId = candidate?.candidateId;
    const candidateName = candidate?.user
        ? `${candidate.user.firstName} ${candidate.user.lastName}`
        : `Kandidat #${candidateId}`;

    useEffect(() => {
        loadLessons();
    }, [candidateId]);

    const loadLessons = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/api/theory-lessons/candidate/${candidateId}`);
            setLessons(res.data);
        } catch (e) {
            setError('Greška pri učitavanju lekcija.');
        } finally {
            setLoading(false);
        }
    };

    const toggleLesson = async (lessonNumber, currentCompleted) => {
        setSaving(lessonNumber);
        try {
            const res = await api.patch(
                `/api/theory-lessons/candidate/${candidateId}/lesson/${lessonNumber}`,
                { completed: !currentCompleted }
            );
            setLessons(prev =>
                prev.map(l => l.lessonNumber === lessonNumber ? res.data : l)
            );
        } catch (e) {
            setError('Greška pri ažuriranju lekcije.');
        } finally {
            setSaving(null);
        }
    };

    const completedCount = lessons.filter(l => l.completed).length;
    const allDone = completedCount === TOTAL;
    const progressPct = Math.round((completedCount / TOTAL) * 100);

    // Lesson is interactive only if it's the next one to complete (completedCount + 1)
    // or the last completed one (completedCount) — enforces strict 1→40 order
    const isInteractive = (lesson) =>
        lesson.lessonNumber === completedCount + 1 ||
        lesson.lessonNumber === completedCount;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 w-9 h-9 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-white" size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Teorijska obuka</h3>
                            <p className="text-xs text-slate-500">{candidateName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X size={22} />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">
                            Napredak: {completedCount}/{TOTAL} lekcija
                        </span>
                        <span className={`text-sm font-bold ${allDone ? 'text-green-600' : 'text-blue-600'}`}>
                            {progressPct}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${allDone ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    {allDone && (
                        <div className="mt-3 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg border border-green-200">
                            <GraduationCap size={18} />
                            <span className="text-sm font-semibold">
                                Teorijska obuka završena! Faza je automatski postavljena na POLOŽENO.
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Grid lekcija */}
                <div className="overflow-y-auto p-5">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 text-sm">Učitavanje...</div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2">
                            {lessons.map(lesson => {
                                const isSaving = saving === lesson.lessonNumber;
                                const interactive = isInteractive(lesson);
                                const locked = !lesson.completed && !interactive;
                                return (
                                    <button
                                        key={lesson.lessonNumber}
                                        onClick={() => !isSaving && interactive && toggleLesson(lesson.lessonNumber, lesson.completed)}
                                        disabled={isSaving || locked}
                                        title={locked ? `Završi lekciju ${lesson.lessonNumber - 1} prvo` : ''}
                                        className={`
                                            relative flex flex-col items-center justify-center
                                            rounded-xl border-2 p-3 transition-all duration-150
                                            ${lesson.completed
                                                ? 'border-green-400 bg-green-50 hover:bg-green-100'
                                                : interactive
                                                    ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
                                                    : 'border-slate-100 bg-slate-50 opacity-50'
                                            }
                                            ${isSaving ? 'opacity-50 cursor-wait' : locked ? 'cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        {lesson.completed && (
                                            <CheckCircle size={14} className="text-green-500 absolute top-1.5 right-1.5" />
                                        )}
                                        {locked && (
                                            <Lock size={10} className="text-slate-300 absolute top-1.5 right-1.5" />
                                        )}
                                        <span className={`text-base font-bold ${lesson.completed ? 'text-green-700' : interactive ? 'text-blue-600' : 'text-slate-300'}`}>
                                            {lesson.lessonNumber}
                                        </span>
                                        <span className="text-xs mt-0.5 text-slate-400">
                                            {lesson.completed ? 'Odrađeno' : interactive ? 'Sljedeći' : 'Čeka'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm"
                    >
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}