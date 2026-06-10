import { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle, GraduationCap, Lock, Hash } from 'lucide-react';
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

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
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${allDone ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    {/* Bulk unos */}
                    {!allDone && (
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    <div className="relative flex-1 max-w-[180px]">
                                        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={completedCount + 1}
                                            max={TOTAL}
                                            value={bulkValue}
                                            onChange={e => { setBulkValue(e.target.value); setBulkError(''); }}
                                            placeholder={`${completedCount + 1}–${TOTAL}`}
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleBulk}
                                        disabled={bulkSaving || !bulkValue}
                                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium whitespace-nowrap"
                                    >
                                        {bulkSaving ? 'Čuvanje...' : 'Označi do lekcije'}
                                    </button>
                                </div>
                                {bulkError && (
                                    <p className="text-xs text-red-600 mt-1">{bulkError}</p>
                                )}
                                <p className="text-xs text-slate-400 mt-1">
                                    Unesite redni broj lekcije do kojeg su odrađeni svi časovi (redom od {completedCount + 1}).
                                </p>
                            </div>
                        </div>
                    )}

                    {allDone && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg border border-green-200">
                            <GraduationCap size={18} />
                            <span className="text-sm font-semibold">
                                Teorijska obuka završena! Faza je automatski postavljena na POLOŽENO.
                            </span>
                        </div>
                    )}

                    {error && lessons.length === 0 && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Lista lekcija */}
                <div className="overflow-y-auto p-5 space-y-1.5">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 text-sm">Učitavanje...</div>
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
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl border
                                        transition-all duration-150 text-left
                                        ${lesson.completed
                                            ? 'border-green-200 bg-green-50 hover:bg-green-100'
                                            : interactive
                                                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                                : 'border-slate-100 bg-slate-50 opacity-50'
                                        }
                                        ${isSaving ? 'opacity-50 cursor-wait' : locked ? 'cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {/* Broj */}
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                        ${lesson.completed ? 'bg-green-500 text-white' : interactive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}
                                    `}>
                                        {lesson.completed
                                            ? <CheckCircle size={16} />
                                            : locked
                                                ? <Lock size={12} />
                                                : lesson.lessonNumber
                                        }
                                    </span>

                                    {/* Naslov */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate
                                            ${lesson.completed ? 'text-green-800' : interactive ? 'text-blue-800' : 'text-slate-400'}
                                        `}>
                                            {lesson.lessonNumber}. {title}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {lesson.completed
                                                ? `Odrađeno${lesson.completedDate ? ` — ${lesson.completedDate}` : ''}`
                                                : interactive ? 'Sljedeći čas' : 'Čeka prethodne'
                                            }
                                        </p>
                                    </div>

                                    {isSaving && (
                                        <span className="text-xs text-slate-400 shrink-0">Čuvanje...</span>
                                    )}
                                </button>
                            );
                        })
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
