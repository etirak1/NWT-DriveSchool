import React, { useState, useEffect } from 'react';

const empty = { userId: '', availabilityNote: '' };

const validate = (form) => {
    const errors = {};
    if (!form.userId.toString().trim()) errors.userId = 'User ID je obavezan.';
    else if (!/^\d+$/.test(form.userId.toString().trim())) errors.userId = 'User ID mora biti pozitivan cijeli broj.';
    else if (Number(form.userId) <= 0) errors.userId = 'User ID mora biti veći od 0.';
    if (!form.availabilityNote.trim()) errors.availabilityNote = 'Napomena o dostupnosti je obavezna.';
    else if (form.availabilityNote.trim().length < 3) errors.availabilityNote = 'Napomena mora imati najmanje 3 karaktera.';
    return errors;
};

const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors ${
        err ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`;

export default function InstructorForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initial) {
            setForm({ userId: initial.userId || '', availabilityNote: initial.availabilityNote || '' });
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
        onSubmit({ userId: Number(form.userId), availabilityNote: form.availabilityNote.trim() });
    };

    return (
        <form className="p-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    User ID <span className="text-red-500">*</span>
                </label>
                <input className={inputCls(errors.userId)} value={form.userId} onChange={set('userId')} placeholder="npr. 1" />
                {errors.userId && <p className="text-xs text-red-600 mt-1">{errors.userId}</p>}
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Napomena o dostupnosti <span className="text-red-500">*</span>
                </label>
                <input className={inputCls(errors.availabilityNote)} value={form.availabilityNote} onChange={set('availabilityNote')} placeholder="npr. Dostupan pon-pet 9-17" />
                {errors.availabilityNote && <p className="text-xs text-red-600 mt-1">{errors.availabilityNote}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition-colors">
                    Odustani
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200">
                    {loading ? 'Čuvanje...' : 'Sačuvaj instruktora'}
                </button>
            </div>
        </form>
    );
}
