import React from 'react';
import Modal from './Modal';
import { formatDate, vehicleStatusLabel, vehicleStatusColor } from '../utils/helpers';
import { Badge } from './Notifications';

function Row({ label, children }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 shrink-0">{label}</span>
            <span className="text-sm text-slate-700 text-right">{children}</span>
        </div>
    );
}

export default function VehicleDetail({ vehicle, repairs, onClose }) {
    if (!vehicle) return null;
    const vehicleRepairs = repairs?.filter(r => r.vehicle?.vehicleId === vehicle.vehicleId) || [];

    return (
        <Modal isOpen={!!vehicle} onClose={onClose} title={`${vehicle.brand} ${vehicle.model}`} size="lg">
            <div className="p-6 grid sm:grid-cols-2 gap-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Informacije o vozilu</p>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4">
                        <Row label="Registracija">
                            <code className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{vehicle.registrationNumber}</code>
                        </Row>
                        <Row label="Godište">{vehicle.year || '—'}</Row>
                        <Row label="Status">
                            <Badge variant={vehicleStatusColor(vehicle.status)}>{vehicleStatusLabel(vehicle.status)}</Badge>
                        </Row>
                        <Row label="Datum reg.">{formatDate(vehicle.registrationDate)}</Row>
                        <Row label="Istek reg.">{formatDate(vehicle.registrationExpiry)}</Row>
                        <Row label="Tehn. pregled">{formatDate(vehicle.lastTechnicalInspection)}</Row>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                        Historija popravki ({vehicleRepairs.length})
                    </p>
                    {vehicleRepairs.length === 0 ? (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 py-8 text-center">
                            <p className="text-sm text-slate-400">Nema zabilježenih popravki.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {vehicleRepairs.map(r => (
                                <div key={r.repairId} className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-500">{formatDate(r.repairDate)}</span>
                                        {r.cost && <span className="text-xs font-semibold text-slate-700">{r.cost} KM</span>}
                                    </div>
                                    <p className="text-sm text-slate-700">{r.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
