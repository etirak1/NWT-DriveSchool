import React, { useState, useEffect } from 'react';

const empty = {
    firstName: '', lastName: '', email: '', phone: '',
    licenseNumber: '', available: true, status: 'ACTIVE',
};

export default function InstructorForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initial) {
            setForm({
                firstName: initial.firstName || '',
                lastName: initial.lastName || '',
                email: initial.email || '',
                phone: initial.phone || '',
                licenseNumber: initial.licenseNumber || '',
                available: initial.available ?? true,
                status: initial.status || 'ACTIVE',
            });
        } else {
            setForm(empty);
        }
    }, [initial]);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form className="resource-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label>Ime <span className="req">*</span></label>
                    <input required value={form.firstName} onChange={set('firstName')} placeholder="Ime" />
                </div>
                <div className="form-group">
                    <label>Prezime <span className="req">*</span></label>
                    <input required value={form.lastName} onChange={set('lastName')} placeholder="Prezime" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Email <span className="req">*</span></label>
                    <input required type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                </div>
                <div className="form-group">
                    <label>Telefon</label>
                    <input value={form.phone} onChange={set('phone')} placeholder="+387 61 000 000" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Broj licence</label>
                    <input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="npr. INS-2024-001" />
                </div>
                <div className="form-group">
                    <label>Dostupnost</label>
                    <select value={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.value === 'true' }))}>
                        <option value="true">Dostupan</option>
                        <option value="false">Nedostupan</option>
                    </select>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Odustani</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Čuvanje...' : 'Sačuvaj instruktora'}
                </button>
            </div>
        </form>
    );
}