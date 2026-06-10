import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, instructorApi, vehicleApi } from '../services/api';
import { Spinner, ErrorState } from '../components/States';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/helpers';
import AssignVehicleModal from '../components/AssignVehicleModal';

export default function InstructorsPage() {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [assigning, setAssigning] = useState(false);

    const { data: { instructors: data = [], vehicles = [] } = {}, isLoading: loading, isError, refetch } = useQuery({
        queryKey: ['instructors'],
        queryFn: async () => {
            const [resUsers, resInstructors, resVehicles] = await Promise.all([
                userApi.getActiveInstructors(),
                instructorApi.getAll(),
                vehicleApi.getAll()
            ]);
            const usersList = resUsers.data.content || resUsers.data || [];
            const resourceList = resInstructors.data.content || resInstructors.data || [];
            const vehiclesList = resVehicles.data?.data || resVehicles.data || [];
            const combined = resourceList.map((instructor) => {
                const userIdFromResource = instructor.user?.userId || instructor.userId;
                const userMatch = usersList.find(u => String(u.userId) === String(userIdFromResource));
                return {
                    ...instructor,
                    firstName: userMatch?.firstName || instructor.user?.firstName || 'Nije pronađeno ime',
                    lastName: userMatch?.lastName || instructor.user?.lastName || 'Nije pronađeno prezime',
                    email: userMatch?.email || instructor.user?.email || 'Nema emaila',
                };
            });
            return { instructors: combined, vehicles: vehiclesList };
        },
    });

    const error = isError ? 'Greška pri učitavanju instruktora.' : null;

    const filtered = data.filter(i =>
        `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const isAvailable = (ins) => ins.availabilityNote === 'AVAILABLE';

    const handleToggleAvailability = async (instructor) => {
        const newNote = isAvailable(instructor) ? 'UNAVAILABLE' : 'AVAILABLE';
        setActionLoading(instructor.instructorId);
        try {
            await instructorApi.updateAvailability(instructor.instructorId, newNote);
            addToast(`Status promenjen za ${instructor.firstName}`, 'success');
            setData(prev => prev.map(item =>
                item.instructorId === instructor.instructorId
                    ? { ...item, availabilityNote: newNote }
                    : item
            ));
        } catch (e) {
            addToast(getErrorMessage(e), 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAssignVehicle = async (instructorId, vehicleId) => {
        setAssigning(true);

        try {
            await instructorApi.assignVehicle(instructorId, vehicleId);

            const vehicle = vehicles.find(v => v.vehicleId === vehicleId);

            addToast(
                `Vozilo ${vehicle?.brand} ${vehicle?.model} dodijeljeno instruktoru!`,
                'success'
            );

            setAssignTarget(null);
            queryClient.invalidateQueries({ queryKey: ['instructors'] });

        } catch (e) {

            if (e.response?.status === 500) {
                addToast('Vozilo je već dodijeljeno drugom instruktoru', 'error');
            } else {
                addToast(getErrorMessage(e), 'error');
            }

        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Instruktori</h1>
                </div>
            </div>

            {loading && <Spinner />}
            {error && <ErrorState message={error} onRetry={refetch} />}

            {!loading && !error && (
                <>
                <div className="page-toolbar">
                    <input
                        className="search-input"
                        placeholder="Pretraži instruktore..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <span className="toolbar-count">{filtered.length} instruktora</span>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Instruktor</th>
                            <th>Email</th>
                            <th>Dostupnost</th>
                            <th>Vozilo</th>
                            <th>Akcije</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((ins, index) => (
                            <tr key={`${ins.instructorId}-${index}`}>
                                <td>
                                    <div className="instructor-name">
                                        <div className="avatar">
                                            {ins.firstName[0]}{ins.lastName[0]}
                                        </div>
                                        <div>
                                            <strong>{ins.firstName} {ins.lastName}</strong>
                                            <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                                                ID: {ins.instructorId}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{ins.email}</td>
                                <td>
                                        <span className={`badge ${isAvailable(ins) ? 'badge-status-active' : 'badge-status-inactive'}`}>
                                            {ins.availabilityNote === 'AVAILABLE' ? 'DOSTUPAN' : 'NEDOSTUPAN'}
                                        </span>
                                </td>
                                <td>
                                    {(() => {
                                        const assignedVehicle = vehicles.find(v => v.vehicleId === ins.assignedVehicleId);
                                        return assignedVehicle
                                            ? <span style={{ fontSize: '13px' }}>
                {assignedVehicle.brand} {assignedVehicle.model}
                                                <span style={{ color: 'var(--text2)', marginLeft: '4px' }}>
                    ({assignedVehicle.registrationNumber})
                </span>
              </span>
                                            : <span style={{ color: 'var(--text2)', fontSize: '13px' }}>
                Nije dodijeljeno
              </span>;
                                    })()}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className={`btn btn-sm ${isAvailable(ins) ? 'btn-danger' : 'btn-primary'}`}
                                            onClick={() => handleToggleAvailability(ins)}
                                            disabled={actionLoading === ins.instructorId}
                                        >
                                            {isAvailable(ins) ? 'Označi nedostupnim' : 'Označi dostupnim'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => setAssignTarget(ins)}
                                        >
                                            🚗 Dodijeli vozilo
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            {assignTarget && (
                <AssignVehicleModal
                    instructor={assignTarget}
                    vehicles={vehicles}
                    onAssign={handleAssignVehicle}
                    onClose={() => setAssignTarget(null)}
                    loading={assigning}
                />
            )}
        </div>
    );
}