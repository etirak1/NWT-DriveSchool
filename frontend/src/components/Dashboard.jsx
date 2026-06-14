import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Wrench, ClipboardList, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { isExpiringSoon, isExpired, daysUntil, formatDate } from '../utils/helpers';
import { Alert, Badge } from './Notifications';

const STAT_VARIANT = {
    '':           { card: 'border-slate-200',  iconBg: 'bg-blue-50 border-blue-100',    iconText: 'text-blue-600',  valueText: 'text-slate-900' },
    'card-warning': { card: 'border-amber-200', iconBg: 'bg-amber-50 border-amber-100',  iconText: 'text-amber-600', valueText: 'text-amber-700' },
    'card-danger':  { card: 'border-red-200',   iconBg: 'bg-red-50 border-red-100',      iconText: 'text-red-600',   valueText: 'text-red-700'   },
};

const STAT_ICONS = {
    '🚗': <Car size={20} />,
    '🔧': <Wrench size={20} />,
    '📋': <ClipboardList size={20} />,
    '👨‍🏫': <Users size={20} />,
};

function StatCard({ icon, label, value, sub, variant = '' }) {
    const cfg = STAT_VARIANT[variant] || STAT_VARIANT[''];
    const lucideIcon = STAT_ICONS[icon];

    return (
        <div className={`bg-white rounded-xl sm:rounded-2xl border shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 ${cfg.card}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 ${cfg.iconBg} ${cfg.iconText}`}>
                {lucideIcon
                    ? <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">{lucideIcon}</span>
                    : <span className="text-sm sm:text-base leading-none">{icon}</span>
                }
            </div>
            <div className="min-w-0 w-full">
                <div className={`text-xl sm:text-2xl font-bold leading-none ${cfg.valueText}`}>{value}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide leading-tight">{label}</div>
                {sub && <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

export default function Dashboard({ vehicles = [], repairs = [], instructors = [] }) {
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    const safeInstructors = Array.isArray(instructors) ? instructors : [];

    const activeVehicles = safeVehicles.filter(v => v.status === 'ACTIVE').length;
    const onService = safeVehicles.filter(v => v.status === 'IN_SERVICE').length;
    const expiring = safeVehicles.filter(v => isExpiringSoon(v.registrationExpiry));
    const expired = safeVehicles.filter(v => isExpired(v.registrationExpiry));
    const unavailableInstructors = safeInstructors.filter(i => i.availabilityNote === 'UNAVAILABLE').length;

    return (
        <div className="space-y-5">

            {/* Alerts */}
            {(expired.length > 0 || expiring.length > 0 || onService > 0) && (
                <div className="space-y-2">
                    {expired.length > 0 && (
                        <Alert type="danger">
                            <strong>{expired.length} vozilo/a</strong> ima isteklu registraciju!
                            <div className="flex flex-wrap gap-1 mt-1">
                                {expired.map(v => (
                                    <span key={v.vehicleId} className="inline-flex items-center gap-1 text-xs bg-red-100 border border-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">
                                        {v.brand} {v.model} ({v.registrationNumber})
                                    </span>
                                ))}
                            </div>
                        </Alert>
                    )}

                    {expiring.length > 0 && (
                        <Alert type="warning">
                            <strong>{expiring.length} vozilo/a</strong> ima registraciju koja ističe u narednih 15 dana:
                            <div className="flex flex-wrap gap-1 mt-1">
                                {expiring.map(v => (
                                    <span key={v.vehicleId} className="inline-flex items-center gap-1 text-xs bg-amber-100 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                                        {v.brand} {v.model} — još {daysUntil(v.registrationExpiry)} dan/a
                                    </span>
                                ))}
                            </div>
                        </Alert>
                    )}

                    {vehicles.filter(v => v.status === 'IN_SERVICE').map(v => (
                        <Alert key={v.vehicleId} type="info">
                            <strong>{v.brand} {v.model}</strong> je trenutno na servisu i nedostupno.
                        </Alert>
                    ))}
                </div>
            )}

            {/* Stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <StatCard
                    icon="🚗"
                    label="Aktivna vozila"
                    value={activeVehicles}
                    sub={`od ukupno ${safeVehicles.length}`}
                />
                <StatCard
                    icon="🔧"
                    label="Na servisu"
                    value={onService}
                    variant={onService > 0 ? 'card-warning' : ''}
                />
                <StatCard
                    icon="📋"
                    label="Ističe registracija"
                    value={expiring.length + expired.length}
                    variant={expired.length > 0 ? 'card-danger' : expiring.length > 0 ? 'card-warning' : ''}
                />
                <StatCard
                    icon="👨‍🏫"
                    label="Nedostupni instruktori"
                    value={`${unavailableInstructors}/${safeInstructors.length}`}
                    variant={unavailableInstructors > 0 ? 'card-warning' : ''}
                />
            </div>

            {/* Lists */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
                {(expiring.length > 0 || expired.length > 0) && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                            <AlertTriangle size={15} className="text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-800">Registracije — hitno</h3>
                            <span className="ml-auto text-xs font-semibold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                                {expired.length + expiring.length}
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {[...expired, ...expiring].map(v => (
                                <div key={v.vehicleId} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{v.brand} {v.model}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{v.registrationNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-slate-400">{formatDate(v.registrationExpiry)}</span>
                                        <Badge variant={isExpired(v.registrationExpiry) ? 'danger' : 'warning'}>
                                            {isExpired(v.registrationExpiry) ? 'Istekla' : `${daysUntil(v.registrationExpiry)}d`}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Link to="/resources/instructors" className="block no-underline">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer h-full">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Users size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-slate-900">Pregled svih instruktora</p>
                            <p className="text-xs text-slate-400 mt-0.5">Upravljanje dostupnošću i vozilima</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
