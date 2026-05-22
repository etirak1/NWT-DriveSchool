import React, { useState, useEffect } from 'react';

const empty = {
    userId: '',
    availabilityNote: '',
};

export default function InstructorForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initial) {
            setForm({
                userId: initial.userId || '',
                availabilityNote: initial.availabilityNote || '',
            });
        } else {
            setForm(empty);
        }
    }, [initial]);

    const set = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            userId: Number(form.userId),
            availabilityNote: form.availabilityNote,
        });
    };

    return (
        <form className="resource-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>User ID *</label>
                <input
                    required
                    value={form.userId}
                    onChange={set('userId')}
                    placeholder="npr. 1"
                />
            </div>

            <div className="form-group">
                <label>Availability Note *</label>
                <input
                    required
                    value={form.availabilityNote}
                    onChange={set('availabilityNote')}
                    placeholder="npr. Available Mon-Fri 9-17"
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
                    {loading ? 'Čuvanje...' : 'Sačuvaj instruktora'}
                </button>
            </div>
        </form>
    );
}