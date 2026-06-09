import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading = false }) {
    return (
        <Modal isOpen={isOpen} onClose={!loading ? onClose : undefined} title={title || 'Potvrda'} size="sm">
            <p className="confirm-message">{message}</p>
            <div className="confirm-actions">
                <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Odustani</button>
                <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                    {loading ? 'Briše se...' : 'Obriši'}
                </button>
            </div>
        </Modal>
    );
}