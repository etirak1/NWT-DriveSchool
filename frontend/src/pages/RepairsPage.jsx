import React, { useState } from 'react';
import { Wrench, Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { repairApi, vehicleApi } from '../api/client';
import RepairTable from '../components/RepairTable';
import RepairForm from '../components/RepairForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner, ErrorState } from '../components/States';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/helpers';

export default function RepairsPage() {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const { data: repairs = [], isLoading: loading, isError: error, refetch } = useQuery({
        queryKey: ['repairs'],
        queryFn: () => repairApi.getAll().then(r => r.data || []),
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles'],
        queryFn: () => vehicleApi.getAll().then(r => r.data || []),
    });

    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [filterVehicle, setFilterVehicle] = useState('');

    const filtered = (repairs || []).filter(r =>
        !filterVehicle || r.vehicle?.vehicleId === Number(filterVehicle)
    );

    const handleSubmit = async (data) => {
        setSaving(true);
        setSaveError(null);
        try {
            if (editTarget) {
                await repairApi.update(editTarget.repairId, data);
                addToast('Popravka ažurirana!', 'success');
            } else {
                await repairApi.create(data);
                addToast('Popravka dodana!', 'success');
            }
            setShowForm(false);
            setEditTarget(null);
            queryClient.invalidateQueries({ queryKey: ['repairs'] });
        } catch (e) {
            setSaveError(getErrorMessage(e));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await repairApi.delete(deleteTarget.repairId);
            addToast('Popravka obrisana.', 'success');
            setDeleteTarget(null);
            queryClient.invalidateQueries({ queryKey: ['repairs'] });
        } catch (e) {
            addToast(getErrorMessage(e), 'error');
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (r) => { setEditTarget(r); setShowForm(true); };
    const openAdd = () => { setEditTarget(null); setShowForm(true); };

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Wrench size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Servisne popravke</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Evidencija svih popravki i servisa vozila</p>
                        </div>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 self-start sm:self-auto"
                        onClick={openAdd}
                        disabled={!!error}
                    >
                        <Plus size={15} /> Dodaj popravku
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-6">
                {loading && <Spinner />}
                {error && <ErrorState message={error} onRetry={refetch} />}

                {!loading && !error && (
                    <>
                        <div className="flex items-center gap-3 mb-5">
                            <select
                                className="flex-1 min-w-0 text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-colors"
                                value={filterVehicle}
                                onChange={e => setFilterVehicle(e.target.value)}
                            >
                                <option value="">Sva vozila</option>
                                {(vehicles || []).map(v => (
                                    <option key={v.vehicleId} value={v.vehicleId}>
                                        {v.brand} {v.model} ({v.registrationNumber})
                                    </option>
                                ))}
                            </select>
                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0">{filtered.length} popravki</span>
                        </div>
                        <RepairTable repairs={filtered} onEdit={openEdit} onDelete={setDeleteTarget} />
                    </>
                )}
            </div>

            <Modal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditTarget(null); setSaveError(null); }}
                title={editTarget ? 'Uredi popravku' : 'Dodaj popravku'}
            >
                <RepairForm
                    initial={editTarget}
                    vehicles={vehicles || []}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditTarget(null); setSaveError(null); }}
                    loading={saving}
                    submitError={saveError}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Obriši popravku"
                message={deleteTarget ? `Sigurno želiš obrisati ovu popravku za ${deleteTarget.vehicle?.brand} ${deleteTarget.vehicle?.model}?` : ''}
                loading={deleting}
            />
        </div>
    );
}
