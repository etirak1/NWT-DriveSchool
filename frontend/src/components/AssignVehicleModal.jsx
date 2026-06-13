import React, { useState } from 'react';
import Modal from './Modal';
import { Car } from 'lucide-react';

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
            <div className="p-6 space-y-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
                        Odaberi dostupno vozilo
                    </label>
                    <select
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors"
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
                        <p className="text-xs text-slate-400 mt-1.5">Nema dostupnih vozila sa statusom ACTIVE.</p>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition-colors"
                    >
                        Odustani
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedVehicleId || loading}
                        className="flex items-center gap-1.5 px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200"
                    >
                        <Car size={14} />
                        {loading ? 'Dodjeljujem...' : 'Dodijeli vozilo'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
