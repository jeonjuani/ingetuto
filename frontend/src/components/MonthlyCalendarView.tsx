import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { disponibilidadService, DisponibilidadMensualDTO } from '../services/disponibilidadService';
import { FaChevronLeft as FaChevronLeftIcon, FaChevronRight as FaChevronRightIcon, FaCalendarPlus as FaCalendarPlusIcon } from 'react-icons/fa';
import DayDetailModal from './DayDetailModal';
import ConfirmModal from './ConfirmModal';

const FaCalendarPlus: any = FaCalendarPlusIcon;
const FaChevronLeft: any = FaChevronLeftIcon;
const FaChevronRight: any = FaChevronRightIcon;

interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
}
const MonthlyCalendarView: React.FC = () => {
    const { token } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [blocks, setBlocks] = useState<DisponibilidadMensualDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

    const loadMonthData = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const mes = currentDate.getMonth() + 1;
            const anio = currentDate.getFullYear();
            const data = await disponibilidadService.obtenerMensual(mes, anio, token);
            setBlocks(data);
        } catch (error) {
            console.error('Error loading month data:', error);
        } finally {
            setLoading(false);
        }
    }, [token, currentDate]);

    useEffect(() => {
        loadMonthData();
    }, [loadMonthData]);

    const generateFromTemplate = async () => {
        if (!token) return;

        const mes = currentDate.getMonth() + 1;
        const anio = currentDate.getFullYear();
        const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        // Check if this is a regeneration
        const isRegeneration = blocks.length > 0;

        setConfirmModal({
            isOpen: true,
            title: isRegeneration ? `Regenerar calendario de ${monthName}` : `Generar disponibilidad`,
            message: isRegeneration
                ? `Ya existe un calendario generado para ${monthName}.\n\n¿Deseas REGENERARLO completamente con la plantilla actual?\n\nADVERTENCIA: Esto eliminará TODOS los bloques del mes (incluyendo DISPONIBLES, RESERVADOS y OCUPADOS) y los reemplazará con los de tu plantilla actualizada.\n\nSi existen tutorías reservadas u ocupadas, la operación será cancelada para proteger esas reservas.`
                : `¿Estás seguro de generar la disponibilidad para ${monthName}?`,
            type: isRegeneration ? 'warning' : 'info',
            onConfirm: async () => {
                setConfirmModal(null);
                try {
                    setLoading(true);
                    const response = await disponibilidadService.generarMensual(mes, anio, token);
                    setMessage({ type: 'success', text: response.mensaje });
                    loadMonthData();
                    setTimeout(() => setMessage(null), 5000);
                } catch (error: any) {
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al generar el calendario';
                    setMessage({ type: 'error', text: errorMsg });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleBlockDelete = async (blockId: number) => {
        if (!token) return;
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar bloque',
            message: '¿Estás seguro de que deseas eliminar este bloque de disponibilidad?',
            type: 'danger',
            onConfirm: async () => {
                setConfirmModal(null);
                try {
                    await disponibilidadService.eliminarBloque(blockId, token);
                    setBlocks(blocks.filter(b => b.idDisponibilidadMensual !== blockId));
                } catch (error: any) {
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al eliminar el bloque';
                    setMessage({ type: 'error', text: errorMsg });
                }
            },
        });
    };

    const handleModalityChange = async (blockId: number, newModality: string) => {
        if (!token) return;
        console.log('Changing modality for block:', blockId, 'to:', newModality);
        try {
            await disponibilidadService.modificarModalidad(blockId, newModality, token);
            console.log('Modality changed successfully');
            // Update local state
            setBlocks(blocks.map(b =>
                b.idDisponibilidadMensual === blockId
                    ? { ...b, modalidad: newModality as any }
                    : b
            ));
        } catch (error: any) {
            console.error('Error changing modality:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al cambiar la modalidad';
            alert(errorMsg);
        }
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    // Calendar generation logic
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Padding for empty days at start
        // getDay() returns 0 for Sunday, we want 0 for Monday
        let startDay = firstDay.getDay() - 1;
        if (startDay === -1) startDay = 6;

        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const getBlocksForDay = (date: Date) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        return blocks.filter(b => b.fecha === dateStr);
    };

    const days = getDaysInMonth();
    const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className="calendar-view">
            <div className="calendar-controls">
                <div className="month-nav">
                    <button className="nav-btn" onClick={() => changeMonth(-1)}>
                        <FaChevronLeft />
                    </button>
                    <h3>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h3>
                    <button className="nav-btn" onClick={() => changeMonth(1)}>
                        <FaChevronRight />
                    </button>
                </div>

                <button
                    className="save-btn"
                    onClick={generateFromTemplate}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: loading ? '#e2e8f0' : '#1e293b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: '700',
                        transition: 'all 0.2s ease',
                        boxShadow: loading ? 'none' : '0 4px 12px rgba(30, 41, 59, 0.1)'
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#334155')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1e293b')}
                >
                    <FaCalendarPlus /> 
                    {blocks.length > 0 ? 'Regenerar Calendario' : 'Generar desde Plantilla'}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '12px 20px',
                    marginBottom: '24px',
                    borderRadius: '12px',
                    backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#10b981' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>{message.type === 'success' ? '✅' : '⚠️'}</span> {message.text}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="legend" style={{ padding: '8px 16px', borderRadius: '10px' }}>
                    <div className="legend-item" title="Bloque disponible virtual">
                        <div className="color-box virtual"></div>
                        <span>Virtual</span>
                    </div>
                    <div className="legend-item" title="Bloque disponible presencial">
                        <div className="color-box presencial"></div>
                        <span>Presencial</span>
                    </div>
                    <div className="legend-item" title="Tutoría ya reservada o pagada">
                        <div className="color-box occupied"></div>
                        <span>Bloqueado por tutoría reservada</span>
                    </div>
                </div>
            </div>

            <div className="calendar-grid">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="calendar-day-header">{d}</div>
                ))}

                {days.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} className="calendar-day empty"></div>;

                    const dayBlocks = getBlocksForDay(date);
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div
                            key={date.toISOString()}
                            className="calendar-day"
                            style={{ 
                                backgroundColor: isToday ? '#eff6ff' : undefined,
                                borderColor: isToday ? '#bfdbfe' : undefined
                            }}
                            onClick={() => setSelectedDay(date)}
                        >
                            <span className="day-number" style={{ color: isToday ? '#2563eb' : undefined }}>
                                {date.getDate()}
                                {isToday && <span style={{ marginLeft: '8px', fontSize: '10px', backgroundColor: '#2563eb', color: 'white', padding: '2px 6px', borderRadius: '10px', verticalAlign: 'middle' }}>HOY</span>}
                            </span>
                            
                            <div className="day-blocks-indicator">
                                {dayBlocks.slice(0, 3).map(b => {
                                    const statusClass = b.estado === 'OCUPADO' ? 'occupied' : 
                                                      b.estado === 'RESERVADO' ? 'reserved' : 
                                                      b.modalidad.toLowerCase();
                                    return (
                                        <div
                                            key={b.idDisponibilidadMensual}
                                            className={`block-mini-item ${statusClass}`}
                                            title={`${b.horaInicio.substring(0, 5)} - ${b.modalidad} (${b.estado})`}
                                        ></div>
                                    );
                                })}
                                {dayBlocks.length > 3 && (
                                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textAlign: 'center', marginTop: '2px' }}>
                                        +{dayBlocks.length - 3} más
                                    </div>
                                )}
                            </div>
                            
                            {dayBlocks.length === 0 && (
                                <div style={{ height: '30px' }}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedDay && (
                <DayDetailModal
                    date={selectedDay}
                    blocks={getBlocksForDay(selectedDay)}
                    onClose={() => setSelectedDay(null)}
                    onBlockDelete={handleBlockDelete}
                    onModalityChange={handleModalityChange}
                />
            )}

            {/* Modal de confirmación reutilizable */}
            {confirmModal && (
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                    confirmText={confirmModal.type === 'danger' ? 'Eliminar' : blocks.length > 0 ? 'Sí, continuar' : 'Generar'}
                    cancelText="Cancelar"
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    );
};

export default MonthlyCalendarView;
