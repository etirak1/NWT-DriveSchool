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

function UnpluggedIllustration() {
    return (
        <svg width="100%" height="120" viewBox="0 0 680 320" role="img" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto', maxWidth: '300px' }}>
            <title>Servis nije dostupan</title>
            <style>{`
                .plug-body { fill: #5a6478; }
                .plug-head { fill: #3d4455; }
                .plug-pin  { fill: #c8b97a; }
                .cable     { fill: none; stroke: #5a6478; stroke-width: 14; stroke-linecap: round; }
                .cable-stripe { fill: none; stroke: #4a5368; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 6 8; }
                .socket-body   { fill: #e8eaf0; stroke: #c0c4d0; stroke-width: 2; }
                .socket-hole   { fill: #9aa0b4; }
                .socket-shadow { fill: #d0d4de; }
                .spark { fill: none; stroke: #f0b429; stroke-width: 2.5; stroke-linecap: round; }
            `}</style>

            {/* Left cable */}
            <path className="cable" d="M 60 155 Q 110 155 140 150 Q 170 145 195 155"/>
            <path className="cable-stripe" d="M 60 155 Q 110 155 140 150 Q 170 145 195 155"/>

            {/* Plug */}
            <rect className="plug-head" x="195" y="128" width="52" height="54" rx="6"/>
            <rect className="plug-body" x="230" y="133" width="28" height="44" rx="4"/>
            <rect className="plug-pin" x="248" y="120" width="7" height="22" rx="3"/>
            <rect className="plug-pin" x="260" y="120" width="7" height="22" rx="3"/>

            {/* Sparks */}
            <path className="spark" d="M 300 148 L 308 155 L 302 162"/>
            <path className="spark" d="M 316 143 L 322 152 L 314 158"/>
            <circle cx="311" cy="145" r="2.5" fill="#f0b429" opacity="0.8"/>
            <circle cx="305" cy="165" r="1.5" fill="#f0b429" opacity="0.6"/>

            {/* Socket */}
            <rect className="socket-body" x="350" y="115" width="70" height="80" rx="10"/>
            <rect className="socket-shadow" x="356" y="121" width="58" height="68" rx="7"/>
            <rect className="socket-hole" x="368" y="138" width="9" height="18" rx="4"/>
            <rect className="socket-hole" x="383" y="138" width="9" height="18" rx="4"/>
            <ellipse className="socket-hole" cx="385" cy="170" rx="5" ry="4"/>

            {/* Right cable */}
            <path className="cable" d="M 420 155 Q 460 155 500 148 Q 540 140 580 152"/>
            <path className="cable-stripe" d="M 420 155 Q 460 155 500 148 Q 540 140 580 152"/>

            {/* Wall */}
            <rect x="430" y="100" width="6" height="110" rx="3" fill="#d0d4de" opacity="0.5"/>
        </svg>
    );
}

export function ErrorState({ message, onRetry }) {
    const msg = typeof message === 'string' ? message.toLowerCase() : '';
    const isUnavailable =
        !message ||
        typeof message !== 'string' ||
        msg.includes('greška pri učitavanju') ||
        msg.includes('nije dostupan') ||
        msg.includes('uspostaviti vezu') ||
        msg.includes('unavailable') ||
        msg.includes('internal server error') ||
        msg.includes('serverska greška') ||
        msg.includes('network') ||
        msg.includes('econnrefused');

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {isUnavailable ? (
                <UnpluggedIllustration />
            ) : (
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5 shadow-sm">
                    <span className="text-2xl leading-none">⚠️</span>
                </div>
            )}
            <h3 className="text-lg font-semibold text-slate-800 mb-1.5" style={{ marginTop: isUnavailable ? '12px' : undefined }}>
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
