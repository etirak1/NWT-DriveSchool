import React from 'react';
import { Badge } from './Notifications';

export default function InstructorTable({ instructors, onEdit, onToggleAvailability }) {
    if (!instructors?.length) return <div className="table-empty">Nema instruktora za prikaz.</div>;

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                <tr>
                    <th>Ime i prezime</th>
                    <th>Kontakt</th>
                    <th>Licenca</th>
                    <th>Dostupnost</th>
                    <th>Aktivni kandidati</th>
                    <th>Akcije</th>
                </tr>
                </thead>
                <tbody>
                {instructors.map(ins => (
                    <tr key={ins.instructorId}>
                        <td>
                            <div className="instructor-name">
                                <div className="avatar">{ins.firstName?.[0]}{ins.lastName?.[0]}</div>
                                <div>
                                    <strong>{ins.firstName} {ins.lastName}</strong>
                                    {ins.status && <small className="text-muted"> · {ins.status}</small>}
                                </div>
                            </div>
                        </td>
                        <td>
                            <div>{ins.email}</div>
                            {ins.phone && <small className="text-muted">{ins.phone}</small>}
                        </td>
                        <td><code>{ins.licenseNumber || '—'}</code></td>
                        <td>
                            <Badge variant={ins.available ? 'status-active' : 'status-inactive'}>
                                {ins.available ? 'Dostupan' : 'Nedostupan'}
                            </Badge>
                        </td>
                        <td>{ins.activeCandidatesCount ?? '—'}</td>
                        <td>
                            <div className="table-actions">
                                <button className="btn-icon" title="Uredi" onClick={() => onEdit(ins)}>✏️</button>
                                <button
                                    className="btn-icon"
                                    title={ins.available ? 'Označi nedostupnim' : 'Označi dostupnim'}
                                    onClick={() => onToggleAvailability(ins)}
                                >
                                    {ins.available ? '🔴' : '🟢'}
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}