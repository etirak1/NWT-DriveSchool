import React from 'react';
import { Link } from 'react-router-dom'; // 1. DODANO: Uvoz Link komponente za SPA navigaciju
import {
    isExpiringSoon,
    isExpired,
    daysUntil,
    formatDate
} from '../utils/helpers';

import { Alert, Badge } from './Notifications';

function StatCard({ icon, label, value, sub, variant = '' }) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="stat-icon">{icon}</div>

            <div className="stat-body">
                <div className="stat-value">{value}</div>

                <div className="stat-label">{label}</div>

                {sub && (
                    <div className="stat-sub">
                        {sub}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({
                                      vehicles = [],
                                      repairs = [],
                                      instructors = []
                                  }) {

    // ... (tvoja postojeća logika za filtriranje vozila i instruktora) ...
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
    const onService = vehicles.filter(v => v.status === 'IN_SERVICE').length;
    const expiring = vehicles.filter(v => isExpiringSoon(v.registrationExpiry));
    const expired = vehicles.filter(v => isExpired(v.registrationExpiry));
    const busyInstructors = instructors.filter(i => !i.available).length;

    return (
        <div className="dashboard">

            {/* 2. DODANO: ZAGLAVLJE SA DUGMETOM ZA FINANSIJE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="page-title">Pregled sistema</h2>
                <Link to="/finance" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    💰 Otvori Finansije
                </Link>
            </div>

            {/* Alertele (expired, expiring, service) - ostaju iste */}
            {expired.length > 0 && (
                <Alert type="danger">
                    ⛔ <strong>{expired.length} vozilo/a</strong> ima isteklu registraciju!
                    {expired.map(vehicle => (
                        <span key={vehicle.vehicleId} className="alert-item">
                            {vehicle.brand} {vehicle.model} ({vehicle.registrationNumber})
                        </span>
                    ))}
                </Alert>
            )}

            {/* STATISTIKE */}
            <div className="stat-grid">

                {/* 3. OPCIONALNO: DODANA I KARTICA ZA FINANSIJE U GRID */}
                <Link to="/finance" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <StatCard
                        icon="💳"
                        label="Uplate i Finansije"
                        value="Pregled"
                        sub="Evidencija prihoda"
                        variant="card-info"
                    />
                </Link>

                <StatCard
                    icon="🚗"
                    label="Aktivna vozila"
                    value={activeVehicles}
                    sub={`od ukupno ${vehicles.length}`}
                />

                <StatCard
                    icon="🔧"
                    label="Na servisu"
                    value={onService}
                    variant={onService > 0 ? 'card-warning' : ''}
                />

                <StatCard
                    icon="👨‍🏫"
                    label="Instruktori zauzeti"
                    value={`${busyInstructors}/${instructors.length}`}
                    sub="trenutno aktivni"
                />
            </div>

            {/* ... Ostatak tvojih listi (registracije, instruktori) ostaje isti ... */}
            <div className="dashboard-lists">
                {/* ... tvoj postojeći kod ... */}
            </div>
        </div>
    );
}