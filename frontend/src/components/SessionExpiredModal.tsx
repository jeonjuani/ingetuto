import React from 'react';
import './SessionExpiredModal.css';

interface SessionExpiredModalProps {
    onConfirm: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onConfirm }) => {
    return (
        <div className="session-expired-overlay">
            <div className="session-expired-card">
                <h2>Sesión Expirada</h2>
                <p>
                    Tu sesión ha expirado por inactividad.
                    Por favor, inicia sesión nuevamente para continuar.
                </p>
                <button onClick={onConfirm} className="session-expired-btn">
                    Ir al Login
                </button>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
