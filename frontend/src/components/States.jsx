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
    return (
        <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{message || 'Došlo je do greške.'}</p>
            {onRetry && <button className="btn btn-outline" onClick={onRetry}>Pokušaj ponovo</button>}
        </div>
    );
}