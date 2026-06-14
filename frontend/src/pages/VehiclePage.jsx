import React, { useState } from 'react';
import { Car, Plus, Search } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleApi, repairApi } from '../services/api';
import VehicleTable from '../components/VehicleTable';
import VehicleForm from '../components/VehicleForm';
import VehicleDetail from '../components/VehicleDetail';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner, ErrorState } from '../components/States';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/helpers';

export default function VehiclesPage() {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const { data: vehicles = [], isLoading: loading, isError: error, refetch } = useQuery({
        queryKey: ['vehicles'],
        queryFn: () => vehicleApi.getAll().then(r => r.data || []),
    });

    const { data: repairs = [] } = useQuery({
        queryKey: ['repairs'],
        queryFn: () => repairApi.getAll().then(r => r.data || []),
    });

    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = vehicles.filter(v =>
        `${v.brand} ${v.model} ${v.registrationNumber}`.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (data) => {
        setSaving(true);
        try {
            if (editTarget) {
                await vehicleApi.update(editTarget.vehicleId, data);
                addToast('Vozilo uspješno ažurirano!', 'success');
            } else {
                await vehicleApi.create(data);
                addToast('Vozilo uspješno dodano!', 'success');
            }
            setShowForm(false);
            setEditTarget(null);
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        } catch (e) {
            addToast(getErrorMessage(e), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await vehicleApi.delete(deleteTarget.vehicleId);
            addToast('Vozilo obrisano.', 'success');
            setDeleteTarget(null);
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        } catch (e) {
            addToast(getErrorMessage(e), 'error');
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (v) => { setEditTarget(v); setShowForm(true); };
    const openAdd = () => { setEditTarget(null); setShowForm(true); };

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Car size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Vozila</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Upravljanje voznim parkom autoškole</p>
                        </div>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 self-start sm:self-auto"
                        onClick={openAdd}
                        disabled={!!error}
                    >
                        <Plus size={15} /> Dodaj vozilo
                    </button>
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
                                    placeholder="Pretraži vozila..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{filtered.length} vozila</span>
                        </div>
                        <VehicleTable
                            vehicles={filtered}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                            onView={setViewTarget}
                        />
                    </>
                )}
            </div>

            <Modal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditTarget(null); }}
                title={editTarget ? 'Uredi vozilo' : 'Dodaj vozilo'}
                size="lg"
            >
                <VehicleForm
                    initial={editTarget}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditTarget(null); }}
                    loading={saving}
                />
            </Modal>

            <VehicleDetail vehicle={viewTarget} repairs={repairs} onClose={() => setViewTarget(null)} />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Obriši vozilo"
                message={deleteTarget ? `Sigurno želiš obrisati ${deleteTarget.brand} ${deleteTarget.model}?` : ''}
                loading={deleting}
            />
        </div>
    );
}
