import React, { useState, useEffect } from 'react';

const STATUSES = ['ACTIVE', 'INACTIVE', 'IN_SERVICE', 'UNAVAILABLE'];
const STATUS_LABELS = {
    ACTIVE: 'Aktivno', INACTIVE: 'Neaktivno', IN_SERVICE: 'Na servisu', UNAVAILABLE: 'Nedostupno',
};

const empty = {
    brand: '', model: '', registrationNumber: '', registrationDate: '', status: 'ACTIVE', lastTechnicalInspection: '',
};

const REG_PATTERN = /^[A-Za-z0-9]{3}-[A-Za-z0-9]-[A-Za-z0-9]{3}$/;

const validate = (form) => {
    const errors = {};
    const today = new Date().toISOString().slice(0, 10);
    if (!form.brand.trim()) errors.brand = 'Marka je obavezna.';
    if (!form.model.trim()) errors.model = 'Model je obavezan.';
    if (!form.registrationNumber.trim()) errors.registrationNumber = 'Registracijski broj je obavezan.';
    else if (!REG_PATTERN.test(form.registrationNumber.trim())) errors.registrationNumber = 'Format mora biti: XXX-X-XXX (slova i brojevi)';
    if (!form.registrationDate) errors.registrationDate = 'Datum registracije je obavezan.';
    else if (form.registrationDate > today) errors.registrationDate = 'Datum registracije ne može biti u budućnosti.';
    if (!form.lastTechnicalInspection) errors.lastTechnicalInspection = 'Datum tehničkog pregleda je obavezan.';
    else if (form.lastTechnicalInspection > today) errors.lastTechnicalInspection = 'Datum tehničkog pregleda ne može biti u budućnosti.';
    return errors;
};

const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors ${
        err ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`;

export default function VehicleForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initial) {
            setForm({
                brand: initial.brand || '',
                model: initial.model || '',
                registrationNumber: initial.registrationNumber || '',
                registrationDate: initial.registrationDate?.slice(0, 10) || '',
                status: initial.status || 'ACTIVE',
                lastTechnicalInspection: initial.lastTechnicalInspection?.slice(0, 10) || '',
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
            brand: form.brand.trim(),
            model: form.model.trim(),
            registrationNumber: form.registrationNumber.trim(),
            status: form.status,
            registrationDate: form.registrationDate ? `${form.registrationDate}T00:00:00` : null,
            lastTechnicalInspection: form.lastTechnicalInspection ? `${form.lastTechnicalInspection}T00:00:00` : null,
        });
    };

    return (
        <form className="p-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                        Marka <span className="text-red-500">*</span>
                    </label>
                    <input className={inputCls(errors.brand)} value={form.brand} onChange={set('brand')} placeholder="npr. Volkswagen" />
                    {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand}</p>}
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                        Model <span className="text-red-500">*</span>
                    </label>
                    <input className={inputCls(errors.model)} value={form.model} onChange={set('model')} placeholder="npr. Golf" />
                    {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model}</p>}
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Registracijski broj <span className="text-red-500">*</span>
                </label>
                <input className={inputCls(errors.registrationNumber)} value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="npr. ABC-D-123" />
                {errors.registrationNumber && <p className="text-xs text-red-600 mt-1">{errors.registrationNumber}</p>}
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Datum registracije <span className="text-red-500">*</span>
                </label>
                <input type="date" className={inputCls(errors.registrationDate)} value={form.registrationDate} onChange={set('registrationDate')} />
                {errors.registrationDate && <p className="text-xs text-red-600 mt-1">{errors.registrationDate}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Status vozila</label>
                    <select className={inputCls(false)} value={form.status} onChange={set('status')}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                        Posljednji tehn. pregled <span className="text-red-500">*</span>
                    </label>
                    <input type="date" className={inputCls(errors.lastTechnicalInspection)} value={form.lastTechnicalInspection} onChange={set('lastTechnicalInspection')} />
                    {errors.lastTechnicalInspection && <p className="text-xs text-red-600 mt-1">{errors.lastTechnicalInspection}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition-colors">
                    Odustani
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200">
                    {loading ? 'Čuvanje...' : 'Sačuvaj vozilo'}
                </button>
            </div>
        </form>
    );
}
