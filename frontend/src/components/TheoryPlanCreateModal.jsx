import { useState } from 'react';
import { X, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { api } from '../api/client';
import { TOTAL_THEORY_LESSONS } from '../constants';

const DAYS = [
    { value: 'MONDAY',    label: 'Ponedjeljak' },
    { value: 'TUESDAY',   label: 'Utorak' },
    { value: 'WEDNESDAY', label: 'Srijeda' },
    { value: 'THURSDAY',  label: 'Četvrtak' },
    { value: 'FRIDAY',    label: 'Petak' },
    { value: 'SATURDAY',  label: 'Subota' },
];

export default function TheoryPlanCreateModal({ candidates, onClose, onCreated, preSelectedCandidateId, assignedCandidateIds = [], enrollmentEligibleIds = null }) {
    const [form, setForm] = useState({
        groupName: '',
        candidateIds: preSelectedCandidateId ? [preSelectedCandidateId] : [],
        startDate: '',
        day1OfWeek: 'TUESDAY',
        day2OfWeek: 'THURSDAY',
        startTime: '09:00',
        durationMinutes: 45,
        totalLessons: TOTAL_THEORY_LESSONS,
        lessonsPerSession: 3,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (field) => (e) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const toggleCandidate = (id) => {
        setForm(f => ({
            ...f,
            candidateIds: f.candidateIds.includes(id)
                ? f.candidateIds.filter(c => c !== id)
                : [...f.candidateIds, id],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.candidateIds.length === 0) {
            setError('Odaberite barem jednog kandidata.');
            return;
        }
        if (form.day1OfWeek === form.day2OfWeek) {
            setError('Dani u sedmici moraju biti razliciti.');
            return;
        }

        setSaving(true);
        try {
            await api.post('/api/theory-plans', {
                ...form,
                durationMinutes: Number(form.durationMinutes),
                totalLessons: Number(form.totalLessons),
                lessonsPerSession: Number(form.lessonsPerSession),
            });
            onCreated();
        } catch (e) {
            setError(e.response?.data?.message || 'Greska pri kreiranju plana.');
        } finally {
            setSaving(false);
        }
    };

    const numSessions = Math.ceil(Number(form.totalLessons) / Number(form.lessonsPerSession));
    const lastSessionLessons = Number(form.totalLessons) % Number(form.lessonsPerSession) || Number(form.lessonsPerSession);

    const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white";
    const labelCls = "block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">

                <div className="bg-gradient-to-r from-blue-800 to-blue-500 px-6 py-5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <BookOpen className="text-white" size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">Kreiraj plan teorijske nastave</h3>
                                <p className="text-blue-200 text-xs mt-0.5">Automatsko generisanje termina</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">

                    <div>
                        <label className={labelCls}>Naziv grupe</label>
                        <input
                            required
                            value={form.groupName}
                            onChange={set('groupName')}
                            placeholder="npr. Grupa A - Juni 2026"
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>
                            <Users size={12} className="inline mr-1" />
                            Kandidati
                        </label>
                        <div className="border border-slate-200 rounded-xl max-h-36 overflow-y-auto p-2 space-y-0.5 bg-slate-50">
                            {candidates.length === 0 && (
                                <p className="text-xs text-slate-400 p-2">Nema dostupnih kandidata.</p>
                            )}
                            {candidates.map(c => {
                                const name = c.user
                                    ? `${c.user.firstName} ${c.user.lastName}`
                                    : `Kandidat #${c.candidateId}`;
                                const checked = form.candidateIds.includes(c.candidateId);
                                const assigned = assignedCandidateIds.includes(c.candidateId);
                                const notEnrolled = enrollmentEligibleIds !== null &&
                                    !enrollmentEligibleIds.includes(c.candidateId);
                                const disabled = assigned || notEnrolled;
                                return (
                                    <label key={c.candidateId}
                                           className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer transition-colors'}`}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={() => !disabled && toggleCandidate(c.candidateId)}
                                            className="accent-blue-600 w-4 h-4"
                                        />
                                        <span className="text-sm text-slate-700">{name}</span>
                                        {assigned && (
                                            <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">već u grupi</span>
                                        )}
                                        {notEnrolled && !assigned && (
                                            <span className="ml-auto text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">bez upisnine</span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>
                                <Calendar size={12} className="inline mr-1" />
                                Datum pocetka
                            </label>
                            <input
                                required
                                type="date"
                                value={form.startDate}
                                onChange={set('startDate')}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>
                                <Clock size={12} className="inline mr-1" />
                                Vrijeme pocetka
                            </label>
                            <input
                                required
                                type="time"
                                value={form.startTime}
                                onChange={set('startTime')}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Dan 1</label>
                            <select value={form.day1OfWeek} onChange={set('day1OfWeek')}
                                    className={inputCls}>
                                {DAYS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Dan 2</label>
                            <select value={form.day2OfWeek} onChange={set('day2OfWeek')}
                                    className={inputCls}>
                                {DAYS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={labelCls}>Trajanje (min)</label>
                            <input
                                type="number" min={30} max={120}
                                value={form.durationMinutes}
                                onChange={set('durationMinutes')}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Ukupno casova</label>
                            <input
                                type="number" min={1} max={100}
                                value={form.totalLessons}
                                onChange={set('totalLessons')}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Casova po terminu</label>
                            <input
                                type="number" min={1} max={10}
                                value={form.lessonsPerSession}
                                onChange={set('lessonsPerSession')}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
                        Sistem ce automatski generisati <strong>{numSessions} termina</strong> —
                        prvih {numSessions - 1} termina po {form.lessonsPerSession} casa,
                        zadnji termin {lastSessionLessons} casova.
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                            <X size={14} className="shrink-0" /> {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                            Odustani
                        </button>
                        <button type="submit" disabled={saving}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                            {saving ? 'Generisem...' : 'Generiši plan'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
