import { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS = [];
for (let h = 8; h <= 16; h++) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 16) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function RescheduleModal({ lesson, onClose, onRescheduled }) {
    const { user } = useAuth();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [busySlots, setBusySlots] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const instructorId = lesson?.instructor?.userId ?? lesson?.instructorId;

    useEffect(() => {
        if (!date || !instructorId) return;

        const fetchBusy = async () => {
            try {
                const res = await api.get(
                    `/api/lessons/instructor/${instructorId}/availability?date=${date}`
                );

                const slots = res.data
                    .filter(l => l.lessonId !== lesson.lessonId)
                    .map(l => {
                        const dt = new Date(l.dateTime);
                        return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                    });

                setBusySlots(slots);
            } catch {
                setBusySlots([]);
            }
        };

        fetchBusy();
    }, [date]);

    const handleSubmit = async () => {
        if (!date || !time) {
            setError('Molimo odaberite datum i termin.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.patch(`/api/lessons/${lesson.lessonId}/reschedule`, {
                dateTime: `${date}T${time}:00`,
            });

            setSuccess(true);
            setTimeout(() => {
                onRescheduled();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err?.response?.data?.message || 'Greška pri promjeni termina.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between p-6 border-b">
                    <h3>Promjena termina</h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-10">
                            <CheckCircle className="text-green-500 mx-auto" />
                            <p>Termin uspješno promijenjen</p>
                        </div>
                    ) : (
                        <>
                            <input
                                type="date"
                                value={date}
                                min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                                onChange={e => { setDate(e.target.value); setTime(''); }}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            />

                            {date && (
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {TIME_SLOTS.map(slot => {
                                        const isBusy = busySlots.includes(slot);
                                        const isSelected = time === slot;
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                disabled={isBusy}
                                                onClick={() => setTime(slot)}
                                                className={
                                                    'py-2 px-3 rounded-lg text-sm font-medium border transition ' +
                                                    (isBusy
                                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                                        : isSelected
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400')
                                                }
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {error && (
                                <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !date || !time}
                                className="mt-5 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                            >
                                {submitting ? 'Čuvanje...' : 'Potvrdi'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}