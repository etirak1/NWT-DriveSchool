import React from 'react';
import { formatDate, repairStatusLabel } from '../utils/helpers';
import { Badge } from './Notifications';

const statusVariant = {
    PLANNED: 'info', PENDING: 'warning', IN_PROGRESS: 'primary', COMPLETED: 'success'
};

export default function RepairTable({ repairs, onEdit, onDelete }) {
    if (!repairs?.length) return <div className="table-empty">Nema popravki za prikaz.</div>;

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                <tr>
                    <th>Vozilo</th>
                    <th>Datum</th>
                    <th>Opis</th>
                    <th>Cijena</th>
                    <th>Akcije</th>
                </tr>
                </thead>
                <tbody>
                {repairs.map(r => (
                    <tr key={r.repairId}>
                        <td>
                            <strong>{r.vehicle?.brand} {r.vehicle?.model}</strong>
                            <br /><small className="text-muted">{r.vehicle?.registrationNumber}</small>
                        </td>
                        <td>{formatDate(r.repairDate)}</td>
                        <td className="desc-cell">{r.description}</td>
                        <td>{r.cost ? `${r.cost} KM` : '—'}</td>
                        <td>
                            <div className="table-actions">
                                <button className="btn-icon" title="Uredi" onClick={() => onEdit(r)}>✏️</button>
                                <button className="btn-icon btn-icon-danger" title="Obriši" onClick={() => onDelete(r)}>🗑</button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}