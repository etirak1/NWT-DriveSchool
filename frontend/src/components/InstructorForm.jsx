import React, { useState, useEffect } from 'react';

const empty = {
    userId: '',
    availabilityNote: '',
};

const validate = (form) => {
    const errors = {};

    if (!form.userId.toString().trim())
        errors.userId = 'User ID je obavezan.';
    else if (!/^\d+$/.test(form.userId.toString().trim()))
        errors.userId = 'User ID mora biti pozitivan cijeli broj.';
    else if (Number(form.userId) <= 0)
        errors.userId = 'User ID mora biti veći od 0.';

    if (!form.availabilityNote.trim())
        errors.availabilityNote = 'Napomena o dostupnosti je obavezna.';
    else if (form.availabilityNote.trim().length < 3)
        errors.availabilityNote = 'Napomena mora imati najmanje 3 karaktera.';

    return errors;
};

export default function InstructorForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initial) {
            setForm({
                userId: initial.userId || '',
                availabilityNote: initial.availabilityNote || '',
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
            userId: Number(form.userId),
            availabilityNote: form.availabilityNote.trim(),
        });
    };

    const fieldStyle = (field) => errors[field] ? { borderColor: '#ef4444' } : {};

    return (
        <form className="resource-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
                <label>User ID <span className="req">*</span></label>
                <input
                    value={form.userId}
                    onChange={set('userId')}
                    placeholder="npr. 1"
                    style={fieldStyle('userId')}
                />
                {errors.userId && <p className="field-error">{errors.userId}</p>}
            </div>

            <div className="form-group">
                <label>Napomena o dostupnosti <span className="req">*</span></label>
                <input
                    value={form.availabilityNote}
                    onChange={set('availabilityNote')}
                    placeholder="npr. Dostupan pon-pet 9-17"
                    style={fieldStyle('availabilityNote')}
                />
                {errors.availabilityNote && <p className="field-error">{errors.availabilityNote}</p>}
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>
                    Odustani
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Čuvanje...' : 'Sačuvaj instruktora'}
                </button>
            </div>
        </form>
    );
}
