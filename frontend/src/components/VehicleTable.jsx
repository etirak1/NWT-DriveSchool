import React from 'react';
import { formatDate, daysUntil, isExpiringSoon, isExpired, vehicleStatusLabel, vehicleStatusColor } from '../utils/helpers';
import { Badge } from './Notifications';

function RegBadge({ dateStr }) {
    const days = daysUntil(dateStr);
    if (days === null) return <span className="text-muted">—</span>;
    if (isExpired(dateStr)) return <Badge variant="danger">Istekla</Badge>;
    if (isExpiringSoon(dateStr)) return <Badge variant="warning">Ističe za {days}d</Badge>;
    return <span className="text-muted">{formatDate(dateStr)}</span>;
}

export default function VehicleTable({ vehicles, onEdit, onDelete, onView }) {
    if (!vehicles?.length) return (
        <div className="table-empty">Nema vozila za prikaz.</div>
    );

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                <tr>
                    <th>Vozilo</th>
                    <th>Registracija</th>
                    <th>Istek reg.</th>
                    <th>Status</th>
                    <th>Techn. pregled</th>
                    <th>Akcije</th>
                </tr>
                </thead>
                <tbody>
                {vehicles.map(v => (
                    <tr key={v.vehicleId} className={isExpiringSoon(v.registrationExpiry) || isExpired(v.registrationExpiry) ? 'row-warning' : ''}>
                        <td>
                            <div className="vehicle-name">
                                <span className="vehicle-icon">🚗</span>
                                <div>
                                    <strong>{v.brand} {v.model}</strong>
                                    {v.year && <small className="text-muted"> · {v.year}</small>}
                                </div>
                            </div>
                        </td>
                        <td><code className="reg-number">{v.registrationNumber}</code></td>
                        <td><RegBadge dateStr={v.registrationExpiry} /></td>
                        <td>
                            <Badge variant={vehicleStatusColor(v.status)}>
                                {vehicleStatusLabel(v.status)}
                            </Badge>
                        </td>
                        <td>{formatDate(v.lastTechnicalInspection)}</td>
                        <td>
                            <div className="table-actions">
                                <button className="btn-icon" title="Detalji" onClick={() => onView(v)}>👁</button>
                                <button className="btn-icon" title="Uredi" onClick={() => onEdit(v)}>✏️</button>
                                <button className="btn-icon btn-icon-danger" title="Obriši" onClick={() => onDelete(v)}>🗑</button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}