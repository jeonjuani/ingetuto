import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tutoriaService, TutoriaDTO } from '../services/tutoriaService';
import { FaCalendarAlt as FaCalendarAltIcon, FaUser as FaUserIcon, FaClock as FaClockIcon, FaLaptop as FaLaptopIcon, FaChalkboardTeacher as FaChalkboardTeacherIcon, FaLink as FaLinkIcon, FaTimes as FaTimesIcon } from 'react-icons/fa';
import './AvailabilityManagement.css';

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

    useEffect(() => {
        loadTutorias();
    }, [filter]);

    const loadTutorias = async () => {
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
    };

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
            case 'RESERVADA': return '#FFA500';
            case 'PROGRAMADA': return '#008148';
            case 'PENDIENTE_CONFIRMACION': return '#FFD700';
            case 'REALIZADA': return '#4CAF50';
            case 'COMPLETADA': return '#2196F3';
            case 'CANCELADA': return '#F44336';
            case 'NO_EJECUTADA': return '#9E9E9E';
            default: return '#666';
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
            alert('Asistencia confirmada exitosamente');
            loadTutorias();
        } catch (error) {
            console.error('Error confirming attendance:', error);
            alert('Error al confirmar asistencia');
        } finally {
            setConfirming(false);
        }
    };

    const filteredTutorias = filter === 'TODAS'
        ? tutorias
        : tutorias.filter(t => t.estado === filter);

    return (
        <div className="student-browser">
            <div className="availability-header">
                <h2>Mis Tutorías</h2>
                <p style={{ color: '#666' }}>Aquí puedes ver todas tus tutorías reservadas y su estado.</p>
            </div>

            {/* Filtros */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['TODAS', 'RESERVADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA'].map(estado => (
                    <button
                        key={estado}
                        onClick={() => setFilter(estado)}
                        style={{
                            padding: '8px 16px',
                            border: filter === estado ? '2px solid #008148' : '1px solid #ddd',
                            borderRadius: '20px',
                            backgroundColor: filter === estado ? '#e8f5e9' : 'white',
                            color: filter === estado ? '#008148' : '#666',
                            cursor: 'pointer',
                            fontWeight: filter === estado ? 'bold' : 'normal'
                        }}
                    >
                        {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Lista de Tutorías */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Cargando...
                </div>
            ) : filteredTutorias.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>No tienes tutorías {filter === 'TODAS' ? '' : `en estado ${filter.toLowerCase()}`}.</p>
                </div>
            ) : (
                <div className="results-grid">
                    {filteredTutorias.map(tutoria => (
                        <div key={tutoria.idTutoria} className="tutor-card">
                            <div className="tutor-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaUser style={{ color: '#666' }} />
                                    <span className="tutor-name">{tutoria.nombreTutor}</span>
                                </div>
                                <span
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: getEstadoBadgeColor(tutoria.estado) + '20',
                                        color: getEstadoBadgeColor(tutoria.estado)
                                    }}
                                >
                                    {tutoria.estado}
                                </span>
                            </div>

                            <div style={{ marginTop: '12px' }}>
                                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                    <strong>Materia:</strong> {tutoria.nombreMateria}
                                </p>
                                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                    <strong>Tema:</strong> {tutoria.nombreTema}
                                </p>
                                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                    <strong>Teléfono del tutor:</strong> {tutoria.telefonoTutor || 'No registrado'}
                                </p>
                            </div>

                            <div className="card-time" style={{ marginTop: '12px' }}>
                                <FaCalendarAlt style={{ marginRight: '5px', color: '#888' }} />
                                <strong>{formatDate(tutoria.fechaTutoria)}</strong>
                                <div style={{ marginLeft: '20px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaClock style={{ color: '#888' }} />
                                    {tutoria.horaInicio.substring(0, 5)} - {tutoria.horaFin.substring(0, 5)}
                                </div>
                            </div>

                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {tutoria.modalidad === 'VIRTUAL' ? <FaLaptop /> : <FaChalkboardTeacher />}
                                <span>{tutoria.modalidad}</span>
                            </div>

                            {tutoria.linkTutoria && tutoria.modalidad === 'VIRTUAL' && tutoria.estado !== 'CANCELADA' && (
                                <div style={{ marginTop: '12px' }}>
                                    <a
                                        href={tutoria.linkTutoria}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            color: '#008148',
                                            textDecoration: 'none',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <FaLink /> Unirse a la tutoría
                                    </a>
                                </div>
                            )}

                            {tutoria.observaciones && (
                                <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                        <strong>Observaciones:</strong> {tutoria.observaciones}
                                    </p>
                                </div>
                            )}

                            {/* Estado de confirmación */}
                            {tutoria.estado === 'PROGRAMADA' && (
                                <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#1976d2' }}>
                                        {tutoria.confirmacionEstudiante ? (
                                            <span>✓ Ya confirmaste tu asistencia</span>
                                        ) : tutoria.confirmacionTutor ? (
                                            <span>El tutor ya confirmó. Confirma tu asistencia también.</span>
                                        ) : (
                                            <span>Confirma tu asistencia después de la tutoría</span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Botón de confirmar asistencia */}
                            {canConfirm(tutoria.estado) && !tutoria.confirmacionEstudiante && (
                                <button
                                    onClick={() => handleConfirmAttendance(tutoria)}
                                    disabled={confirming}
                                    style={{
                                        marginTop: '12px',
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: confirming ? '#ccc' : '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: confirming ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {confirming ? 'Confirmando...' : 'Confirmar Asistencia'}
                                </button>
                            )}

                            {canCancel(tutoria.estado) && (
                                <button
                                    onClick={() => handleCancelClick(tutoria)}
                                    style={{
                                        marginTop: '12px',
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Cancelar Tutoría
                                </button>
                            )}
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
        </div>
    );
};

export default MyTutoringSessions;
