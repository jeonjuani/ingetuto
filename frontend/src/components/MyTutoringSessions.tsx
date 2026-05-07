import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tutoriaService, TutoriaDTO } from '../services/tutoriaService';
import { FaCalendarAlt as FaCalendarAltIcon, FaUser as FaUserIcon, FaClock as FaClockIcon, FaLaptop as FaLaptopIcon, FaChalkboardTeacher as FaChalkboardTeacherIcon, FaLink as FaLinkIcon, FaTimes as FaTimesIcon } from 'react-icons/fa';
import './AvailabilityManagement.css';
import TutoriaChat from './tutoriaChat';
import chatIcon from '../assets/chatIcon.png';
import { mensajeService } from '../services/mensajeService';

const FaCalendarAlt: any = FaCalendarAltIcon;
const FaUser: any = FaUserIcon;
const FaClock: any = FaClockIcon;
const FaLaptop: any = FaLaptopIcon;
const FaChalkboardTeacher: any = FaChalkboardTeacherIcon;
const FaLink: any = FaLinkIcon;
const FaTimes: any = FaTimesIcon;

const MyTutoringSessions: React.FC = () => {
    const { token } = useAuth();
    const [tutorias, setTutorias] = useState<TutoriaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>('TODAS');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedTutoria, setSelectedTutoria] = useState<TutoriaDTO | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [canceling, setCanceling] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [chatTutoria, setChatTutoria] = useState<TutoriaDTO | null>(null);

    const loadTutorias = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const estados = filter === 'TODAS' ? undefined : [filter];
            const data = await tutoriaService.obtenerMisTutorias(estados, token);
            setTutorias(data);
        } catch (error) {
            console.error('Error loading tutorías:', error);
        } finally {
            setLoading(false);
        }
    }, [token, filter]);

    useEffect(() => {
    loadTutorias();
    }, [filter, loadTutorias]);

    // Polling cada 5 segundos para actualizar no leídos
    useEffect(() => {
        if (tutorias.length === 0 || !token) return;

        const actualizarNoLeidos = async () => {
            tutorias.forEach(async (t) => {
                const count = await mensajeService.contarNoLeidos(t.idTutoria, token);
                setNoLeidos(prev => ({ ...prev, [t.idTutoria]: count }));
            });
        };

        actualizarNoLeidos();
        const interval = setInterval(actualizarNoLeidos, 5000);
        return () => clearInterval(interval);
    }, [tutorias, token]);

    const handleCancelClick = (tutoria: TutoriaDTO) => {
        setSelectedTutoria(tutoria);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!token || !selectedTutoria || !cancelReason.trim()) {
            alert('Por favor ingresa el motivo de cancelación');
            return;
        }

        try {
            setCanceling(true);
            await tutoriaService.cancelarTutoria(selectedTutoria.idTutoria, cancelReason, token);
            alert('Tutoría cancelada exitosamente');
            setShowCancelModal(false);
            setSelectedTutoria(null);
            setCancelReason('');
            loadTutorias();
        } catch (error) {
            console.error('Error canceling tutoría:', error);
            alert('Error al cancelar la tutoría');
        } finally {
            setCanceling(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getEstadoBadgeColor = (estado: string) => {
        switch (estado) {
            case 'RESERVADA': return '#f59e0b';
            case 'PROGRAMADA': return '#10b981';
            case 'PENDIENTE_CONFIRMACION': return '#facc15';
            case 'REALIZADA': return '#22c55e';
            case 'COMPLETADA': return '#3b82f6';
            case 'CANCELADA': return '#ef4444';
            case 'NO_EJECUTADA': return '#94a3b8';
            default: return '#64748b';
        }
    };

    const canCancel = (estado: string) => {
        return estado === 'RESERVADA' || estado === 'PROGRAMADA';
    };

    const canConfirm = (estado: string) => {
        return estado === 'PROGRAMADA';
    };

    const handleConfirmAttendance = async (tutoria: TutoriaDTO) => {
        if (!token) return;

        if (!window.confirm('¿Confirmas que asististe a esta tutoría?')) {
            return;
        }

        try {
            setConfirming(true);
            await tutoriaService.confirmarAsistenciaEstudiante(tutoria.idTutoria, token);
            await loadTutorias();
            alert('Asistencia confirmada exitosamente');
        } catch (error) {
            console.error('Error confirming attendance:', error);
            alert('Error al confirmar asistencia');
        } finally {
            setConfirming(false);
        }
    };

    const filteredTutorias = (filter === 'TODAS'
    ? tutorias
    : tutorias.filter(t => t.estado === filter)
    ).sort((a, b) => {
        const fechaA = new Date(`${a.fechaTutoria}T${a.horaInicio}`);
        const fechaB = new Date(`${b.fechaTutoria}T${b.horaInicio}`);
        return fechaB.getTime() - fechaA.getTime(); // Reciente -> Antigua
    });

    
    const [noLeidos, setNoLeidos] = useState<{ [idTutoria: number]: number }>({});

    // Cargar no leídos cuando cargan las tutorías
    useEffect(() => {
        if (tutorias.length === 0 || !token) return;
        tutorias.forEach(async (t) => {
            const count = await mensajeService.contarNoLeidos(t.idTutoria, token);
            setNoLeidos(prev => ({ ...prev, [t.idTutoria]: count }));
        });
    }, [tutorias, token]);

    return (
        <div className="student-browser">
            <div className="availability-header">
                <h2>Mis Tutorías</h2>
                <p style={{ color: '#666' }}>Gestiona tus sesiones reservadas y comunícate con tus tutores.</p>
            </div>

            {/* Filtros */}
            <div style={{ marginBottom: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['TODAS', 'RESERVADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA'].map(estado => (
                    <button
                        key={estado}
                        onClick={() => setFilter(estado)}
                        style={{
                            padding: '8px 18px',
                            border: filter === estado ? '1px solid #10b981' : '1px solid #e2e8f0',
                            borderRadius: '24px',
                            backgroundColor: filter === estado ? '#ecfdf5' : '#ffffff',
                            color: filter === estado ? '#059669' : '#475569',
                            cursor: 'pointer',
                            fontWeight: filter === estado ? '600' : '500',
                            boxShadow: filter === estado ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Lista de Tutorías */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                    Cargando tus tutorías...
                </div>
            ) : filteredTutorias.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                    <p>No se encontraron tutorías {filter === 'TODAS' ? '' : `en estado ${filter.toLowerCase()}`}.</p>
                </div>
            ) : (
                <div className="results-grid">
                    {filteredTutorias.map(tutoria => (
                        <div key={tutoria.idTutoria} className="tutor-card">
                            <div className="tutor-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <FaUser style={{ margin: 'auto' }} />
                                    </div>
                                    <span className="tutor-name" style={{ fontSize: '15px' }}>{tutoria.nombreTutor}</span>
                                </div>
                                <span
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        backgroundColor: getEstadoBadgeColor(tutoria.estado) + '1A',
                                        color: getEstadoBadgeColor(tutoria.estado),
                                        border: `1px solid ${getEstadoBadgeColor(tutoria.estado)}30`,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3px'
                                    }}
                                >
                                    {tutoria.estado}
                                </span>
                            </div>

                            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                <p style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>
                                    {tutoria.nombreMateria}
                                </p>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                                    <strong>Tema:</strong> {tutoria.nombreTema}
                                </p>
                            </div>

                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                                    <FaCalendarAlt style={{ color: '#10b981' }} />
                                    <span>{formatDate(tutoria.fechaTutoria)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                                    <FaClock style={{ color: '#10b981' }} />
                                    <span>{tutoria.horaInicio.substring(0, 5)} - {tutoria.horaFin.substring(0, 5)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                                    {tutoria.modalidad === 'VIRTUAL' ? <FaLaptop style={{ color: '#3b82f6' }} /> : <FaChalkboardTeacher style={{ color: '#f59e0b' }} />}
                                    <span>{tutoria.modalidad}</span>
                                </div>
                            </div>

                            {tutoria.observaciones && (
                                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                                        <strong style={{ display: 'block', marginBottom: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tus Observaciones:</strong>
                                        {tutoria.observaciones}
                                    </p>
                                </div>
                            )}

                            {tutoria.linkTutoria && tutoria.modalidad === 'VIRTUAL' && tutoria.estado !== 'CANCELADA' && tutoria.estado !== 'REALIZADA' && (
                                <div style={{ marginTop: '16px' }}>
                                    <a
                                        href={tutoria.linkTutoria}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            color: '#059669',
                                            backgroundColor: '#ecfdf5',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            border: '1px solid #bbf7d0',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <FaLink /> Unirse a la tutoría
                                    </a>
                                </div>
                            )}

                            {/* Estado de confirmación */}
                            {tutoria.estado === 'PROGRAMADA' && (
                                <div style={{ 
                                    marginTop: '16px', 
                                    padding: '10px', 
                                    backgroundColor: tutoria.confirmacionEstudiante ? '#f0fdf4' : '#eff6ff', 
                                    borderRadius: '10px',
                                    border: `1px solid ${tutoria.confirmacionEstudiante ? '#bbf7d0' : '#bfdbfe'}`
                                }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: tutoria.confirmacionEstudiante ? '#166534' : '#1e40af', fontWeight: '500' }}>
                                        {tutoria.confirmacionEstudiante ? (
                                            <span>✓ Asistencia confirmada</span>
                                        ) : tutoria.confirmacionTutor ? (
                                            <span>El tutor confirmó. ¡Confirma tú también!</span>
                                        ) : (
                                            <span>Por confirmar asistencia</span>
                                        )}
                                    </p>
                                </div>
                            )}

                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Botón de confirmar asistencia */}
                                {canConfirm(tutoria.estado) && !tutoria.confirmacionEstudiante && (
                                    <button
                                        onClick={() => handleConfirmAttendance(tutoria)}
                                        disabled={confirming}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: confirming ? '#e2e8f0' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: confirming ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                                        }}
                                    >
                                        {confirming ? 'Confirmando...' : 'Confirmar Asistencia'}
                                    </button>
                                )}

                                <button
                                    onClick={() => {setChatTutoria(tutoria);
                                        setNoLeidos(prev => ({ ...prev, [tutoria.idTutoria]: 0 }));
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#1e293b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <img 
                                        src={chatIcon} 
                                        alt="chat" 
                                        style={{ width: '18px', height: '18px', filter: 'invert(1)' }} 
                                    />
                                    Abrir Chat
                                    {noLeidos[tutoria.idTutoria] > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            {noLeidos[tutoria.idTutoria]}
                                        </span>
                                    )}
                                </button>

                                {canCancel(tutoria.estado) && (
                                    <button
                                        onClick={() => handleCancelClick(tutoria)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            border: '1px solid #fecaca',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Cancelar Tutoría
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Cancelación */}
            {showCancelModal && selectedTutoria && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#f44336' }}>Cancelar Tutoría</h3>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <p style={{ marginBottom: '16px', color: '#666' }}>
                            ¿Estás seguro de que deseas cancelar esta tutoría con <strong>{selectedTutoria.nombreTutor}</strong>?
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                Motivo de cancelación *
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Explica brevemente por qué cancelas..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                                disabled={canceling}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={canceling}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: canceling ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                disabled={canceling || !cancelReason.trim()}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: canceling || !cancelReason.trim() ? '#ccc' : '#f44336',
                                    color: 'white',
                                    cursor: canceling || !cancelReason.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {canceling ? 'Cancelando...' : 'Confirmar Cancelación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {chatTutoria && (
                <TutoriaChat
                    tutoria={chatTutoria}
                    noLeidos={noLeidos[chatTutoria.idTutoria] || 0}
                    onClose={() => setChatTutoria(null)}
                />
            )}
        </div>
    );
};


export default MyTutoringSessions;
