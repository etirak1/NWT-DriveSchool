import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading = false }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-base">{title || 'Potvrda'}</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button
                        className="px-4 py-2 text-sm text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition-colors"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Odustani
                    </button>
                    <button
                        className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-semibold transition-colors shadow-sm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Briše se...' : 'Obriši'}
                    </button>
                </div>
            </div>
        </div>
    );
}
