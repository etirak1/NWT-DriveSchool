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
                                onChange={e => { setDate(e.target.value); setTime(''); }}
                            />

                            {date && (
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {TIME_SLOTS.map(slot => {
                                        const isBusy = busySlots.includes(slot);
                                        const isSelected = time === slot;

                                        return (
                                            <button
                                                key={slot}
                                                disabled={isBusy}
                                                onClick={() => setTime(slot)}
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {error && <p>{error}</p>}

                            <button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Čuvanje...' : 'Potvrdi'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}