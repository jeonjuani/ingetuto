import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { disponibilidadService, DisponibilidadMensualDTO } from '../services/disponibilidadService';
import { FaChevronLeft as FaChevronLeftIcon, FaChevronRight as FaChevronRightIcon, FaCalendarPlus as FaCalendarPlusIcon } from 'react-icons/fa';
import DayDetailModal from './DayDetailModal';

const FaChevronLeft: any = FaChevronLeftIcon;
const FaChevronRight: any = FaChevronRightIcon;
const FaCalendarPlus: any = FaCalendarPlusIcon;

const MonthlyCalendarView: React.FC = () => {
    const { token } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [blocks, setBlocks] = useState<DisponibilidadMensualDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [deadline, setDeadline] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadMonthData();
    }, [currentDate]);

    const loadMonthData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const mes = currentDate.getMonth() + 1;
            const anio = currentDate.getFullYear();
            const data = await disponibilidadService.obtenerMensual(mes, anio, token);
            setBlocks(data);

            // Calculate deadline for this month (last day of previous month)
            const prevMonth = new Date(anio, mes - 2, 1); // mes is 1-based
            const lastDayPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
            setDeadline(lastDayPrevMonth.toLocaleDateString());

        } catch (error) {
            console.error('Error loading month data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateFromTemplate = async () => {
        if (!token) return;

        const mes = currentDate.getMonth() + 1;
        const anio = currentDate.getFullYear();
        const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        // Check if this is a regeneration
        const isRegeneration = blocks.length > 0;

        let confirmMessage = '';
        if (isRegeneration) {
            confirmMessage = `Ya existe un calendario generado para ${monthName}.\n\n` +
                `¿Deseas REGENERARLO completamente con la plantilla actual?\n\n` +
                `ADVERTENCIA: Esto eliminará TODOS los bloques del mes (incluyendo DISPONIBLES, RESERVADOS y OCUPADOS) ` +
                `y los reemplazará con los de tu plantilla actualizada.\n\n` +
                `Si existen tutorías reservadas u ocupadas, la operación será cancelada para proteger esas reservas.`;
        } else {
            confirmMessage = `¿Estás seguro de generar la disponibilidad para ${monthName}?`;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setLoading(true);
            const response = await disponibilidadService.generarMensual(mes, anio, token);

            setMessage({ type: 'success', text: response.mensaje });
            loadMonthData(); // Reload to see new blocks

            setTimeout(() => setMessage(null), 5000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleBlockDelete = async (blockId: number) => {
        if (!token) return;
        if (!window.confirm('¿Eliminar este bloque de disponibilidad?')) return;

        try {
            await disponibilidadService.eliminarBloque(blockId, token);
            // Remove from local state
            setBlocks(blocks.filter(b => b.idDisponibilidadMensual !== blockId));
            // Also update selected day view if open
            if (selectedDay) {
                // The modal uses the blocks prop which comes from state, so it will update automatically
            }
        } catch (error: any) {
            alert(error.message);
        }
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
            alert(error.message);
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
    const isDeadlinePassed = () => {
        // Logic: Deadline is last day of PREVIOUS month
        // So if we are in Dec, deadline was Nov 30.
        // If today > Nov 30, we cannot generate for Dec.

        // Actually, the requirement says: "The tutor must generate... by the last day of the month (except Feb...)"
        // It implies generating for the NEXT month? Or current?
        // Usually availability is for the NEXT month.
        // Let's assume we can generate if today <= deadline.

        // Simple check: The backend validates this. We just enable the button if no blocks exist.
        return false;
    };

    return (
        <div className="calendar-view">
            <div className="calendar-controls">
                <div className="month-nav">
                    <button className="nav-btn" onClick={() => changeMonth(-1)}>◀</button>
                    <h3>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h3>
                    <button className="nav-btn" onClick={() => changeMonth(1)}>▶</button>
                </div>

                <button
                    className="save-btn"
                    onClick={generateFromTemplate}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#006837',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FaCalendarPlus /> {blocks.length > 0 ? 'Regenerar desde Plantilla Semanal' : 'Generar desde Plantilla Semanal'}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    borderRadius: '4px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>
                    {message.text}
                </div>
            )}

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
                            style={{ backgroundColor: isToday ? '#e3f2fd' : 'white' }}
                            onClick={() => setSelectedDay(date)}
                        >
                            <span className="day-number">{date.getDate()}</span>
                            <div className="day-blocks-indicator">
                                {dayBlocks.map(b => (
                                    <div
                                        key={b.idDisponibilidadMensual}
                                        className={`block-dot ${b.estado === 'DISPONIBLE' ? 'available' : b.estado === 'RESERVADO' ? 'reserved' : 'occupied'}`}
                                        title={`${b.horaInicio.substring(0, 5)} - ${b.modalidad}`}
                                    ></div>
                                ))}
                            </div>
                            {dayBlocks.length > 0 && (
                                <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                    {dayBlocks.length} bloques
                                </div>
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
        </div>
    );
};

export default MonthlyCalendarView;
