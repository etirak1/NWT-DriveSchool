import React, { useState } from 'react';
import { financeApi } from '../services/api';

/**
 * PaymentModal – forma za evidentiranje nove rate.
 * POST zahtjev se šalje samo kada korisnik potvrdi unos.
 * Server ne učestvuje u renderingu – prima čisti JSON.
 */
export default function PaymentModal({ onClose, onSuccess, showToast }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        amount:      '',
        status:      'PAID',
        candidateId: '',
        dueDate:     new Date().toISOString().split('T')[0],
        datePaid:    new Date().toISOString().split('T')[0],
    });

    const handleChange = (field) => (e) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        const amount = parseFloat(form.amount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Unesite ispravan iznos rate.', 'error');
            return;
        }
        if (!form.candidateId) {
            showToast('Unesite ID kandidata.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            // Šaljemo isključivo JSON koji backend očekuje
            await financeApi.create({
                amount,
                status:           form.status,
                dueDate:          form.dueDate,
                datePaid:         form.datePaid,
                candidateAccount: { id: parseInt(form.candidateId, 10) },
            });
            onSuccess();
        } catch (err) {
            console.error('Greška pri snimanju uplate:', err);
            showToast('Greška pri snimanju. Provjerite konzolu (F12).', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-md">
                <div className="modal-header">
                    <h2 className="modal-title">Evidentiraj novu ratu</h2>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Zatvori modal"
                    >
                        &times;
                    </button>
                </div>

                {/* Forma – sve interakcije su lokalne do trenutka submit-a */}
                <div className="modal-body resource-form">
                    <div className="form-group">
                        <label>Iznos rate (KM)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="npr. 200.00"
                            value={form.amount}
                            onChange={handleChange('amount')}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Status uplate</label>
                        <select value={form.status} onChange={handleChange('status')}>
                            <option value="PAID">Plaćeno (PAID)</option>
                            <option value="PENDING">Na čekanju (PENDING)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Kandidat ID</label>
                        <input
                            type="number"
                            min="1"
                            required
                            placeholder="npr. 1"
                            value={form.candidateId}
                            onChange={handleChange('candidateId')}
                        />
                    </div>

                    <div className="form-group">
                        <label>Datum uplate</label>
                        <input
                            type="date"
                            value={form.datePaid}
                            onChange={handleChange('datePaid')}
                        />
                    </div>

                    <div className="form-group">
                        <label>Datum dospijeća</label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={handleChange('dueDate')}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Odustani
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Snimanje...' : 'Snimi ratu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}