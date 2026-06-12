import React, { useState, useEffect } from 'react';

const empty = { vehicleId: '', repairDate: '', description: '', cost: '', status: 'PLANNED' };
const STATUSES = ['PLANNED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS = { PLANNED: 'Planirano', PENDING: 'Na čekanju', IN_PROGRESS: 'U toku', COMPLETED: 'Završeno' };

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors';

export default function RepairForm({ initial, vehicles, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initial) {
            setForm({
                vehicleId: initial.vehicle?.vehicleId || '',
                repairDate: initial.repairDate?.slice(0, 10) || '',
                description: initial.description || '',
                cost: initial.cost || '',
                status: initial.status || 'PLANNED',
            });
        } else {
            setForm(empty);
        }
    }, [initial]);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            vehicle: { vehicleId: Number(form.vehicleId) },
            repairDate: form.repairDate ? `${form.repairDate}T00:00:00` : null,
            description: form.description,
            cost: form.cost ? Number(form.cost) : null,
            status: form.status,
        });
    };

    return (
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Vozilo <span className="text-red-500">*</span>
                </label>
                <select
                    required
                    className={inputCls}
                    value={form.vehicleId}
                    onChange={set('vehicleId')}
                    onInvalid={(e) => e.target.setCustomValidity('Odaberite vozilo')}
                    onInput={(e) => e.target.setCustomValidity('')}
                >
                    <option value="">-- Odaberi vozilo --</option>
                    {vehicles?.map(v => (
                        <option key={v.vehicleId} value={v.vehicleId}>
                            {v.brand} {v.model} ({v.registrationNumber})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                        Datum popravke <span className="text-red-500">*</span>
                    </label>
                    <input
                        required
                        type="date"
                        className={inputCls}
                        value={form.repairDate}
                        onChange={set('repairDate')}
                        onInvalid={(e) => e.target.setCustomValidity('Odaberite datum popravke')}
                        onInput={(e) => e.target.setCustomValidity('')}
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Status</label>
                    <select className={inputCls} value={form.status} onChange={set('status')}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Opis problema <span className="text-red-500">*</span>
                </label>
                <textarea
                    required
                    rows={3}
                    className={`${inputCls} resize-none`}
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Opišite problem ili vrstu popravke..."
                    onInvalid={(e) => e.target.setCustomValidity('Unesite opis problema')}
                    onInput={(e) => e.target.setCustomValidity('')}
                />
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Cijena (KM) <span className="text-red-500">*</span>
                </label>
                <input
                    required
                    type="number"
                    step="0.01"
                    min="5"
                    className={inputCls}
                    value={form.cost}
                    onChange={set('cost')}
                    placeholder="0.00"
                    onInvalid={(e) => {
                        if (e.target.validity.valueMissing) e.target.setCustomValidity('Unesite cijenu');
                        else if (e.target.validity.rangeUnderflow) e.target.setCustomValidity('Cijena mora biti najmanje 5 KM');
                    }}
                    onInput={(e) => e.target.setCustomValidity('')}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition-colors">
                    Odustani
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200">
                    {loading ? 'Čuvanje...' : 'Sačuvaj popravku'}
                </button>
            </div>
        </form>
    );
}
