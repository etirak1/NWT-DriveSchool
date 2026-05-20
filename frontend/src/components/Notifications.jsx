import React from 'react';

export function ToastContainer({ toasts, onRemove }) {
    if (!toasts.length) return null;
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span>{t.message}</span>
                    <button className="toast-close" onClick={() => onRemove(t.id)}>×</button>
                </div>
            ))}
        </div>
    );
}

export function Alert({ type = 'info', children, onClose }) {
    return (
        <div className={`alert alert-${type}`}>
            <div className="alert-content">{children}</div>
            {onClose && <button className="alert-close" onClick={onClose}>×</button>}
        </div>
    );
}

export function Badge({ children, variant = 'default' }) {
    return <span className={`badge badge-${variant}`}>{children}</span>;
}