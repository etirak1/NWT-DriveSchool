import React, { useState, useEffect } from 'react';

const empty = {
    vehicleId: '',
    repairDate: '',
    description: '',
    cost: '',
    status: 'PLANNED'
};

const STATUSES = ['PLANNED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];

const STATUS_LABELS = {
    PLANNED: 'Planirano',
    PENDING: 'Na čekanju',
    IN_PROGRESS: 'U toku',
    COMPLETED: 'Završeno'
};

export default function RepairForm({
                                       initial,
                                       vehicles,
                                       onSubmit,
                                       onCancel,
                                       loading
                                   }) {
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

    const set = (field) => (e) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            vehicle: { vehicleId: Number(form.vehicleId) },
            repairDate: form.repairDate
                ? `${form.repairDate}T00:00:00`
                : null,
            description: form.description,
            cost: form.cost ? Number(form.cost) : null,
        });
    };

    return (
        <form className="resource-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>
                    Vozilo <span className="req">*</span>
                </label>

                <select
                    required
                    value={form.vehicleId}
                    onChange={set('vehicleId')}
                    onInvalid={(e) =>
                        e.target.setCustomValidity('Odaberite vozilo')
                    }
                    onInput={(e) =>
                        e.target.setCustomValidity('')
                    }
                >
                    <option value="">-- Odaberi vozilo --</option>

                    {vehicles?.map(v => (
                        <option
                            key={v.vehicleId}
                            value={v.vehicleId}
                        >
                            {v.brand} {v.model} ({v.registrationNumber})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>
                        Datum popravke <span className="req">*</span>
                    </label>

                    <input
                        required
                        type="date"
                        value={form.repairDate}
                        onChange={set('repairDate')}
                        onInvalid={(e) =>
                            e.target.setCustomValidity('Odaberite datum popravke')
                        }
                        onInput={(e) =>
                            e.target.setCustomValidity('')
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Status</label>

                    <select
                        value={form.status}
                        onChange={set('status')}
                    >
                        {STATUSES.map(s => (
                            <option key={s} value={s}>
                                {STATUS_LABELS[s]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>
                    Opis problema <span className="req">*</span>
                </label>

                <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Opišite problem ili vrstu popravke..."
                    onInvalid={(e) =>
                        e.target.setCustomValidity('Unesite opis problema')
                    }
                    onInput={(e) =>
                        e.target.setCustomValidity('')
                    }
                />
            </div>

            <div className="form-group">
                <label>
                    Cijena (KM) <span className="req">*</span>
                </label>

                <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.cost}
                    onChange={set('cost')}
                    placeholder="0.00"
                    onInvalid={(e) => {
                        if (e.target.validity.valueMissing) {
                            e.target.setCustomValidity('Unesite cijenu');
                        } else if (e.target.validity.rangeUnderflow) {
                            e.target.setCustomValidity('Cijena mora biti veća od 0');
                        }
                    }}
                    onInput={(e) =>
                        e.target.setCustomValidity('')
                    }
                />
            </div>

            <div className="form-actions">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onCancel}
                >
                    Odustani
                </button>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading
                        ? 'Čuvanje...'
                        : 'Sačuvaj popravku'}
                </button>
            </div>
        </form>
    );
}