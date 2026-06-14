import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { formatDate, daysUntil, isExpiringSoon, isExpired, vehicleStatusLabel, vehicleStatusColor } from '../utils/helpers';
import { Badge } from './Notifications';

function RegBadge({ dateStr }) {
    const days = daysUntil(dateStr);
    if (days === null) return <span className="text-slate-400">—</span>;
    if (isExpired(dateStr)) return <Badge variant="danger">Istekla</Badge>;
    if (isExpiringSoon(dateStr)) return <Badge variant="warning">Ističe za {days}d</Badge>;
    return <span className="text-sm text-slate-600">{formatDate(dateStr)}</span>;
}

export default function VehicleTable({ vehicles, onEdit, onDelete, onView }) {
    if (!vehicles?.length) return (
        <div className="py-12 text-center text-sm text-slate-400">Nema vozila za prikaz.</div>
    );

    return (
        <div className="rounded-xl overflow-x-auto border border-slate-200">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Vozilo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Registracija</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Istek reg.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Tehn. pregled</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Akcije</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                {vehicles.map(v => (
                    <tr
                        key={v.vehicleId}
                        className={`transition-colors hover:bg-slate-50/60 ${
                            isExpired(v.registrationExpiry)
                                ? 'border-l-2 border-red-400'
                                : isExpiringSoon(v.registrationExpiry)
                                    ? 'border-l-2 border-amber-400'
                                    : ''
                        }`}
                    >
                        <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-base">
                                    🚗
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{v.brand} {v.model}</p>
                                    {v.year && <p className="text-xs text-slate-400">{v.year}</p>}
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3.5">
                            <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">{v.registrationNumber}</code>
                        </td>
                        <td className="px-4 py-3.5"><RegBadge dateStr={v.registrationExpiry} /></td>
                        <td className="px-4 py-3.5">
                            <Badge variant={vehicleStatusColor(v.status)}>{vehicleStatusLabel(v.status)}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{formatDate(v.lastTechnicalInspection)}</td>
                        <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                                <button
                                    title="Detalji"
                                    onClick={() => onView(v)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <Eye size={15} />
                                </button>
                                <button
                                    title="Uredi"
                                    onClick={() => onEdit(v)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    title="Obriši"
                                    onClick={() => onDelete(v)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
