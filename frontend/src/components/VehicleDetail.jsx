import React from 'react';
import Modal from './Modal';
import { formatDate, vehicleStatusLabel, vehicleStatusColor } from '../utils/helpers';
import { Badge } from './Notifications';

export default function VehicleDetail({ vehicle, repairs, onClose }) {
    if (!vehicle) return null;
    const vehicleRepairs = repairs?.filter(r => r.vehicle?.vehicleId === vehicle.vehicleId) || [];

    return (
        <Modal isOpen={!!vehicle} onClose={onClose} title={`${vehicle.brand} ${vehicle.model}`} size="lg">
            <div className="detail-grid">
                <div className="detail-section">
                    <h3 className="section-title">Informacije o vozilu</h3>
                    <div className="detail-rows">
                        <div className="detail-row"><span>Registracija</span><code>{vehicle.registrationNumber}</code></div>
                        <div className="detail-row"><span>Godište</span><span>{vehicle.year || '—'}</span></div>
                        <div className="detail-row"><span>Status</span>
                            <Badge variant={vehicleStatusColor(vehicle.status)}>{vehicleStatusLabel(vehicle.status)}</Badge>
                        </div>
                        <div className="detail-row"><span>Datum reg.</span><span>{formatDate(vehicle.registrationDate)}</span></div>
                        <div className="detail-row"><span>Istek reg.</span><span>{formatDate(vehicle.registrationExpiry)}</span></div>
                        <div className="detail-row"><span>Techn. pregled</span><span>{formatDate(vehicle.lastTechnicalInspection)}</span></div>
                    </div>
                </div>

                <div className="detail-section">
                    <h3 className="section-title">Historija popravki ({vehicleRepairs.length})</h3>
                    {vehicleRepairs.length === 0
                        ? <p className="text-muted">Nema zabilježenih popravki.</p>
                        : (
                            <div className="repair-list">
                                {vehicleRepairs.map(r => (
                                    <div key={r.repairId} className="repair-item">
                                        <div className="repair-date">{formatDate(r.repairDate)}</div>
                                        <div className="repair-desc">{r.description}</div>
                                        {r.cost && <div className="repair-cost">{r.cost} KM</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>
        </Modal>
    );
}
