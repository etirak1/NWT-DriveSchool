import React from 'react';
import { Pencil, RefreshCw } from 'lucide-react';
import { Badge } from './Notifications';

export default function InstructorTable({ instructors, onEdit, onToggleAvailability }) {
    if (!instructors?.length) return (
        <div className="py-12 text-center text-sm text-slate-400">Nema instruktora za prikaz.</div>
    );

    return (
        <div className="rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Ime i prezime</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Dostupnost</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Akcije</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                {instructors.map(ins => (
                    <tr key={ins.instructorId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                                        <span className="text-white font-bold text-xs">
                                            {ins.user?.firstName?.[0]}{ins.user?.lastName?.[0]}
                                        </span>
                                </div>
                                <span className="font-semibold text-slate-800">
                                        {ins.user?.firstName} {ins.user?.lastName}
                                    </span>
                            </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{ins.user?.email}</td>
                        <td className="px-4 py-3.5">
                            <Badge variant={ins.availabilityNote === 'AVAILABLE' ? 'status-active' : 'status-inactive'}>
                                {ins.availabilityNote}
                            </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                                <button
                                    title="Uredi"
                                    onClick={() => onEdit(ins)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    title="Promijeni dostupnost"
                                    onClick={() => onToggleAvailability(ins)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <RefreshCw size={15} />
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
