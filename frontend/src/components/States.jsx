import React from 'react';

export function Spinner({ label = 'Učitavanje...' }) {
    return (
        <div className="spinner-wrap">
            <div className="spinner" />
            <span className="spinner-label">{label}</span>
        </div>
    );
}

export function EmptyState({ icon = '📭', title, message }) {
    return (
        <div className="empty-state">
            <span className="empty-icon">{icon}</span>
            <h3 className="empty-title">{title}</h3>
            {message && <p className="empty-message">{message}</p>}
        </div>
    );
}

function UnpluggedIllustration() {
    return (
        <svg width="260" height="120" viewBox="0 0 680 320" role="img" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
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
        <div className="error-state">
            {isUnavailable ? (
                <UnpluggedIllustration />
            ) : (
                <div className="error-icon-wrap">
                    <span className="error-icon-big">⚠️</span>
                </div>
            )}
            <h3 className="error-title" style={{ marginTop: isUnavailable ? '12px' : undefined }}>
                {isUnavailable ? 'Servis nije dostupan' : 'Došlo je do greške'}
            </h3>
            <p className="error-desc">
                {isUnavailable
                    ? 'Trenutno ne možemo uspostaviti vezu sa serverom. Molimo provjerite da li je servis pokrenut i pokušajte ponovo.'
                    : (message || 'Došlo je do neočekivane greške.')}
            </p>
            {onRetry && (
                <button className="btn btn-outline" onClick={onRetry}>
                    🔄 Pokušaj ponovo
                </button>
            )}
        </div>
    );
}