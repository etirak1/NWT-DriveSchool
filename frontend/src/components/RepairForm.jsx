import React, { useState, useEffect } from 'react';

const empty = { vehicleId: '', repairDate: '', description: '', cost: '', status: 'PLANNED' };
const STATUSES = ['PLANNED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS = { PLANNED: 'Planirano', PENDING: 'Na čekanju', IN_PROGRESS: 'U toku', COMPLETED: 'Završeno' };

const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors ${
        err ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`;

const validate = (form) => {
    const errors = {};
    if (!form.vehicleId) errors.vehicleId = 'Vozilo je obavezno.';
    if (!form.repairDate) errors.repairDate = 'Datum popravke je obavezan.';
    if (!form.description.trim()) errors.description = 'Opis problema je obavezan.';
    if (!form.cost) errors.cost = 'Cijena je obavezna.';
    else if (Number(form.cost) < 5) errors.cost = 'Cijena mora biti najmanje 5 KM.';
    return errors;
};

export default function RepairForm({ initial, vehicles, onSubmit, onCancel, loading, submitError }) {
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});

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
        setErrors({});
    }, [initial]);

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }));
        setErrors(e => ({ ...e, [field]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        onSubmit({
            vehicle: { vehicleId: Number(form.vehicleId) },
            repairDate: form.repairDate ? `${form.repairDate}T00:00:00` : null,
            description: form.description,
            cost: form.cost ? Number(form.cost) : null,
            status: form.status,
        });
    };

    return (
        <form className="p-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {submitError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
                        <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
                    </svg>
                    <span>{submitError}</span>
                </div>
            )}
            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Vozilo <span className="text-red-500">*</span>
                </label>
                <select
                    className={inputCls(errors.vehicleId)}
                    value={form.vehicleId}
                    onChange={set('vehicleId')}
                >
                    <option value="">-- Odaberi vozilo --</option>
                    {vehicles?.map(v => (
                        <option key={v.vehicleId} value={v.vehicleId}>
                            {v.brand} {v.model} ({v.registrationNumber})
                        </option>
                    ))}
                </select>
                {errors.vehicleId && <p className="text-xs text-red-600 mt-1">{errors.vehicleId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                        Datum popravke <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        className={inputCls(errors.repairDate)}
                        value={form.repairDate}
                        onChange={set('repairDate')}
                    />
                    {errors.repairDate && <p className="text-xs text-red-600 mt-1">{errors.repairDate}</p>}
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Status</label>
                    <select className={inputCls(false)} value={form.status} onChange={set('status')}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Opis problema <span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={3}
                    className={`${inputCls(errors.description)} resize-none`}
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Opišite problem ili vrstu popravke..."
                />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Cijena (KM) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="5"
                    className={inputCls(errors.cost)}
                    value={form.cost}
                    onChange={set('cost')}
                    placeholder="0.00"
                />
                {errors.cost && <p className="text-xs text-red-600 mt-1">{errors.cost}</p>}
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
