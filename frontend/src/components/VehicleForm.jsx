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

export default function VehicleForm({
                                        initial,
                                        onSubmit,
                                        onCancel,
                                        loading
                                    }) {
    const [form, setForm] = useState(empty);
    const [regError, setRegError] = useState('');

    useEffect(() => {
        if (initial) {
            setForm({
                brand: initial.brand || '',
                model: initial.model || '',
                registrationNumber: initial.registrationNumber || '',
                registrationDate: initial.registrationDate?.slice(0, 10) || '',
                status: initial.status || 'ACTIVE',
                lastTechnicalInspection:
                    initial.lastTechnicalInspection?.slice(0, 10) || '',
            });
        } else {
            setForm(empty);
        }
    }, [initial]);

    const set = (field) => (e) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!REG_PATTERN.test(form.registrationNumber.trim())) {
            setRegError('Format mora biti: XXX-X-XXX (slova i brojevi)');
            return;
        }

        setRegError('');

        onSubmit({
            brand: form.brand,
            model: form.model,
            registrationNumber: form.registrationNumber.trim(),
            status: form.status,
            registrationDate: form.registrationDate
                ? `${form.registrationDate}T00:00:00`
                : null,
            lastTechnicalInspection: form.lastTechnicalInspection
                ? `${form.lastTechnicalInspection}T00:00:00`
                : null,
        });
    };

    return (
        <form className="resource-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label>
                        Marka <span className="req">*</span>
                    </label>

                    <input
                        required
                        value={form.brand}
                        onChange={set('brand')}
                        placeholder="npr. Volkswagen"
                        onInvalid={(e) =>
                            e.target.setCustomValidity('Unesite marku vozila')
                        }
                        onInput={(e) =>
                            e.target.setCustomValidity('')
                        }
                    />
                </div>

                <div className="form-group">
                    <label>
                        Model <span className="req">*</span>
                    </label>

                    <input
                        required
                        value={form.model}
                        onChange={set('model')}
                        placeholder="npr. Golf"
                        onInvalid={(e) =>
                            e.target.setCustomValidity('Unesite model vozila')
                        }
                        onInput={(e) =>
                            e.target.setCustomValidity('')
                        }
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>
                        Registracijski broj <span className="req">*</span>
                    </label>

                    <input
                        required
                        value={form.registrationNumber}
                        onChange={(e) => {
                            set('registrationNumber')(e);
                            setRegError('');
                        }}
                        placeholder="npr. ABC-D-123"
                        style={regError ? { borderColor: '#ef4444' } : {}}
                        onInvalid={(e) => {
                            if (e.target.validity.valueMissing) {
                                e.target.setCustomValidity(
                                    'Unesite registracijski broj'
                                );
                            }
                        }}
                        onInput={(e) =>
                            e.target.setCustomValidity('')
                        }
                    />

                    {regError && (
                        <p
                            style={{
                                color: '#ef4444',
                                fontSize: '12px',
                                marginTop: '4px'
                            }}
                        >
                            {regError}
                        </p>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>
                        Datum registracije <span className="req">*</span>
                    </label>

                    <input
                        required
                        type="date"
                        value={form.registrationDate}
                        onChange={(e) => {
                            const regDate = e.target.value;

                            setForm(f => ({
                                ...f,
                                registrationDate: regDate
                            }));
                        }}
                        onInvalid={(e) =>
                            e.target.setCustomValidity(
                                'Odaberite datum registracije'
                            )
                        }
                        onInput={(e) =>
                            e.target.setCustomValidity('')
                        }
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Status vozila</label>

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

                <div className="form-group">
                    <label>
                        Posljednji tehnički pregled{' '}
                        <span className="req">*</span>
                    </label>

                    <input
                        required
                        type="date"
                        value={form.lastTechnicalInspection}
                        onChange={set('lastTechnicalInspection')}
                        onInvalid={(e) =>
                            e.target.setCustomValidity(
                                'Odaberite datum tehničkog pregleda'
                            )
                        }
                        onInput={(e) =>
                            e.target.setCustomValidity('')
                        }
                    />
                </div>
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
                    {loading ? 'Čuvanje...' : 'Sačuvaj vozilo'}
                </button>
            </div>
        </form>
    );
}