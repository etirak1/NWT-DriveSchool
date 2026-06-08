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
    const { user, logout } = useAuth();
    const userId = user.userId;

    const [date, setDate]         = useState('');
    const [time, setTime]         = useState('');
    const [busySlots, setBusySlots] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);

    const instructorId = lesson?.instructor?.userId ?? lesson?.instructorId;

    // Fetch busy slots when date changes
    useEffect(() => {
        if (!date || !instructorId) return;
        const fetchBusy = async () => {
            try {
                const res = await api.get(
                    `/api/lessons/instructor/${instructorId}/availability?date=${date}`
                );
                // Exclude current lesson's slot so it doesn't block itself
                const currentSlot = lesson.dateTime
                    ? `${String(new Date(lesson.dateTime).getHours()).padStart(2, '0')}:${String(new Date(lesson.dateTime).getMinutes()).padStart(2, '0')}`
                    : null;
                const currentDate = lesson.dateTime
                    ? new Date(lesson.dateTime).toISOString().split('T')[0]
                    : null;

                const slots = res.data
                    .filter(l => {
                        const dt = new Date(l.dateTime);
                        const slotTime = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                        const slotDate = dt.toISOString().split('T')[0];
                        // Exclude current lesson from busy list
                        if (l.lessonId === lesson.lessonId) return false;
                        return true;
                    })
                    .map(l => {
                        const dt = new Date(l.dateTime);
                        return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                    });
                setBusySlots(slots);
            } catch (e) {
                setBusySlots([]);
            }
        };
        fetchBusy();
    }, [date]);

    const handleSubmit = async () => {
        if (!date || !time) {
            setError('Please select a date and time.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const dateTime = `${date}T${time}:00`;
            await api.patch(`/api/lessons/${lesson.lessonId}/reschedule`, {
                dateTime,
                userId: String(userId),
            });
            setSuccess(true);
            setTimeout(() => {
                onRescheduled();
                onClose();
            }, 1500);
        } catch (err) {
            const body = err?.response?.data;
            setError(body?.message || 'Failed to reschedule. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Min date = tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 10);

    const currentDateTime = lesson?.dateTime
        ? new Date(lesson.dateTime).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : '—';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 w-9 h-9 rounded-lg flex items-center justify-center">
                            <Calendar className="text-white" size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Reschedule lesson</h3>
                            <p className="text-xs text-slate-500">
                                Current: <span className="font-medium">{currentDateTime}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X size={22} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {success ? (
                        <div className="flex flex-col items-center py-8 gap-3">
                            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle size={28} className="text-green-500" />
                            </div>
                            <p className="font-semibold text-slate-800">Lesson rescheduled!</p>
                            <p className="text-sm text-slate-500">Closing...</p>
                        </div>
                    ) : (
                        <>
                            {/* Date picker */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    <Calendar className="inline mr-1.5" size={14} /> New date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    min={minDate}
                                    onChange={e => { setDate(e.target.value); setTime(''); }}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                />
                            </div>

                            {/* Time slots */}
                            {date && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        <Clock className="inline mr-1.5" size={14} /> Available time slots
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {TIME_SLOTS.map(slot => {
                                            const isBusy     = busySlots.includes(slot);
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
                                    {busySlots.length > 0 && (
                                        <p className="text-xs text-slate-400 mt-2">Crossed-out slots are already taken.</p>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !date || !time}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition"
                                >
                                    {submitting ? 'Saving...' : 'Confirm reschedule'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
