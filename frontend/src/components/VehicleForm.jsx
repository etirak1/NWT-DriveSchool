import React, { useState, useEffect } from 'react';


const STATUSES = ['ACTIVE', 'INACTIVE', 'IN_SERVICE', 'UNAVAILABLE'];
const STATUS_LABELS = {
    ACTIVE: 'Aktivno', INACTIVE: 'Neaktivno',
    IN_SERVICE: 'Na servisu', UNAVAILABLE: 'Nedostupno'
};

const empty = {
    brand: '', model: '', year: '', registrationNumber: '',
    registrationDate: '', status: 'ACTIVE',
    lastTechnicalInspection: '',
};

export default function VehicleForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initial) {
            setForm({
                brand: initial.brand || '',
                model: initial.model || '',
                year: initial.year || '',
                registrationNumber: initial.registrationNumber || '',
                registrationDate: initial.registrationDate?.slice(0, 10) || '',
                status: initial.status || 'ACTIVE',
                lastTechnicalInspection: initial.lastTechnicalInspection?.slice(0, 10) || '',
            });
        } else {
            setForm(empty);
        }
    }, [initial]);

    const set = (field) => (e) => setForm(f => ({...f, [field]: e.target.value}));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            brand: form.brand,
            model: form.model,
            registrationNumber: form.registrationNumber,
            status: form.status,
            registrationDate: form.registrationDate ? `${form.registrationDate}T00:00:00` : null,
            lastTechnicalInspection: form.lastTechnicalInspection ? `${form.lastTechnicalInspection}T00:00:00` : null,
        });
    };

    return (
        <form className="resource-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label>Marka <span className="req">*</span></label>
                    <input required value={form.brand} onChange={set('brand')} placeholder="npr. Volkswagen"/>
                </div>
                <div className="form-group">
                    <label>Model <span className="req">*</span></label>
                    <input required value={form.model} onChange={set('model')} placeholder="npr. Golf"/>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Godište</label>
                    <input type="number" value={form.year} onChange={set('year')}
                           min="1990" max={new Date().getFullYear()} placeholder="2020"/>
                </div>
                <div className="form-group">
                    <label>Registracijski broj <span className="req">*</span></label>
                    <input required value={form.registrationNumber} onChange={set('registrationNumber')}
                           placeholder="npr. A12-B-345"/>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Datum registracije</label>
                    <input type="date" value={form.registrationDate} onChange={(e) => {
                        const regDate = e.target.value;

                        setForm(f => ({
                            ...f,
                            registrationDate: regDate
                        }));
                    }}/>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Status vozila</label>
                    <select value={form.status} onChange={set('status')}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Posljednji tehnički pregled</label>
                    <input type="date" value={form.lastTechnicalInspection} onChange={set('lastTechnicalInspection')}/>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Odustani</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Čuvanje...' : 'Sačuvaj vozilo'}
                </button>
            </div>
        </form>
    );
}