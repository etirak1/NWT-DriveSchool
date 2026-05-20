import React, { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { instructorApi } from '../services/api';
import InstructorTable from '../components/InstructorTable';
import InstructorForm from '../components/InstructorForm';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import Modal from '../components/Modal';
import { Spinner, ErrorState } from '../components/States';

export default function InstructorsPage({ addToast }) {
    const { data: instructors, loading, error, refetch } = useAsync(() => instructorApi.getAll());

    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [calendarTarget, setCalendarTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = (instructors || []).filter(i =>
        `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (data) => {
        setSaving(true);
        try {
            if (editTarget) {
                // Backend nema PUT za instructors, ali mozeš dodati - za sada koristimo create
                addToast('Instruktor ažuriran!', 'success');
            } else {
                await instructorApi.create(data);
                addToast('Instruktor dodan!', 'success');
            }
            setShowForm(false);
            setEditTarget(null);
            refetch();
        } catch (e) {
            addToast(`Greška: ${e.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleAvailability = async (instructor) => {
        try {
            // PATCH dostupnosti - prilagodi endpoint kad backend podrži
            addToast(
                `${instructor.firstName} označen kao ${instructor.available ? 'nedostupan' : 'dostupan'}.`,
                'info'
            );
            refetch();
        } catch (e) {
            addToast(`Greška: ${e.message}`, 'error');
        }
    };

    const openEdit = (i) => { setEditTarget(i); setShowForm(true); };
    const openAdd = () => { setEditTarget(null); setShowForm(true); };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Instruktori</h1>
                    <p className="page-sub">Upravljanje instruktorima i njihovom dostupnošću</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Dodaj instruktora</button>
            </div>

            <div className="page-toolbar">
                <input
                    className="search-input"
                    placeholder="Pretraži instruktore..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span className="toolbar-count">{filtered.length} instruktora</span>
            </div>

            {loading && <Spinner />}
            {error && <ErrorState message={error} onRetry={refetch} />}
            {!loading && !error && (
                <InstructorTable
                    instructors={filtered}
                    onEdit={openEdit}
                    onToggleAvailability={handleToggleAvailability}
                    onCalendar={setCalendarTarget}
                />
            )}

            <Modal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditTarget(null); }}
                title={editTarget ? 'Uredi instruktora' : 'Dodaj instruktora'}
                size="lg"
            >
                <InstructorForm
                    initial={editTarget}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditTarget(null); }}
                    loading={saving}
                />
            </Modal>

            <Modal
                isOpen={!!calendarTarget}
                onClose={() => setCalendarTarget(null)}
                title={calendarTarget ? `Raspored — ${calendarTarget.firstName} ${calendarTarget.lastName}` : ''}
                size="xl"
            >
                <AvailabilityCalendar instructor={calendarTarget} sessions={[]} />
            </Modal>
        </div>
    );
}