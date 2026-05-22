import React from 'react';
import { Badge } from './Notifications';

export default function InstructorTable({ instructors, onEdit, onToggleAvailability }) {
    if (!instructors?.length) {
        return <div className="table-empty">Nema instruktora za prikaz.</div>;
    }

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                <tr>
                    <th>Ime i prezime</th>
                    <th>Email</th>
                    <th>Dostupnost</th>
                    <th>Akcije</th>
                </tr>
                </thead>

                <tbody>
                {instructors.map(ins => (
                    <tr key={ins.instructorId}>
                        <td>
                            <div className="instructor-name">
                                <div className="avatar">
                                    {ins.user?.firstName?.[0]}
                                    {ins.user?.lastName?.[0]}
                                </div>

                                <strong>
                                    {ins.user?.firstName} {ins.user?.lastName}
                                </strong>
                            </div>
                        </td>

                        <td>{ins.user?.email}</td>

                        <td>
                            <Badge variant="status-active">
                                {ins.availabilityNote}
                            </Badge>
                        </td>

                        <td>
                            <div className="table-actions">
                                <button
                                    className="btn-icon"
                                    onClick={() => onEdit(ins)}
                                >
                                    ✏️
                                </button>

                                <button
                                    className="btn-icon"
                                    onClick={() => onToggleAvailability(ins)}
                                >
                                    🔄
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