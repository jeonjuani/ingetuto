import React from 'react';
import { DisponibilidadMensualDTO } from '../services/disponibilidadService';
import { FaTimes as FaTimesIcon, FaTrash as FaTrashIcon, FaExchangeAlt as FaExchangeAltIcon } from 'react-icons/fa';

const FaTimes: any = FaTimesIcon;
const FaTrash: any = FaTrashIcon;
const FaExchangeAlt: any = FaExchangeAltIcon;

interface DayDetailModalProps {
    date: Date;
    blocks: DisponibilidadMensualDTO[];
    onClose: () => void;
    onBlockDelete: (blockId: number) => void;
    onModalityChange: (blockId: number, newModality: string) => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
    date,
    blocks,
    onClose,
    onBlockDelete,
    onModalityChange
}) => {
    // Sort blocks by time
    const sortedBlocks = [...blocks].sort((a, b) =>
        a.horaInicio.localeCompare(b.horaInicio)
    );

    const formatDate = (date: Date) => {
        const str = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h3 style={{ marginBottom: '4px' }}>Detalle del Día</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{formatDate(date)}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="blocks-list">
                    {sortedBlocks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
                            <p style={{ margin: 0 }}>No hay bloques de disponibilidad para este día.</p>
                        </div>
                    ) : (
                        sortedBlocks.map(block => (
                            <div key={block.idDisponibilidadMensual} className="block-item">
                                <div className="block-info">
                                    <span className="block-time">
                                        {block.horaInicio.substring(0, 5)} - {block.horaFin.substring(0, 5)}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <span className={`block-status status-${block.estado.toLowerCase()}`}>
                                            {block.estado}
                                        </span>
                                        <span style={{ 
                                            fontSize: '11px', 
                                            fontWeight: '700', 
                                            color: '#64748b',
                                            backgroundColor: '#f1f5f9',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {block.modalidad}
                                        </span>
                                    </div>
                                </div>

                                <div className="block-actions">
                                    {block.estado === 'DISPONIBLE' ? (
                                        <>
                                            <button
                                                className="action-btn"
                                                style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                                                onClick={() => onModalityChange(
                                                    block.idDisponibilidadMensual,
                                                    block.modalidad === 'VIRTUAL' ? 'PRESENCIAL' : 'VIRTUAL'
                                                )}
                                                title="Cambiar Modalidad"
                                            >
                                                <FaExchangeAlt />
                                            </button>
                                            <button
                                                className="action-btn btn-delete"
                                                onClick={() => onBlockDelete(block.idDisponibilidadMensual)}
                                                title="Eliminar Bloque"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    ) : (
                                        <span style={{ 
                                            fontSize: '11px', 
                                            color: '#94a3b8', 
                                            fontWeight: '600',
                                            backgroundColor: '#f8fafc',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            border: '1px dashed #e2e8f0'
                                        }}>
                                            BLOQUEADO
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayDetailModal;
