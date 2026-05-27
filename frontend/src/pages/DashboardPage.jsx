import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom'; // 1. DODAJ OVAJ IMPORT
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
        <div className="main-content">
            <div className="page">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="page-sub">Pregled resursa autoškole</p>
                    </div>

                    {/* 2. DODAJ DUGME OVDJE (Pored naslova) */}
                    <Link to="/finance" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                        <span>💰</span> Finansije i Uplate
                    </Link>
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
    );
}