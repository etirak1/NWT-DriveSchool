import React from 'react';
import { Loader2, Inbox, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export function Spinner({ label = 'Učitavanje...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <Loader2 size={26} className="text-white animate-spin" />
                </div>
            </div>
            <p className="text-sm font-medium text-slate-500 tracking-wide">{label}</p>
        </div>
    );
}

export function EmptyState({ icon, title, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 shadow-sm">
                {icon
                    ? <span className="text-2xl leading-none">{icon}</span>
                    : <Inbox size={28} className="text-blue-400" />
                }
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1.5">{title}</h3>
            {message && (
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{message}</p>
            )}
        </div>
    );
}

export function ErrorState({ message, onRetry }) {
    const isUnavailable =
        !message ||
        message.toLowerCase().includes('nije dostupan') ||
        message.toLowerCase().includes('uspostaviti vezu') ||
        message.toLowerCase().includes('unavailable') ||
        message.toLowerCase().includes('internal server error') ||
        message.toLowerCase().includes('serverska greška');

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm border ${
                isUnavailable
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-red-50 border-red-100'
            }`}>
                {isUnavailable
                    ? <WifiOff size={28} className="text-amber-400" />
                    : <AlertTriangle size={28} className="text-red-400" />
                }
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-1.5">
                {isUnavailable ? 'Servis nije dostupan' : 'Došlo je do greške'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-5">
                {isUnavailable
                    ? 'Trenutno ne možemo uspostaviti vezu sa serverom. Molimo provjerite da li je servis pokrenut i pokušajte ponovo.'
                    : (message || 'Došlo je do neočekivane greške.')}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                    <RefreshCw size={15} />
                    Pokušaj ponovo
                </button>
            )}
        </div>
    );
}
