import React, { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { instructorApi } from '../services/api';
import { Spinner, ErrorState } from '../components/States';
import { useToast } from '../context/ToastContext';

export default function InstructorsPage() {
    const { showToast } = useToast();
    const { data: instructors, loading, error, refetch } = useAsync(() => instructorApi.getAll());
    console.log(instructors);
    const [search, setSearch] = useState('');

    const filtered = (instructors || []).filter(i =>
        `${i.user?.firstName || ''} ${i.user?.lastName || ''}`.toLowerCase().includes(search.toLowerCase())
    );

    const isAvailable = (ins) => ins.availabilityNote === 'AVAILABLE';

    const handleToggleAvailability = async (instructor) => {
        try {
            const newNote = isAvailable(instructor) ? 'UNAVAILABLE' : 'AVAILABLE';
            await instructorApi.updateAvailability(instructor.instructorId, newNote);
            showToast(
                `${instructor.user?.firstName} označen kao ${newNote === 'AVAILABLE' ? 'dostupan' : 'nedostupan'}.`,
                'success'
            );
            refetch();
        } catch (e) {
            showToast(`Greška: ${e.message}`, 'error');
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Instruktori</h1>
                    <p className="page-sub">Pregled i upravljanje dostupnošću instruktora</p>
                </div>
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
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Ime i prezime</th>
                            <th>Email</th>
                            <th>Dostupnost</th>
                            <th>Akcija</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(ins => (
                            <tr key={ins.instructorId}>
                                <td>
                                    <div className="instructor-name">
                                        <div className="avatar">
                                            {ins.user?.firstName?.[0]}{ins.user?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <strong>{ins.user?.firstName} {ins.user?.lastName}</strong>
                                            <div style={{fontSize: '12px', color: 'var(--text2)'}}>
                                                {ins.availabilityNote || '—'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{ins.user?.email || '—'}</td>
                                <td>
            <span className={`badge ${isAvailable(ins) ? 'badge-status-active' : 'badge-status-inactive'}`}>
                {isAvailable(ins) ? '✓ Dostupan' : '✗ Nedostupan'}
            </span>
                                </td>
                                <td>
                                    <button
                                        className={`btn btn-sm ${isAvailable(ins) ? 'btn-danger' : 'btn-primary'}`}
                                        onClick={() => handleToggleAvailability(ins)}
                                    >
                                        {isAvailable(ins) ? 'Označi nedostupnim' : 'Označi dostupnim'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}