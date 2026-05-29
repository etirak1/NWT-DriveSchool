import React, { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { repairApi, vehicleApi } from '../services/api';
import RepairTable from '../components/RepairTable';
import RepairForm from '../components/RepairForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner, ErrorState } from '../components/States';
import { useToast } from '../context/ToastContext';

export default function RepairsPage() {
    const { showToast } = useToast();
    const { data: repairs, loading, error, refetch } = useAsync(() => repairApi.getAll());
    const { data: vehicles } = useAsync(() => vehicleApi.getAll());

    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filterVehicle, setFilterVehicle] = useState('');

    const filtered = (repairs || []).filter(r =>
        !filterVehicle || r.vehicle?.vehicleId === Number(filterVehicle)
    );

    const handleSubmit = async (data) => {
        setSaving(true);
        try {
            if (editTarget) {
                await repairApi.update(editTarget.repairId, data);
                showToast('Popravka ažurirana!', 'success');
            } else {
                await repairApi.create(data);
                showToast('Popravka dodana!', 'success');
            }
            setShowForm(false);
            setEditTarget(null);
            refetch();
        } catch (e) {
            showToast(`Greška: ${e.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await repairApi.delete(deleteTarget.repairId);
            showToast('Popravka obrisana.', 'success');
            refetch();
        } catch (e) {
            showToast(`Greška: ${e.message}`, 'error');
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
                <button className="btn btn-primary" onClick={openAdd}>+ Dodaj popravku</button>
            </div>

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

            {loading && <Spinner />}
            {error && <ErrorState message={error} onRetry={refetch} />}
            {!loading && !error && (
                <RepairTable
                    repairs={filtered}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                />
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
            />
        </div>
    );
}