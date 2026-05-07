import React, { useState, useEffect, useCallback } from 'react';
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

    const loadTemplate = useCallback(async () => {
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
    }, [token]);

    useEffect(() => {
        loadTemplate();
    }, [loadTemplate]);

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
                        <span>No disponible</span>
                    </div>
                </div>
                <button
                    className="save-btn"
                    onClick={saveTemplate}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: loading ? '#e2e8f0' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                        boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#10b981')}
                >
                    {loading ? 'Guardando...' : <><FaSave /> Guardar Plantilla</>}
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

            <div className="weekly-grid">
                <div className="grid-header">Hora</div>
                {HOURS.map(hour => (
                    <div key={hour} className="grid-header">{hour}:00</div>
                ))}

                {DAYS.map(day => (
                    <React.Fragment key={day}>
                        <div className="day-label">{day.substring(0, 3)}</div>
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

            <div style={{ 
                marginTop: '24px', 
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <FaInfoCircle style={{ color: '#10b981' }} />
                    <span>Haz clic en una celda para alternar: <strong>Disponible → Virtual → Presencial → Disponible</strong>.</span>
                </div>
                
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>💡</span> <span><strong>Tip:</strong> Considera dejar el domingo libre para un mejor balance académico y personal.</span>
                </div>
            </div>
        </div>
    );
};

export default WeeklyTemplateEditor;
