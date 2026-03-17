import React, { useEffect } from 'react';
import { FaExclamationTriangle as FaExclamationTriangleIcon } from 'react-icons/fa';

const FaExclamationTriangle: any = FaExclamationTriangleIcon;

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning',
    onConfirm,
    onCancel,
}) => {
    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onCancel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const colors = {
        warning: {
            icon: <FaExclamationTriangle style={{color: '#C0392B', fontSize: '22px'}} />,
            confirmBg: '#006837',
            confirmHover: '#004d28',
            accent: '#008148',
            headerBorder: '#008148',
        },
        danger: {
            icon: <FaExclamationTriangle style={{color: '#c0392b', fontSize: '22px'}} />,
            confirmBg: '#c0392b',
            confirmHover: '#962d22',
            accent: '#e74c3c',
            headerBorder: '#e74c3c',
        },
        info: {
            icon: <FaExclamationTriangle style={{color: '#008148', fontSize: '22px'}} />,
            confirmBg: '#006837',
            confirmHover: '#004d28',
            accent: '#008148',
            headerBorder: '#008148',
        },
    };

    const c = colors[type];

    // Separar el mensaje en párrafos por \n\n
    const paragraphs = message.split('\n\n').filter(p => p.trim());

    return (
        <div
            onClick={onCancel}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '20px',
                backdropFilter: 'blur(2px)',
                animation: 'fadeIn 0.15s ease',
            }}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
                .confirm-btn:hover { opacity: 0.88; transform: translateY(-1px); }
                .confirm-btn:active { transform: translateY(0); }
                .cancel-btn:hover { background-color: #f0f0f0 !important; }
            `}</style>

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '480px',
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    animation: 'slideUp 0.2s ease',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: `3px solid ${c.headerBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <span style={{ fontSize: '22px' }}>{c.icon}</span>
                    <h3 style={{
                        margin: 0,
                        color: '#034732',
                        fontSize: '17px',
                        fontWeight: '700',
                    }}>
                        {title}
                    </h3>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px' }}>
                    {paragraphs.map((p, i) => (
                        <p key={i} style={{
                            margin: i < paragraphs.length - 1 ? '0 0 12px 0' : '0',
                            color: p.startsWith('ADVERTENCIA') ? '#8B0000' : '#555',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            backgroundColor: p.startsWith('ADVERTENCIA') ? '#fff3f3' : 'transparent',
                            padding: p.startsWith('ADVERTENCIA') ? '10px 12px' : '0',
                            borderRadius: p.startsWith('ADVERTENCIA') ? '6px' : '0',
                            borderLeft: p.startsWith('ADVERTENCIA') ? '3px solid #c0392b' : 'none',
                        }}>
                            {p}
                        </p>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 24px 20px',
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                }}>
                    <button
                        className="cancel-btn"
                        onClick={onCancel}
                        style={{
                            padding: '9px 20px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            color: '#555',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="confirm-btn"
                        onClick={onConfirm}
                        style={{
                            padding: '9px 22px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: c.confirmBg,
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;