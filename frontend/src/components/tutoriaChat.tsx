import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { mensajeService, MensajeDTO } from '../services/mensajeService';
import { TutoriaDTO } from '../services/tutoriaService';
import { FaTimes as FaTimesIcon, FaPaperPlane as FaPaperPlaneIcon } from 'react-icons/fa';

const FaTimes: any = FaTimesIcon;
const FaPaperPlane: any = FaPaperPlaneIcon;

interface TutoriaChatProps {
    tutoria: TutoriaDTO;
    noLeidos: number;
    onClose: () => void;
}

const TutoriaChat: React.FC<TutoriaChatProps> = ({ tutoria, onClose, noLeidos }) => {
    const { token, user } = useAuth();
    const [mensajes, setMensajes] = useState<MensajeDTO[]>([]);
    const [contenido, setContenido] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadMensajes = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await mensajeService.obtenerMensajes(tutoria.idTutoria, token);
            setMensajes(data);
        } catch (error) {
            console.error('Error cargando mensajes:', error);
        } finally {
            setLoading(false);
        }
    }, [token, tutoria.idTutoria]);

    useEffect(() => {
        loadMensajes();
        // Polling cada 5 segundos para mensajes nuevos
        const interval = setInterval(loadMensajes, 5000);
        return () => clearInterval(interval);
    }, [loadMensajes]);

    useEffect(() => {
        // Scroll al último mensaje cada vez que lleguen mensajes nuevos
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const handleEnviar = async () => {
        if (!token || !contenido.trim()) return;
        try {
            setSending(true);
            const nuevo = await mensajeService.enviarMensaje(tutoria.idTutoria, contenido.trim(), token);
            setMensajes(prev => [...prev, nuevo]);
            setContenido('');
        } catch (error) {
            console.error('Error enviando mensaje:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviar();
        }
    };

    const formatHora = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    };

    // Agrupar mensajes por fecha
    const mensajesPorFecha = mensajes.reduce((groups: { [key: string]: MensajeDTO[] }, mensaje) => {
        const fecha = formatFecha(mensaje.fechaEnvio);
        if (!groups[fecha]) groups[fecha] = [];
        groups[fecha].push(mensaje);
        return groups;
    }, {});

    const puedeEscribir = () => {
    // Validación 1: estado debe ser RESERVADA o PROGRAMADA
    if (tutoria.estado !== 'RESERVADA' && tutoria.estado !== 'PROGRAMADA') return false;

    // Validación 2: la fecha y hora de la tutoría no debe haber pasado
    const fechaHoraTutoria = new Date(`${tutoria.fechaTutoria}T${tutoria.horaFin}`);
    if (new Date() > fechaHoraTutoria) return false;

    return true;
};

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '500px',
                    height: '80vh',
                    maxHeight: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#006837',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            Chat — {tutoria.nombreMateria}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                            {tutoria.nombreTutor} · {tutoria.nombreEstudiante}
                        </div>
                        <div style={{fontSize: '11px', opacity: 0.75, marginTop: '2px'}}>
                            {new Date(tutoria.fechaTutoria+'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · {tutoria.horaInicio.substring(0, 5)} - {tutoria.horaFin.substring(0, 5)}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Mensajes */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    {loading && mensajes.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            Cargando mensajes...
                        </div>
                    )}

                    {!loading && mensajes.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
                            <p style={{ margin: 0 }}>No hay mensajes aún.</p>
                            <p style={{ margin: '8px 0 0', fontSize: '13px' }}>¡Sé el primero en escribir!</p>
                        </div>
                    )}

                    {Object.entries(mensajesPorFecha).map(([fecha, msgs]) => (
                        <div key={fecha}>
                            {/* Separador de fecha */}
                            <div style={{
                                textAlign: 'center',
                                margin: '12px 0 8px',
                                position: 'relative'
                            }}>
                                <span style={{
                                    backgroundColor: '#e0e0e0',
                                    color: '#666',
                                    fontSize: '11px',
                                    padding: '3px 10px',
                                    borderRadius: '10px'
                                }}>
                                    {fecha}
                                </span>
                            </div>

                            {msgs.map(mensaje => {
                                const esMio = mensaje.idEmisor === user?.id;
                                return (
                                    <div
                                        key={mensaje.idMensaje}
                                        style={{
                                            display: 'flex',
                                            justifyContent: esMio ? 'flex-end' : 'flex-start',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <div style={{ maxWidth: '75%' }}>
                                            {/* Nombre emisor (solo para mensajes del otro) */}
                                            {!esMio && (
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#008148',
                                                    fontWeight: 'bold',
                                                    marginBottom: '3px',
                                                    paddingLeft: '4px'
                                                }}>
                                                    {mensaje.nombreEmisor}
                                                </div>
                                            )}

                                            <div style={{
                                                padding: '10px 14px',
                                                borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                backgroundColor: esMio ? '#006837' : 'white',
                                                color: esMio ? 'white' : '#333',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                border: esMio ? 'none' : '1px solid #eee',
                                                wordBreak: 'break-word'
                                            }}>
                                                {mensaje.contenido}
                                            </div>

                                            {/* Hora y estado de lectura */}
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#999',
                                                marginTop: '3px',
                                                textAlign: esMio ? 'right' : 'left',
                                                paddingRight: esMio ? '4px' : '0',
                                                paddingLeft: esMio ? '0' : '4px',
                                                display: 'flex',
                                                justifyContent: esMio ? 'flex-end' : 'flex-start',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {formatHora(mensaje.fechaEnvio)}
                                                {esMio && (
                                                    <span style={{
                                                        color: mensaje.leido ? '#006837' : '#555',
                                                        fontWeight: mensaje.leido ? 'bold' : 'normal',
                                                        fontSize: '11px'
                                                    }}>
                                                        {mensaje.leido ? (
                                                            <>
                                                                ✓✓ Leído · {new Date(mensaje.fechaLectura!).toLocaleDateString('es-ES', {
                                                                    day: 'numeric', month: 'short'
                                                                })} {new Date(mensaje.fechaLectura!).toLocaleTimeString('es-ES', {
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </>
                                                        ) : (
                                                            '✓✓ Enviado'
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                {puedeEscribir() ? (
                    <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #eee',
                        backgroundColor: 'white',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-end'
                    }}>
                        <textarea
                            value={contenido}
                            onChange={e => setContenido(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe un mensaje... (Enter para enviar)"
                            disabled={sending}
                            rows={1}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                border: '1px solid #ddd',
                                borderRadius: '20px',
                                fontSize: '14px',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit',
                                lineHeight: '1.4',
                                maxHeight: '100px',
                                overflowY: 'auto'
                            }}
                        />
                        <button
                            onClick={handleEnviar}
                            disabled={sending || !contenido.trim()}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: sending || !contenido.trim() ? '#ccc' : '#006837',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: sending || !contenido.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <FaPaperPlane /> {sending ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                ) : (
                    <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #eee',
                        backgroundColor: '#f8f9fa',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#999'
                    }}>
                        {tutoria.estado === 'CANCELADA' ? 'Esta tutoría fue cancelada' :
                        tutoria.estado === 'REALIZADA' ? 'Esta tutoría ya fue realizada' :
                        'Esta tutoría ya finalizó'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutoriaChat;