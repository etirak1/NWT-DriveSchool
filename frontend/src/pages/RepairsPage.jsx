import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { repairApi, vehicleApi } from '../services/api';
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
    const [deleting, setDeleting] = useState(false);
    const [filterVehicle, setFilterVehicle] = useState('');

    const filtered = (repairs || []).filter(r =>
        !filterVehicle || r.vehicle?.vehicleId === Number(filterVehicle)
    );

    const handleSubmit = async (data) => {
        setSaving(true);
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
            addToast(getErrorMessage(e), 'error');
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
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Servisne popravke</h1>
                    <p className="page-sub">Evidencija svih popravki i servisa vozila</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd} disabled={!!error}>+ Dodaj popravku</button>
            </div>

            {loading && <Spinner />}
            {error && <ErrorState message={error} onRetry={refetch} />}
            {!loading && !error && (
                <>
                    <div className="page-toolbar">
                        <select
                            className="search-input"
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
                        <span className="toolbar-count">{filtered.length} popravki</span>
                    </div>
                    <RepairTable
                        repairs={filtered}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                    />
                </>
            )}

            <Modal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditTarget(null); }}
                title={editTarget ? 'Uredi popravku' : 'Dodaj popravku'}
            >
                <RepairForm
                    initial={editTarget}
                    vehicles={vehicles || []}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditTarget(null); }}
                    loading={saving}
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