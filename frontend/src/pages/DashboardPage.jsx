import React from 'react';
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
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">Pregled resursa autoškole</p>
                </div>
            </div>
            <Dashboard
                vehicles={vehicles || []}
                repairs={repairs || []}
                instructors={instructors || []}
            />
        </div>
    );
}