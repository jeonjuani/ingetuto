import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tutoriaService, TutoriaDTO } from '../services/tutoriaService';
import { FaCalendarAlt as FaCalendarAltIcon, FaUser as FaUserIcon, FaClock as FaClockIcon, FaLaptop as FaLaptopIcon, FaChalkboardTeacher as FaChalkboardTeacherIcon, FaLink as FaLinkIcon, FaTimes as FaTimesIcon, FaPlus as FaPlusIcon } from 'react-icons/fa';
import './AvailabilityManagement.css';

const FaCalendarAlt: any = FaCalendarAltIcon;
const FaUser: any = FaUserIcon;
const FaClock: any = FaClockIcon;
const FaLaptop: any = FaLaptopIcon;
const FaChalkboardTeacher: any = FaChalkboardTeacherIcon;
const FaLink: any = FaLinkIcon;
const FaTimes: any = FaTimesIcon;
const FaPlus: any = FaPlusIcon;

const TutorSessions: React.FC = () => {
    const { token } = useAuth();
    const [tutorias, setTutorias] = useState<TutoriaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>('TODAS');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedTutoria, setSelectedTutoria] = useState<TutoriaDTO | null>(null);
    const [meetLink, setMeetLink] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        loadTutorias();
    }, [filter]);

    const loadTutorias = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const estados = filter === 'TODAS' ? undefined : [filter];
            const data = await tutoriaService.obtenerTutoriasAsignadas(estados, token);
            setTutorias(data);
        } catch (error) {
            console.error('Error loading tutorías:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLinkClick = (tutoria: TutoriaDTO) => {
        setSelectedTutoria(tutoria);
        setMeetLink(tutoria.linkTutoria || '');
        setShowLinkModal(true);
    };

    const handleAddLinkConfirm = async () => {
        if (!token || !selectedTutoria || !meetLink.trim()) {
            alert('Por favor ingresa el link de Meet');
            return;
        }

        try {
            setProcessing(true);
            await tutoriaService.agregarLink(selectedTutoria.idTutoria, meetLink, token);
            alert('Link agregado exitosamente');
            setShowLinkModal(false);
            setSelectedTutoria(null);
            setMeetLink('');
            loadTutorias();
        } catch (error) {
            console.error('Error adding link:', error);
            alert('Error al agregar el link');
        } finally {
            setProcessing(false);
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
            setProcessing(true);
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
            setProcessing(false);
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

    const canAddLink = (tutoria: TutoriaDTO) => {
        return tutoria.estado === 'RESERVADA' && tutoria.modalidad === 'VIRTUAL';
    };

    const canCancel = (estado: string) => {
        return estado === 'RESERVADA' || estado === 'PROGRAMADA';
    };

    const canConfirm = (estado: string) => {
        return estado === 'PROGRAMADA';
    };

    const handleConfirmAttendance = async (tutoria: TutoriaDTO) => {
        if (!token) return;

        if (!window.confirm('¿Confirmas que impartiste esta tutoría?')) {
            return;
        }

        try {
            setConfirming(true);
            await tutoriaService.confirmarAsistenciaTutor(tutoria.idTutoria, token);
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
                <h2>Mis Tutorías Asignadas</h2>
                <p style={{ color: '#666' }}>Aquí puedes ver todas las tutorías que tienes asignadas y gestionar los enlaces de Meet.</p>
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
                    <p>No tienes tutorías asignadas {filter === 'TODAS' ? '' : `en estado ${filter.toLowerCase()}`}.</p>
                </div>
            ) : (
                <div className="results-grid">
                    {filteredTutorias.map(tutoria => (
                        <div key={tutoria.idTutoria} className="tutor-card">
                            <div className="tutor-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaUser style={{ color: '#666' }} />
                                    <span className="tutor-name">{tutoria.nombreEstudiante}</span>
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
                                    <strong>Teléfono del estudiante:</strong> {tutoria.telefonoEstudiante || 'No registrado'}
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

                            {tutoria.linkTutoria && tutoria.modalidad === 'VIRTUAL' && tutoria.estado !== 'CANCELADA' ? (
                                <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#008148' }}>
                                        Link de Meet:
                                    </p>
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
                                            fontSize: '14px',
                                            wordBreak: 'break-all'
                                        }}
                                    >
                                        <FaLink /> {tutoria.linkTutoria}
                                    </a>
                                </div>
                            ) : canAddLink(tutoria) && (
                                <button
                                    onClick={() => handleAddLinkClick(tutoria)}
                                    style={{
                                        marginTop: '12px',
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#008148',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <FaPlus /> Agregar Link de Meet
                                </button>
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
                                        {tutoria.confirmacionTutor ? (
                                            <span>✓ Ya confirmaste tu asistencia</span>
                                        ) : tutoria.confirmacionEstudiante ? (
                                            <span>El estudiante ya confirmó. Confirma tu asistencia también.</span>
                                        ) : (
                                            <span>Confirma tu asistencia después de la tutoría</span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Botón de confirmar asistencia */}
                            {canConfirm(tutoria.estado) && !tutoria.confirmacionTutor && (
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

            {/* Modal para Agregar Link */}
            {showLinkModal && selectedTutoria && (
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
                            <h3 style={{ margin: 0, color: '#008148' }}>Agregar Link de Meet</h3>
                            <button
                                onClick={() => setShowLinkModal(false)}
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
                            Tutoría con <strong>{selectedTutoria.nombreEstudiante}</strong>
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                Link de Google Meet *
                            </label>
                            <input
                                type="url"
                                value={meetLink}
                                onChange={(e) => setMeetLink(e.target.value)}
                                placeholder="https://meet.google.com/..."
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                                disabled={processing}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowLinkModal(false)}
                                disabled={processing}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddLinkConfirm}
                                disabled={processing || !meetLink.trim()}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: processing || !meetLink.trim() ? '#ccc' : '#008148',
                                    color: 'white',
                                    cursor: processing || !meetLink.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {processing ? 'Guardando...' : 'Guardar Link'}
                            </button>
                        </div>
                    </div>
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
                            ¿Estás seguro de que deseas cancelar esta tutoría con <strong>{selectedTutoria.nombreEstudiante}</strong>?
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
                                disabled={processing}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={processing}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                disabled={processing || !cancelReason.trim()}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: processing || !cancelReason.trim() ? '#ccc' : '#f44336',
                                    color: 'white',
                                    cursor: processing || !cancelReason.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {processing ? 'Cancelando...' : 'Confirmar Cancelación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorSessions;
