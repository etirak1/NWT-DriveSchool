import React, { useState } from 'react';
import Modal from './Modal';

export default function AssignVehicleModal({ instructor, vehicles, onAssign, onClose, loading }) {
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

    const availableVehicles = (vehicles || []).filter(v => v.status === 'ACTIVE');

    const handleSubmit = () => {
        if (!selectedVehicleId) return;
        onAssign(instructor.instructorId, Number(selectedVehicleId));
    };

    return (
        <Modal
            isOpen={!!instructor}
            onClose={onClose}
            title={`Dodijeli vozilo — ${instructor?.firstName} ${instructor?.lastName}`}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                        Odaberi dostupno vozilo
                    </label>
                    <select
                        className="search-input"
                        style={{ width: '100%' }}
                        value={selectedVehicleId}
                        onChange={e => setSelectedVehicleId(e.target.value)}
                    >
                        <option value="">— Odaberi vozilo —</option>
                        {availableVehicles.map(v => (
                            <option key={v.vehicleId} value={v.vehicleId}>
                                {v.brand} {v.model} ({v.registrationNumber})
                            </option>
                        ))}
                    </select>
                    {availableVehicles.length === 0 && (
                        <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '8px' }}>
                            Nema dostupnih vozila sa statusom ACTIVE.
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Odustani
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!selectedVehicleId || loading}
                    >
                        {loading ? 'Dodjeljujem...' : 'Dodijeli vozilo'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}