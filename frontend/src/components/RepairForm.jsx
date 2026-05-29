import React, { useState, useEffect } from 'react';

const empty = { vehicleId: '', repairDate: '', description: '', cost: '', status: 'PLANNED' };

export default function RepairForm({ initial, vehicles, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initial) {
            setForm({
                vehicleId: initial.vehicle?.vehicleId || '',
                repairDate: initial.repairDate?.slice(0, 10) || '',
                description: initial.description || '',
                cost: initial.cost || '',
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
        });
    };

    return (
        <form className="resource-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Vozilo <span className="req">*</span></label>
                <select required value={form.vehicleId} onChange={set('vehicleId')}>
                    <option value="">-- Odaberi vozilo --</option>
                    {vehicles?.map(v => (
                        <option key={v.vehicleId} value={v.vehicleId}>
                            {v.brand} {v.model} ({v.registrationNumber})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Datum popravke <span className="req">*</span></label>
                    <input required type="date" value={form.repairDate} onChange={set('repairDate')} />
                </div>
            </div>

            <div className="form-group">
                <label>Opis problema <span className="req">*</span></label>
                <textarea required rows={3} value={form.description} onChange={set('description')}
                          placeholder="Opisite problem ili vrstu popravke..." />
            </div>

            <div className="form-group">
                <label>Cijena (KM) <span className="req">*</span></label>
                <input  type="number" step="0.01" min="0.01" value={form.cost} onChange={set('cost')}
                        placeholder="0.00" />
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Odustani</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Čuvanje...' : 'Sačuvaj popravku'}
                </button>
            </div>
        </form>
    );
}