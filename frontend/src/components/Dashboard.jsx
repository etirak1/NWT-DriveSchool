import React from 'react';
import { isExpiringSoon, isExpired, daysUntil, formatDate } from '../utils/helpers';
import { Alert, Badge } from './Notifications';

function StatCard({ icon, label, value, sub, variant = '' }) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-body">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                {sub && <div className="stat-sub">{sub}</div>}
            </div>
        </div>
    );
}

export default function Dashboard({ vehicles = [], repairs = [], instructors = [] }) {
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
    const onService = vehicles.filter(v => v.status === 'IN_SERVICE').length;
    const expiring = vehicles.filter(v => isExpiringSoon(v.registrationExpiry));
    const expired = vehicles.filter(v => isExpired(v.registrationExpiry));
    const busyInstructors = instructors.filter(i => !i.available).length;

    return (
        <div className="dashboard">
            {/* Alerts */}
            {expired.length > 0 && (
                <Alert type="danger">
                    ⛔ <strong>{expired.length} vozilo/a</strong> ima isteklu registraciju!
                    {expired.map(v => (
                        <span key={v.vehicleId} className="alert-item">
              {v.brand} {v.model} ({v.registrationNumber})
            </span>
                    ))}
                </Alert>
            )}
            {expiring.length > 0 && (
                <Alert type="warning">
                    ⚠️ <strong>{expiring.length} vozilo/a</strong> ima registraciju koja ističe u narednih 15 dana:
                    {expiring.map(v => (
                        <span key={v.vehicleId} className="alert-item">
              {v.brand} {v.model} — još {daysUntil(v.registrationExpiry)} dan/a
            </span>
                    ))}
                </Alert>
            )}
            {vehicles.filter(v => v.status === 'IN_SERVICE').map(v => (
                <Alert key={v.vehicleId} type="info">
                    🔧 <strong>{v.brand} {v.model}</strong> je trenutno na servisu i nedostupno.
                </Alert>
            ))}

            {/* Stat Cards */}
            <div className="stat-grid">
                <StatCard icon="🚗" label="Aktivna vozila" value={activeVehicles} sub={`od ukupno ${vehicles.length}`} />
                <StatCard icon="🔧" label="Na servisu" value={onService} variant={onService > 0 ? 'card-warning' : ''} />
                <StatCard icon="📋" label="Ističe registracija" value={expiring.length + expired.length}
                          variant={expired.length > 0 ? 'card-danger' : expiring.length > 0 ? 'card-warning' : ''} />
                <StatCard icon="👨‍🏫" label="Instruktori zauzeti" value={`${busyInstructors}/${instructors.length}`}
                          sub="trenutno aktivni" />
            </div>

            {/* Quick lists */}
            <div className="dashboard-lists">
                {expiring.length > 0 || expired.length > 0 ? (
                    <div className="dash-section">
                        <h3 className="dash-section-title">🚨 Registracije — hitno</h3>
                        <div className="mini-list">
                            {[...expired, ...expiring].map(v => (
                                <div key={v.vehicleId} className="mini-list-item">
                                    <span>{v.brand} {v.model}</span>
                                    <code>{v.registrationNumber}</code>
                                    <Badge variant={isExpired(v.registrationExpiry) ? 'danger' : 'warning'}>
                                        {isExpired(v.registrationExpiry) ? 'Istekla' : `${daysUntil(v.registrationExpiry)}d`}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="dash-section">
                    <h3 className="dash-section-title">👨‍🏫 Instruktori</h3>
                    <div className="mini-list">
                        {instructors.slice(0, 5).map(i => (
                            <div key={i.instructorId} className="mini-list-item">
                                <span>{i.firstName} {i.lastName}</span>
                                <Badge variant={i.available ? 'status-active' : 'status-inactive'}>
                                    {i.available ? 'Slobodan' : 'Zauzet'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}