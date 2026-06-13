import { useState } from 'react';
import { X, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { api } from '../api/client';
import { TOTAL_THEORY_LESSONS } from '../constants';

const DAYS = [
    { value: 'MONDAY',    label: 'Ponedjeljak' },
    { value: 'TUESDAY',   label: 'Utorak' },
    { value: 'WEDNESDAY', label: 'Srijeda' },
    { value: 'THURSDAY',  label: 'Cetvrtak' },
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

                <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 w-9 h-9 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-white" size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Kreiraj plan teorijske nastave</h3>
                            <p className="text-xs text-slate-500">Automatsko generisanje termina</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Naziv grupe
                        </label>
                        <input
                            required
                            value={form.groupName}
                            onChange={set('groupName')}
                            placeholder="npr. Grupa A - Juni 2026"
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            <Users size={14} className="inline mr-1" />
                            Kandidati
                        </label>
                        <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto p-2 space-y-1">
                            {candidates.length === 0 && (
                                <p className="text-xs text-slate-400 p-2">Nema dostupnih kandidata.</p>
                            )}
                            {candidates.map(c => {
                                const name = c.user
                                    ? `${c.user.firstName} ${c.user.lastName}`
                                    : `Kandidat #${c.candidateId}`;
                                const checked = form.candidateIds.includes(c.candidateId);
                                const assigned = assignedCandidateIds.includes(c.candidateId);
                                // enrollmentEligibleIds=null znaci da info nije ucitan (ne blokiramo)
                                const notEnrolled = enrollmentEligibleIds !== null &&
                                    !enrollmentEligibleIds.includes(c.candidateId);
                                const disabled = assigned || notEnrolled;
                                return (
                                    <label key={c.candidateId}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={() => !disabled && toggleCandidate(c.candidateId)}
                                            className="accent-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700">{name}</span>
                                        {assigned && (
                                            <span className="ml-auto text-xs text-amber-600 font-medium">već u grupi</span>
                                        )}
                                        {notEnrolled && !assigned && (
                                            <span className="ml-auto text-xs text-red-500 font-medium">bez upisnine</span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                <Calendar size={14} className="inline mr-1" />
                                Datum pocetka
                            </label>
                            <input
                                required
                                type="date"
                                value={form.startDate}
                                onChange={set('startDate')}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                <Clock size={14} className="inline mr-1" />
                                Vrijeme pocetka
                            </label>
                            <input
                                required
                                type="time"
                                value={form.startTime}
                                onChange={set('startTime')}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Dan 1</label>
                            <select value={form.day1OfWeek} onChange={set('day1OfWeek')}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                {DAYS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Dan 2</label>
                            <select value={form.day2OfWeek} onChange={set('day2OfWeek')}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                {DAYS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Trajanje (min)
                            </label>
                            <input
                                type="number" min={30} max={120}
                                value={form.durationMinutes}
                                onChange={set('durationMinutes')}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Ukupno casova
                            </label>
                            <input
                                type="number" min={1} max={100}
                                value={form.totalLessons}
                                onChange={set('totalLessons')}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Casova po terminu
                            </label>
                            <input
                                type="number" min={1} max={10}
                                value={form.lessonsPerSession}
                                onChange={set('lessonsPerSession')}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-xs text-indigo-700">
                        Sistem ce automatski generisati <strong>{numSessions} termina</strong> —
                        prvih {numSessions - 1} termina po {form.lessonsPerSession} casa,
                        zadnji termin {lastSessionLessons} casova.
                    </div>

                    {error && (
                        <div className="form-alert-error">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Odustani
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold">
                            {saving ? 'Generisem...' : 'Generiši plan'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
