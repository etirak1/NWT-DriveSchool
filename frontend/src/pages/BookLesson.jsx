import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import { SCHEDULE_TIMEOUT_MS } from '../constants';
import { Calendar, Clock, Car, ArrowLeft, CheckCircle, User } from 'lucide-react';

export default function BookLesson() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const userId = user.userId;


    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busySlots, setBusySlots] = useState([]);

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [eligibility, setEligibility] = useState(null);

    const TIME_SLOTS = [];
    for (let h = 8; h <= 16; h++) {
        TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 16) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
    }

    useEffect(() => {
        const loadCandidate = async () => {
            try {
                const res = await api.get(`/api/candidates/by-user/${userId}`);
                setCandidate(res.data);

                try {
                    const elig = await api.get(`/api/lessons/eligibility`);
                    setEligibility(elig.data);
                } catch (e) {
                    console.error('Greška pri provjeri eligibility-ja:', e);
                }
            } catch (err) {
                console.error(err);
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        loadCandidate();
    }, [userId]);

    const getInstructor = () =>
        candidate?.assignedInstructor ?? candidate?.candidate?.assignedInstructor;

    useEffect(() => {
        const instructor = getInstructor();
        if (!date || !instructor?.instructorId) return;

        const fetchBusy = async () => {
            try {
                const res = await api.get(
                    `/api/lessons/instructor/${instructor.instructorId}/availability?date=${date}`
                );
                const slots = res.data.map(lesson => {
                    const dt = new Date(lesson.dateTime);
                    return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                });
                setBusySlots(slots);
            } catch (err) {
                console.error('Greška pri dohvatu rasporeda:', err);
                setBusySlots([]);
            }
        };
        fetchBusy();
    }, [date, candidate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!date || !time) {
            setError('Molimo odaberite datum i vrijeme.');
            return;
        }

        const instructor = getInstructor();
        if (!instructor) {
            setError('Nemate dodijeljenog instruktora.');
            return;
        }

        setSubmitting(true);
        try {
            const dateTime = `${date}T${time}:00`;
            const payload = {
                candidate: { userId: userId },
                dateTime,
                duration: 45,
                status: 'ZAKAZANO',
                lessonType: 'VOŽNJA',
            };
            await api.post('/api/lessons', payload);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), SCHEDULE_TIMEOUT_MS);
        } catch (err) {
            const body = err?.response?.data;
            let msg = 'Greška pri zakazivanju časa.';
            if (typeof body === 'string') msg = body;
            else if (body?.message) msg = body.message;
            else if (body && typeof body === 'object') msg = Object.values(body).join(' ');
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 text-sm">Učitavanje...</p>
            </div>
        );
    }

    const instructor = getInstructor();

    if (!instructor) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-xl mx-auto">
                    <button onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft size={16} /> Nazad na početnu
                    </button>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h2 className="font-bold text-amber-800 mb-2">Nema dodijeljenog instruktora</h2>
                        <p className="text-sm text-amber-700">
                            Još uvijek nemate dodijeljenog instruktora. Kontaktirajte administraciju auto-škole.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    
    if (eligibility && !eligibility.theoryPassed) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-xl mx-auto">
                    <button onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft size={16} /> Nazad na početnu
                    </button>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h2 className="font-bold text-amber-800 mb-2">Teorijski dio nije položen</h2>
                        <p className="text-sm text-amber-700">
                            Časove vožnje možete zakazati tek nakon što položite teorijski dio obuke.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

   
    if (eligibility && eligibility.lessonsThisWeek >= eligibility.weeklyLimit) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-xl mx-auto">
                    <button onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft size={16} /> Nazad na početnu
                    </button>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h2 className="font-bold text-amber-800 mb-2">Sedmični limit dostignut</h2>
                        <p className="text-sm text-amber-700">
                            Već imate zakazano {eligibility.lessonsThisWeek} od {eligibility.weeklyLimit} dozvoljenih
                            časova vožnje ove sedmice. Pokušajte ponovo iduće sedmice.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const instructorName = instructor.user
        ? `${instructor.user.firstName} ${instructor.user.lastName}`
        : 'Vaš instruktor';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 10);

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                    <ArrowLeft size={16} /> Nazad na početnu
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Zakaži čas vožnje</h1>
                    <p className="text-sm text-slate-500 mb-2 flex items-center gap-1.5">
                        <User size={14} />
                        Instruktor: <span className="font-semibold text-slate-900">{instructorName}</span>
                    </p>

                    {eligibility && (
                        <div className="text-xs text-slate-500 mb-6">
                            Iskorišteno {eligibility.lessonsThisWeek}/{eligibility.weeklyLimit} časova vožnje ove sedmice
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-10">
                            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-3">
                                <CheckCircle className="text-emerald-600" size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Čas uspješno zakazan!</h3>
                            <p className="text-sm text-slate-500 mt-1">Vraćam vas na početnu...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                    <Calendar className="inline mr-1.5" size={14} /> Datum
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    min={minDate}
                                    onChange={(e) => { setDate(e.target.value); setTime(''); }}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {date && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                        <Clock className="inline mr-1.5" size={14} /> Vrijeme
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
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
                                    {busySlots.length > 0 && (
                                        <p className="text-xs text-slate-400 mt-2">
                                            Precrtani slotovi su već zauzeti.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Vozilo instruktora — auto-dodijeljeno */}
                            {instructor.assignedVehicleId ? (
                                <div className="bg-slate-50 rounded-lg px-4 py-3 flex items-center gap-3">
                                    <Car size={18} className="text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {instructor.vehicleBrand} {instructor.vehicleModel}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {instructor.vehicleRegistrationNumber} · {instructor.vehicleStatus}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                                    Instruktor nema dodijeljeno vozilo — kontaktirajte administraciju.
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !date || !time}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                            >
                                {submitting ? 'Zakazujem...' : 'Zakaži čas'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}