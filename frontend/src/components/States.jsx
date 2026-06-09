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

export function ErrorState({ message, onRetry }) {
    const isUnavailable =
        !message ||
        message.toLowerCase().includes('nije dostupan') ||
        message.toLowerCase().includes('uspostaviti vezu') ||
        message.toLowerCase().includes('unavailable') ||
        message.toLowerCase().includes('internal server error') ||
        message.toLowerCase().includes('serverska greška');

    return (
        <div className="error-state">
            <div className="error-icon-wrap">
                <span className="error-icon-big">{isUnavailable ? '🔌' : '⚠️'}</span>
            </div>
            <h3 className="error-title">
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