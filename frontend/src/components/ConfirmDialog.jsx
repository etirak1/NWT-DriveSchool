import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title || 'Potvrda'} size="sm">
            <p className="confirm-message">{message}</p>
            <div className="confirm-actions">
                <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
                <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>
                    Obriši
                </button>
            </div>
        </Modal>
    );
}