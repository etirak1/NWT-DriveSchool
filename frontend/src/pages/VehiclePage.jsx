import React, { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
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
    const { data: vRes, loading, error, refetch } = useAsync(() => vehicleApi.getAll());
    const { data: rRes } = useAsync(() => repairApi.getAll());

    const vehicles = vRes?.data || [];
    const repairs = rRes?.data || [];

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
            refetch();
        } catch (e) {
            addToast(getErrorMessage(e), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await vehicleApi.delete(deleteTarget.vehicleId);
            addToast('Vozilo obrisano.', 'success');
            setDeleteTarget(null);
            refetch();
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
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Vozila</h1>
                    <p className="page-sub">Upravljanje voznim parkom autoškole</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd} disabled={!!error}>+ Dodaj vozilo</button>
            </div>

            {loading && <Spinner />}
            {error && <ErrorState message={error} onRetry={refetch} />}
            {!loading && !error && (
                <>
                    <div className="page-toolbar">
                        <input
                            className="search-input"
                            placeholder="Pretraži vozila..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <span className="toolbar-count">{filtered.length} vozila</span>
                    </div>
                    <VehicleTable
                        vehicles={filtered}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onView={setViewTarget}
                    />
                </>
            )}

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

            <VehicleDetail
                vehicle={viewTarget}
                repairs={repairs}
                onClose={() => setViewTarget(null)}
            />

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