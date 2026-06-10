import React, { useState, useEffect } from 'react';

const STATUSES = ['ACTIVE', 'INACTIVE', 'IN_SERVICE', 'UNAVAILABLE'];

const STATUS_LABELS = {
    ACTIVE: 'Aktivno',
    INACTIVE: 'Neaktivno',
    IN_SERVICE: 'Na servisu',
    UNAVAILABLE: 'Nedostupno'
};

const empty = {
    brand: '',
    model: '',
    registrationNumber: '',
    registrationDate: '',
    status: 'ACTIVE',
    lastTechnicalInspection: '',
};

const REG_PATTERN = /^[A-Za-z0-9]{3}-[A-Za-z0-9]-[A-Za-z0-9]{3}$/;

const validate = (form) => {
    const errors = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!form.brand.trim())
        errors.brand = 'Marka je obavezna.';

    if (!form.model.trim())
        errors.model = 'Model je obavezan.';

    if (!form.registrationNumber.trim())
        errors.registrationNumber = 'Registracijski broj je obavezan.';
    else if (!REG_PATTERN.test(form.registrationNumber.trim()))
        errors.registrationNumber = 'Format mora biti: XXX-X-XXX (slova i brojevi)';

    if (!form.registrationDate)
        errors.registrationDate = 'Datum registracije je obavezan.';
    else if (form.registrationDate > today)
        errors.registrationDate = 'Datum registracije ne može biti u budućnosti.';

    if (!form.lastTechnicalInspection)
        errors.lastTechnicalInspection = 'Datum tehničkog pregleda je obavezan.';
    else if (form.lastTechnicalInspection > today)
        errors.lastTechnicalInspection = 'Datum tehničkog pregleda ne može biti u budućnosti.';

    return errors;
};

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
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        onSubmit({
            brand: form.brand.trim(),
            model: form.model.trim(),
            registrationNumber: form.registrationNumber.trim(),
            status: form.status,
            registrationDate: form.registrationDate ? `${form.registrationDate}T00:00:00` : null,
            lastTechnicalInspection: form.lastTechnicalInspection ? `${form.lastTechnicalInspection}T00:00:00` : null,
        });
    };

    const fieldStyle = (field) => errors[field] ? { borderColor: '#ef4444' } : {};

    return (
        <form className="resource-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
                <div className="form-group">
                    <label>Marka <span className="req">*</span></label>
                    <input
                        value={form.brand}
                        onChange={set('brand')}
                        placeholder="npr. Volkswagen"
                        style={fieldStyle('brand')}
                    />
                    {errors.brand && <p className="field-error">{errors.brand}</p>}
                </div>

                <div className="form-group">
                    <label>Model <span className="req">*</span></label>
                    <input
                        value={form.model}
                        onChange={set('model')}
                        placeholder="npr. Golf"
                        style={fieldStyle('model')}
                    />
                    {errors.model && <p className="field-error">{errors.model}</p>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Registracijski broj <span className="req">*</span></label>
                    <input
                        value={form.registrationNumber}
                        onChange={set('registrationNumber')}
                        placeholder="npr. ABC-D-123"
                        style={fieldStyle('registrationNumber')}
                    />
                    {errors.registrationNumber && <p className="field-error">{errors.registrationNumber}</p>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Datum registracije <span className="req">*</span></label>
                    <input
                        type="date"
                        value={form.registrationDate}
                        onChange={set('registrationDate')}
                        style={fieldStyle('registrationDate')}
                    />
                    {errors.registrationDate && <p className="field-error">{errors.registrationDate}</p>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Status vozila</label>
                    <select value={form.status} onChange={set('status')}>
                        {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Posljednji tehnički pregled <span className="req">*</span></label>
                    <input
                        type="date"
                        value={form.lastTechnicalInspection}
                        onChange={set('lastTechnicalInspection')}
                        style={fieldStyle('lastTechnicalInspection')}
                    />
                    {errors.lastTechnicalInspection && <p className="field-error">{errors.lastTechnicalInspection}</p>}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>
                    Odustani
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Čuvanje...' : 'Sačuvaj vozilo'}
                </button>
            </div>
        </form>
    );
}
