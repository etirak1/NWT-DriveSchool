import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { vehicleApi, repairApi, instructorApi } from '../services/api';
import Dashboard from '../components/Dashboard';
import { Spinner, ErrorState } from '../components/States';

export default function DashboardPage() {
    const { data: vehicles, loading: lv, error: ev } = useAsync(() => vehicleApi.getAll());
    const { data: repairs, loading: lr } = useAsync(() => repairApi.getAll());
    const { data: instructors, loading: li } = useAsync(() => instructorApi.getAll());

    const loading = lv || lr || li;

    if (loading) return <Spinner label="Učitavanje dashboarda..." />;
    if (ev) return <ErrorState message={ev} />;

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link
                        to="/dashboard"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px', textDecoration: 'none' }}
                    >
                        ← Back to Dashboard
                    </Link>
                    <div style={{ width: '140px' }} />
                </div>
            </header>

            <div className="main-content">
                <div className="page">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Pregled resursa autoškole</h1>
                        </div>
                    </div>
                    <div className="dashboard">
                        <Dashboard
                            vehicles={vehicles || []}
                            repairs={repairs || []}
                            instructors={instructors || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}