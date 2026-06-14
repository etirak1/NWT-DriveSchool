import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { instructorApi, vehicleApi } from '../services/api';
import { useInstructors } from '../hooks/useInstructors';
import { Spinner, ErrorState } from '../components/States';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/helpers';
import AssignVehicleModal from '../components/AssignVehicleModal';
import { Badge } from '../components/Notifications';

export default function InstructorsPage() {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [assigning, setAssigning] = useState(false);

    const { data: instructorData = [], isLoading: instructorsLoading, isError, refetch: refetchInstructors } = useInstructors();

    const { data: vehiclesData = [], isLoading: vehiclesLoading, isError: vehiclesError, refetch: refetchVehicles } = useQuery({
        queryKey: ['vehicles'],
        retry: 1,
        queryFn: () => vehicleApi.getAll().then(r => r.data?.data || r.data || []),
    });

    const data = instructorData;
    const vehicles = vehiclesData;
    const loading = instructorsLoading || vehiclesLoading;
    const refetch = () => { refetchInstructors(); refetchVehicles(); };

    const error = (isError || vehiclesError) ? 'Greška pri učitavanju instruktora.' : null;

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
            queryClient.invalidateQueries({ queryKey: ['instructors-combined'] });
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
            addToast(`Vozilo ${vehicle?.brand} ${vehicle?.model} dodijeljeno instruktoru!`, 'success');
            setAssignTarget(null);
            queryClient.invalidateQueries({ queryKey: ['instructors-combined'] });

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
        <div className="space-y-5">
            {/* Page header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Instruktori</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Upravljanje instruktorima auto-škole</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-6">
                {loading && <Spinner />}
                {error && <ErrorState message={error} onRetry={refetch} />}

                {!loading && !error && (
                    <>
                        <div className="flex items-center justify-between mb-5 gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors"
                                    placeholder="Pretraži instruktore..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{filtered.length} instruktora</span>
                        </div>

                        <div className="rounded-xl overflow-x-auto border border-slate-200">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Instruktor</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Email</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Dostupnost</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Vozilo</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Akcije</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                {filtered.map((ins, index) => (
                                    <tr key={`${ins.instructorId}-${index}`} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                                                        <span className="text-white font-bold text-xs">
                                                            {ins.firstName[0]}{ins.lastName[0]}
                                                        </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{ins.firstName} {ins.lastName}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">ID: {ins.instructorId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600">{ins.email}</td>
                                        <td className="px-4 py-3.5">
                                            <Badge variant={isAvailable(ins) ? 'status-active' : 'status-inactive'}>
                                                {ins.availabilityNote === 'AVAILABLE' ? 'DOSTUPAN' : 'NEDOSTUPAN'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {(() => {
                                                const assignedVehicle = vehicles.find(v => v.vehicleId === ins.assignedVehicleId);
                                                return assignedVehicle
                                                    ? <span className="text-sm text-slate-700">
                                                            {assignedVehicle.brand} {assignedVehicle.model}
                                                        <span className="text-slate-400 ml-1">({assignedVehicle.registrationNumber})</span>
                                                          </span>
                                                    : <span className="text-sm text-slate-400">Nije dodijeljeno</span>;
                                            })()}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors disabled:opacity-50 ${
                                                        isAvailable(ins)
                                                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    }`}
                                                    onClick={() => handleToggleAvailability(ins)}
                                                    disabled={actionLoading === ins.instructorId}
                                                >
                                                    {isAvailable(ins) ? 'Označi nedostupnim' : 'Označi dostupnim'}
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 text-xs rounded-lg font-semibold border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                                                    onClick={() => setAssignTarget(ins)}
                                                >
                                                    Dodijeli vozilo
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
            </div>

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
