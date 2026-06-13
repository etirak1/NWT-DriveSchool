import { useState, useEffect } from 'react';
import { Plus, Hash, CalendarDays, FileText } from 'lucide-react';
import { TOTAL_DRIVING_LESSONS } from '../constants';

export default function AddDrivingLessonForm({ candidateId, existingNumbers, onAdd }) {

    const available = Array.from(
        { length: TOTAL_DRIVING_LESSONS },
        (_, i) => i + 1
    ).filter(n => !existingNumbers.includes(n));

    const [lessonNumber, setLessonNumber] = useState(available[0] ?? 1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (available.length > 0 && !available.includes(lessonNumber)) {
            setLessonNumber(available[0]);
        }
    }, [existingNumbers.length]);

    return (
        <div className="bg-blue-50/60 rounded-xl border border-blue-100 p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
                Dodaj novi čas
            </p>

            <div className="flex flex-wrap gap-3 items-end">

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Hash size={11} /> Broj časa
                    </label>

                    <select
                        value={lessonNumber}
                        onChange={(e) => setLessonNumber(Number(e.target.value))}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white text-slate-800 font-medium shadow-sm"
                    >
                        {available.map(n => (
                            <option key={n} value={n}>Čas {n}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <CalendarDays size={11} /> Datum
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white text-slate-800 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-36">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <FileText size={11} /> Bilješka
                    </label>

                    <input
                        type="text"
                        placeholder="Opcionalno..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white text-slate-800 shadow-sm"
                    />
                </div>

                <button
                    onClick={() => {
                        onAdd(candidateId, lessonNumber, date, notes);
                        setNotes('');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                    <Plus size={15} /> Dodaj čas
                </button>

            </div>
        </div>
    );
}