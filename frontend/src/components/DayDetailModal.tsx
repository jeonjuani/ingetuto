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
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{formatDate(date)}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="blocks-list">
                    {sortedBlocks.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            No hay bloques de disponibilidad para este día.
                        </p>
                    ) : (
                        sortedBlocks.map(block => (
                            <div key={block.idDisponibilidadMensual} className="block-item">
                                <div className="block-info">
                                    <span className="block-time">
                                        {block.horaInicio.substring(0, 5)} - {block.horaFin.substring(0, 5)}
                                    </span>
                                    <span style={{ fontSize: '14px', color: '#555' }}>
                                        Modalidad: <strong>{block.modalidad}</strong>
                                    </span>
                                    <span className={`block-status status-${block.estado.toLowerCase()}`}>
                                        {block.estado}
                                    </span>
                                </div>

                                <div className="block-actions">
                                    {block.estado === 'DISPONIBLE' && (
                                        <>
                                            <button
                                                className="action-btn btn-edit"
                                                onClick={() => onModalityChange(
                                                    block.idDisponibilidadMensual,
                                                    block.modalidad === 'VIRTUAL' ? 'PRESENCIAL' : 'VIRTUAL'
                                                )}
                                                title="Cambiar Modalidad"
                                            >
                                                <FaExchangeAlt /> Cambiar
                                            </button>
                                            <button
                                                className="action-btn btn-delete"
                                                onClick={() => onBlockDelete(block.idDisponibilidadMensual)}
                                                title="Eliminar Bloque"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                    {(block.estado === 'RESERVADO' || block.estado === 'OCUPADO') && (
                                        <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                                            No modificable
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
