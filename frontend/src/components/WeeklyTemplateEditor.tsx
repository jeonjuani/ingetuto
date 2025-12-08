import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { disponibilidadService, DisponibilidadSemanalDTO } from '../services/disponibilidadService';
import { FaSave as FaSaveIcon, FaInfoCircle as FaInfoCircleIcon } from 'react-icons/fa';

const FaSave: any = FaSaveIcon;
const FaInfoCircle: any = FaInfoCircleIcon;

const DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 to 22

const WeeklyTemplateEditor: React.FC = () => {
    const { token } = useAuth();
    const [template, setTemplate] = useState<DisponibilidadSemanalDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadTemplate();
    }, []);

    const loadTemplate = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await disponibilidadService.obtenerPlantillaSemanal(token);
            setTemplate(data);
        } catch (error) {
            console.error('Error loading template:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (day: string, hour: number) => {
        const hourStr = `${hour.toString().padStart(2, '0')}:00:00`;

        const existingIndex = template.findIndex(
            b => b.diaSemana === day && b.horaInicio === hourStr
        );

        const newTemplate = [...template];

        if (existingIndex >= 0) {
            const block = newTemplate[existingIndex];
            if (block.modalidad === 'VIRTUAL') {
                block.modalidad = 'PRESENCIAL';
                setTemplate(newTemplate);
            } else {
                newTemplate.splice(existingIndex, 1);
                setTemplate(newTemplate);
            }
        } else {
            const newBlock: DisponibilidadSemanalDTO = {
                diaSemana: day,
                horaInicio: hourStr,
                horaFin: `${(hour + 1).toString().padStart(2, '0')}:00:00`,
                modalidad: 'VIRTUAL'
            };
            setTemplate([...template, newBlock]);
        }
    };

    const saveTemplate = async () => {
        if (!token) return;
        try {
            setLoading(true);
            await disponibilidadService.crearPlantillaSemanal(template, token);
            setMessage({ type: 'success', text: 'Plantilla guardada exitosamente' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const getBlock = (day: string, hour: number) => {
        const hourStr = `${hour.toString().padStart(2, '0')}:00:00`;
        return template.find(b => b.diaSemana === day && b.horaInicio === hourStr);
    };

    return (
        <div className="weekly-editor">
            <div className="editor-controls">
                <div className="legend">
                    <div className="legend-item">
                        <div className="color-box virtual"></div>
                        <span>Virtual</span>
                    </div>
                    <div className="legend-item">
                        <div className="color-box presencial"></div>
                        <span>Presencial</span>
                    </div>
                    <div className="legend-item">
                        <div className="color-box empty"></div>
                        <span>Disponible</span>
                    </div>
                </div>
                <button
                    className="save-btn"
                    onClick={saveTemplate}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Guardando...' : <><FaSave /> Guardar Plantilla</>}
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

            <div className="weekly-grid">
                <div className="grid-header">Hora</div>
                {HOURS.map(hour => (
                    <div key={hour} className="grid-header">{hour}:00</div>
                ))}

                {DAYS.map(day => (
                    <React.Fragment key={day}>
                        <div className="day-label">{day}</div>
                        {HOURS.map(hour => {
                            const block = getBlock(day, hour);
                            return (
                                <div
                                    key={`${day}-${hour}`}
                                    className={`time-cell ${block ? block.modalidad.toLowerCase() : ''}`}
                                    onClick={() => handleCellClick(day, hour)}
                                    title={block ? `${day} ${hour}:00 - ${block.modalidad}` : 'Click para asignar'}
                                >
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div style={{ marginTop: '15px', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaInfoCircle />
                <span>Haz clic en una celda para alternar: Disponible → Virtual → Presencial → Disponible.</span>
            </div>

            <div style={{
                marginTop: '10px',
                padding: '10px 15px',
                backgroundColor: '#e3f2fd',
                borderLeft: '4px solid #006837',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#006837',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span><strong>Recomendación:</strong> Considera dejar el domingo como día de descanso para mantener un balance saludable.</span>
            </div>
        </div>
    );
};

export default WeeklyTemplateEditor;
