import React from 'react';
import {
    isExpiringSoon,
    isExpired,
    daysUntil,
    formatDate
} from '../utils/helpers';

import { Link } from 'react-router-dom';

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

    // Vozila
    const activeVehicles = vehicles.filter(
        v => v.status === 'ACTIVE'
    ).length;

    const onService = vehicles.filter(
        v => v.status === 'IN_SERVICE'
    ).length;

    // Registracije
    const expiring = vehicles.filter(
        v => isExpiringSoon(v.registrationExpiry)
    );

    const expired = vehicles.filter(
        v => isExpired(v.registrationExpiry)
    );

    // Instruktori
    const busyInstructors = instructors.filter(
        instructor => instructor.availabilityNote === 'UNAVAILABLE'
    ).length;

    console.log("Instruktori:", instructors);

    return (
        <div className="dashboard">

            {/* ISTEKLA REGISTRACIJA */}
            {expired.length > 0 && (
                <Alert type="danger">
                    ⛔ <strong>
                    {expired.length} vozilo/a
                </strong> ima isteklu registraciju!

                    {expired.map(vehicle => (
                        <span
                            key={vehicle.vehicleId}
                            className="alert-item"
                        >
                            {vehicle.brand} {vehicle.model}
                            ({vehicle.registrationNumber})
                        </span>
                    ))}
                </Alert>
            )}

            {/* USKORO ISTIČE */}
            {expiring.length > 0 && (
                <Alert type="warning">
                    ⚠️ <strong>
                    {expiring.length} vozilo/a
                </strong> ima registraciju koja ističe
                    u narednih 15 dana:

                    {expiring.map(vehicle => (
                        <span
                            key={vehicle.vehicleId}
                            className="alert-item"
                        >
                            {vehicle.brand} {vehicle.model}
                            — još {daysUntil(vehicle.registrationExpiry)} dan/a
                        </span>
                    ))}
                </Alert>
            )}

            {/* SERVIS */}
            {vehicles
                .filter(v => v.status === 'IN_SERVICE')
                .map(vehicle => (
                    <Alert
                        key={vehicle.vehicleId}
                        type="info"
                    >
                        🔧 <strong>
                        {vehicle.brand} {vehicle.model}
                    </strong> je trenutno na servisu
                        i nedostupno.
                    </Alert>
                ))}

            {/* STATISTIKE */}
            <div className="stat-grid">

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
                    variant={
                        onService > 0
                            ? 'card-warning'
                            : ''
                    }
                />

                <StatCard
                    icon="📋"
                    label="Ističe registracija"
                    value={expiring.length + expired.length}
                    variant={
                        expired.length > 0
                            ? 'card-danger'
                            : expiring.length > 0
                                ? 'card-warning'
                                : ''
                    }
                />

                <StatCard
                    icon="👨‍🏫"
                    label="Zauzeti instruktori"
                    value={`${busyInstructors}/${instructors.length}`}
                />
            </div>

            {/* LISTE */}
            <div className="dashboard-lists">

                {(expiring.length > 0 || expired.length > 0) && (
                    <div className="dash-section">

                        <h3 className="dash-section-title">
                            🚨 Registracije — hitno
                        </h3>

                        <div className="mini-list">

                            {[...expired, ...expiring].map(vehicle => (
                                <div
                                    key={vehicle.vehicleId}
                                    className="mini-list-item"
                                >

                                    <div>
                                        <strong>
                                            {vehicle.brand} {vehicle.model}
                                        </strong>

                                        <div className="mini-sub">
                                            {vehicle.registrationNumber}
                                        </div>
                                    </div>

                                    <div className="mini-right">

                                        <div className="mini-date">
                                            {formatDate(
                                                vehicle.registrationExpiry
                                            )}
                                        </div>

                                        <Badge
                                            variant={
                                                isExpired(vehicle.registrationExpiry)
                                                    ? 'danger'
                                                    : 'warning'
                                            }
                                        >
                                            {isExpired(vehicle.registrationExpiry)
                                                ? 'Istekla'
                                                : `${daysUntil(vehicle.registrationExpiry)}d`}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Link
                    to="/resources/instructors"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <StatCard
                        icon="👨‍🏫"
                        value="➡️"
                        label="Pregled svih instruktora"
                    />
                </Link>
            </div>
        </div>
    );
}