import { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle, GraduationCap, Lock, Hash, Award } from 'lucide-react';
import { api } from '../api/client';
import { getErrorMessage } from '../utils/helpers';
import { TOTAL_THEORY_LESSONS as TOTAL } from '../constants';

const LESSON_TITLES = [
    'Uvod u saobraćajne propise',
    'Znakovi opasnosti',
    'Znakovi izričitih naredbi',
    'Znakovi obavještenja',
    'Signalizacija na putu',
    'Upravljanje vozilom — osnovne komande',
    'Pokretanje i zaustavljanje vozila',
    'Brzine i sigurna rastojanja',
    'Pretjecanje i obilaženje',
    'Parkiranje i zaustavljanje',
    'Prioritet prolaska',
    'Neregulirane raskrsnice',
    'Raskrsnice regulisane semaforom',
    'Raskrsnice regulisane prometnim redarom',
    'Kružni tok',
    'Pješaci u saobraćaju',
    'Biciklisti i motociklisti',
    'Vozila javnog prijevoza',
    'Vožnja noću',
    'Vožnja u lošim vremenskim uslovima',
    'Autoput i brza cesta',
    'Teretni transport i posebni tereti',
    'Vozila s pravom prednosti prolaska',
    'Tehnički pregled i registracija',
    'Dijelovi vozila i njihova funkcija',
    'Sigurnosni pojasevi',
    'Airbag i sigurnosni sistemi',
    'Ekološka i ekonomična vožnja',
    'Prva pomoć — osnove',
    'Prva pomoć — postupak na mjestu nesreće',
    'Alkohol i droge u saobraćaju',
    'Umor i uticaj na vožnju',
    'Osiguranje motornih vozila',
    'Kaznene odredbe saobraćajnog zakona',
    'Prava i odgovornosti vozača',
    'Vožnja u tunelima i na mostovima',
    'Vuča vozila i prikolica',
    'Vanredne situacije i kvarovi',
    'Psihologija u saobraćaju',
    'Ponavljanje i priprema za ispit',
];

export default function TheoryLessonsModal({ candidate, onClose, onProgressUpdate }) {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [bulkSaving, setBulkSaving] = useState(false);
    const [bulkValue, setBulkValue] = useState('');
    const [bulkError, setBulkError] = useState('');
    const [error, setError] = useState('');

    const candidateId = candidate?.candidateId;
    const candidateName = candidate?.user
        ? `${candidate.user.firstName} ${candidate.user.lastName}`
        : `Kandidat #${candidateId}`;

    useEffect(() => { loadLessons(); }, [candidateId]);

    const loadLessons = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/api/theory-lessons/candidate/${candidateId}`);
            setLessons(res.data);
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const completedCount = lessons.filter(l => l.completed).length;
    const allDone = completedCount === TOTAL;
    const progressPct = Math.round((completedCount / TOTAL) * 100);

    useEffect(() => {
        if (onProgressUpdate && lessons.length > 0) {
            onProgressUpdate(candidateId, progressPct);
        }
    }, [completedCount]);

    const isInteractive = (lesson) =>
        lesson.lessonNumber === completedCount + 1 ||
        lesson.lessonNumber === completedCount;

    const toggleLesson = async (lessonNumber, currentCompleted) => {
        setSaving(lessonNumber);
        try {
            const res = await api.patch(
                `/api/theory-lessons/candidate/${candidateId}/lesson/${lessonNumber}`,
                { completed: !currentCompleted }
            );
            setLessons(prev => prev.map(l => l.lessonNumber === lessonNumber ? res.data : l));
        } catch (e) {
            setError('Greška pri ažuriranju lekcije.');
        } finally {
            setSaving(null);
        }
    };

    const handleBulk = async () => {
        const target = parseInt(bulkValue, 10);
        setBulkError('');

        if (isNaN(target) || target < 1 || target > TOTAL) {
            setBulkError(`Unesite broj između 1 i ${TOTAL}.`);
            return;
        }
        if (target <= completedCount) {
            setBulkError(`Kandidat već ima ${completedCount} odrađenih lekcija. Unesite broj veći od ${completedCount}.`);
            return;
        }

        setBulkSaving(true);
        try {
            const res = await api.patch(
                `/api/theory-lessons/candidate/${candidateId}/bulk`,
                { count: target }
            );
            setLessons(res.data);
            setBulkValue('');
        } catch (e) {
            setBulkError(e.response?.data?.message || e.message || 'Greška pri bulk ažuriranju.');
        } finally {
            setBulkSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <BookOpen size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base leading-none">Teorijska obuka</h3>
                            <p className="text-blue-200 text-xs mt-0.5">{candidateName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Progress section */}
                <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">
                            Napredak: <span className={allDone ? 'text-green-600' : 'text-blue-600'}>{completedCount}/{TOTAL} lekcija</span>
                        </span>
                        <span className={`text-sm font-bold ${allDone ? 'text-green-600' : 'text-blue-600'}`}>
                            {progressPct}%
                        </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    {!allDone && (
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    <div className="relative flex-1 max-w-[200px]">
                                        <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={completedCount + 1}
                                            max={TOTAL}
                                            value={bulkValue}
                                            onChange={e => { setBulkValue(e.target.value); setBulkError(''); }}
                                            placeholder={`${completedCount + 1}–${TOTAL}`}
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={handleBulk}
                                        disabled={bulkSaving || !bulkValue}
                                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold whitespace-nowrap transition-colors shadow-sm shadow-blue-200"
                                    >
                                        {bulkSaving ? 'Čuvanje...' : 'Označi do lekcije'}
                                    </button>
                                </div>
                                {bulkError && (
                                    <p className="text-xs text-red-600 mt-1.5">{bulkError}</p>
                                )}
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Unesite redni broj lekcije do kojeg su odrađeni svi časovi (redom od {completedCount + 1}).
                                </p>
                            </div>
                        </div>
                    )}

                    {allDone && (
                        <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                <Award size={16} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Teorijska obuka završena!</p>
                                <p className="text-xs text-green-600 mt-0.5">Faza je automatski postavljena na POLOŽENO.</p>
                            </div>
                        </div>
                    )}

                    {error && lessons.length === 0 && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Lesson list */}
                <div className="overflow-y-auto px-6 py-4 space-y-2">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-slate-400 animate-pulse">Učitavanje lekcija...</p>
                        </div>
                    ) : (
                        lessons.map(lesson => {
                            const isSaving = saving === lesson.lessonNumber;
                            const interactive = isInteractive(lesson);
                            const locked = !lesson.completed && !interactive;
                            const title = LESSON_TITLES[lesson.lessonNumber - 1] || `Lekcija ${lesson.lessonNumber}`;

                            return (
                                <button
                                    key={lesson.lessonNumber}
                                    onClick={() => !isSaving && interactive && toggleLesson(lesson.lessonNumber, lesson.completed)}
                                    disabled={isSaving || locked}
                                    title={locked ? `Završi lekciju ${lesson.lessonNumber - 1} prvo` : ''}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left
                                        transition-all duration-150
                                        ${lesson.completed
                                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                                        : interactive
                                            ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                            : 'border-slate-100 bg-slate-50/50 opacity-50'
                                    }
                                        ${isSaving ? 'opacity-50 cursor-wait' : locked ? 'cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                                        ${lesson.completed
                                        ? 'bg-green-500 text-white'
                                        : interactive
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-200 text-slate-400'
                                    }
                                    `}>
                                        {lesson.completed
                                            ? <CheckCircle size={15} />
                                            : locked
                                                ? <Lock size={12} />
                                                : lesson.lessonNumber
                                        }
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate
                                            ${lesson.completed ? 'text-green-800' : interactive ? 'text-blue-800' : 'text-slate-400'}
                                        `}>
                                            {lesson.lessonNumber}. {title}
                                        </p>
                                        <p className={`text-xs mt-0.5
                                            ${lesson.completed ? 'text-green-600' : interactive ? 'text-blue-500' : 'text-slate-400'}
                                        `}>
                                            {lesson.completed
                                                ? `Odrađeno${lesson.completedDate ? ` — ${lesson.completedDate}` : ''}`
                                                : interactive ? 'Sljedeći čas' : 'Čeka prethodne'
                                            }
                                        </p>
                                    </div>

                                    {isSaving && (
                                        <span className="text-xs text-slate-400 shrink-0 animate-pulse">Čuvanje...</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                        {completedCount} od {TOTAL} lekcija završeno
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm transition-colors"
                    >
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}
