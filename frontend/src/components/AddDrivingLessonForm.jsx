import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TOTAL_DRIVING_LESSONS } from '../constants';

export default function AddDrivingLessonForm({ candidateId, existingNumbers, onAdd }) {
    const available = Array.from({ length: TOTAL_DRIVING_LESSONS }, (_, i) => i + 1).filter(n => !existingNumbers.includes(n));
    const [lessonNumber, setLessonNumber] = useState(available[0] ?? 1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (available.length > 0 && !available.includes(lessonNumber)) setLessonNumber(available[0]);
    }, [existingNumbers.length]);

    return (
        <div className="flex items-center gap-2 flex-wrap bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            <select
                value={lessonNumber}
                onChange={e => setLessonNumber(Number(e.target.value))}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                {available.map(n => <option key={n} value={n}>Čas {n}</option>)}
            </select>
            <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <input
                type="text"
                placeholder="Bilješka (opcionalno)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex-1 min-w-28"
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
