import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDate, repairStatusLabel } from '../utils/helpers';
import { Badge } from './Notifications';

const STATUS_VARIANT = {
    PLANNED: 'info', PENDING: 'warning', IN_PROGRESS: 'primary', COMPLETED: 'success',
};

export default function RepairTable({ repairs, onEdit, onDelete }) {
    if (!repairs?.length) return (
        <div className="py-12 text-center text-sm text-slate-400">Nema popravki za prikaz.</div>
    );

    return (
        <div className="rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Vozilo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Datum</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Opis</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Cijena</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Akcije</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                {repairs.map(r => (
                    <tr key={r.repairId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                            <p className="font-semibold text-slate-800">{r.vehicle?.brand} {r.vehicle?.model}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{r.vehicle?.registrationNumber}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{formatDate(r.repairDate)}</td>
                        <td className="px-4 py-3.5 max-w-xs">
                            <p className="text-slate-700 truncate">{r.description}</p>
                        </td>
                        <td className="px-4 py-3.5">
                            {r.cost
                                ? <span className="font-semibold text-slate-800">{r.cost} KM</span>
                                : <span className="text-slate-400">—</span>
                            }
                        </td>
                        <td className="px-4 py-3.5">
                            <Badge variant={STATUS_VARIANT[r.status] || 'default'}>
                                {repairStatusLabel(r.status)}
                            </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                                <button
                                    title="Uredi"
                                    onClick={() => onEdit(r)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    title="Obriši"
                                    onClick={() => onDelete(r)}
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
