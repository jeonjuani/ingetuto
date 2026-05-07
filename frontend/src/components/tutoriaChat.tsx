import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { mensajeService, MensajeDTO } from '../services/mensajeService';
import { TutoriaDTO } from '../services/tutoriaService';
import { FaTimes as FaTimesIcon, FaPaperPlane as FaPaperPlaneIcon } from 'react-icons/fa';
import './TutoriaChat.css';

const FaTimes: any = FaTimesIcon;
const FaPaperPlane: any = FaPaperPlaneIcon;

interface TutoriaChatProps {
    tutoria: TutoriaDTO;
    noLeidos: number;
    onClose: () => void;
}

const TutoriaChat: React.FC<TutoriaChatProps> = ({ tutoria, onClose }) => {
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
        const interval = setInterval(loadMensajes, 5000);
        return () => clearInterval(interval);
    }, [loadMensajes]);

    useEffect(() => {
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

    const mensajesPorFecha = mensajes.reduce((groups: { [key: string]: MensajeDTO[] }, mensaje) => {
        const fecha = formatFecha(mensaje.fechaEnvio);
        if (!groups[fecha]) groups[fecha] = [];
        groups[fecha].push(mensaje);
        return groups;
    }, {});

    const puedeEscribir = () => {
        if (tutoria.estado !== 'RESERVADA' && tutoria.estado !== 'PROGRAMADA') return false;
        const fechaHoraTutoria = new Date(`${tutoria.fechaTutoria}T${tutoria.horaFin}`);
        if (new Date() > fechaHoraTutoria) return false;
        return true;
    };

    return (
        <div className="chat-overlay" onClick={onClose}>
            <div className="chat-container" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        <div className="chat-header-title">
                            {tutoria.nombreMateria}
                        </div>
                        <div className="chat-header-subtitle">
                            {tutoria.nombreTutor} · {tutoria.nombreEstudiante}
                        </div>
                        <div className="chat-header-details">
                            {new Date(tutoria.fechaTutoria + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} · {tutoria.horaInicio.substring(0, 5)} - {tutoria.horaFin.substring(0, 5)}
                        </div>
                    </div>
                    <button className="close-chat-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Mensajes */}
                <div className="messages-area">
                    {loading && mensajes.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                            Cargando mensajes...
                        </div>
                    )}

                    {!loading && mensajes.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>No hay mensajes aún.</p>
                            <p style={{ margin: '8px 0 0', fontSize: '13px' }}>¡Inicia la conversación!</p>
                        </div>
                    )}

                    {Object.entries(mensajesPorFecha).map(([fecha, msgs]) => (
                        <div key={fecha}>
                            <div className="date-separator">
                                <span className="date-badge">{fecha}</span>
                            </div>

                            {msgs.map(mensaje => {
                                const esMio = mensaje.idEmisor === user?.id;
                                return (
                                    <div key={mensaje.idMensaje} className={`message-wrapper ${esMio ? 'mine' : 'theirs'}`}>
                                        <div className="message-content">
                                            {!esMio && (
                                                <div className="sender-name">{mensaje.nombreEmisor}</div>
                                            )}

                                            <div className="bubble">
                                                {mensaje.contenido}
                                            </div>

                                            <div className="message-meta">
                                                {formatHora(mensaje.fechaEnvio)}
                                                {esMio && (
                                                    <span className="read-status">
                                                        {mensaje.leido ? '✓✓' : '✓'}
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
                    <div className="chat-input-area">
                        <textarea
                            className="chat-textarea"
                            value={contenido}
                            onChange={e => setContenido(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe un mensaje..."
                            disabled={sending}
                            rows={1}
                        />
                        <button
                            className="send-message-btn"
                            onClick={handleEnviar}
                            disabled={sending || !contenido.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                ) : (
                    <div className="chat-disabled-banner">
                        {tutoria.estado === 'CANCELADA' ? 'Esta tutoría fue cancelada' :
                         tutoria.estado === 'REALIZADA' ? 'Esta tutoría ya fue realizada' :
                         'El chat ya no está disponible para esta sesión'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutoriaChat;