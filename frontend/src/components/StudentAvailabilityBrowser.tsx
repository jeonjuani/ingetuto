import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { disponibilidadService, DisponibilidadMensualDTO } from '../services/disponibilidadService';
import { tutoriaService } from '../services/tutoriaService';
import { FaSearch, FaCalendarAlt, FaUser, FaLaptop, FaChalkboardTeacher, FaTimes, FaClock } from 'react-icons/fa';
import './AvailabilityManagement.css';

// Type assertions for icon components
const SearchIcon = FaSearch as React.ComponentType<any>;
const CalendarIcon = FaCalendarAlt as React.ComponentType<any>;
const UserIcon = FaUser as React.ComponentType<any>;
const LaptopIcon = FaLaptop as React.ComponentType<any>;
const ChalkboardIcon = FaChalkboardTeacher as React.ComponentType<any>;
const TimesIcon = FaTimes as React.ComponentType<any>;
const ClockIcon = FaClock as React.ComponentType<any>;

interface Materia {
    idMateria: number;
    nombreMateria: string;
    codigoMateria: string;
}

const StudentAvailabilityBrowser: React.FC = () => {
    const { token, user } = useAuth();
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [selectedMateria, setSelectedMateria] = useState<string>('');
    const [selectedModality, setSelectedModality] = useState<string>('TODAS');
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });
    const [results, setResults] = useState<DisponibilidadMensualDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedBlock, setSelectedBlock] = useState<DisponibilidadMensualDTO | null>(null);
    const [nombreTema, setNombreTema] = useState('');
    const [reserving, setReserving] = useState(false);

    const loadMaterias = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/materias`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Map backend fields to frontend interface
                const mappedData = data.map((m: any) => ({
                    idMateria: m.id_materia,
                    nombreMateria: m.nombre_materia,
                    codigoMateria: m.codigoMateria
                }));
                setMaterias(mappedData);
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }, [token]);

    useEffect(() => {
        loadMaterias();
    }, [loadMaterias]);

    const handleSearch = async () => {
        if (!token || !selectedMateria) return;

        try {
            setLoading(true);
            setSearched(true);
            const data = await disponibilidadService.obtenerPorMateria(
                parseInt(selectedMateria),
                dateRange.start,
                dateRange.end,
                token
            );
            setResults(data);
        } catch (error) {
            console.error('Error searching availability:', error);
            alert('Error al buscar disponibilidad');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        // Create date object and adjust for timezone offset if necessary
        // Simple approach: append T00:00:00 to ensure local time interpretation or handle as UTC
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const handleOpenModal = (block: DisponibilidadMensualDTO) => {
        setSelectedBlock(block);
        setNombreTema('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBlock(null);
        setNombreTema('');
    };

    const handleReservar = async () => {
        if (!token || !selectedBlock || !nombreTema.trim() || !selectedMateria) {
            alert('Por favor ingresa el tema de la tutoría');
            return;
        }

        try {
            setReserving(true);
            await tutoriaService.reservarTutoria(
                selectedBlock.idDisponibilidadMensual,
                parseInt(selectedMateria),
                nombreTema,
                token
            );
            alert('¡Tutoría reservada exitosamente!');
            handleCloseModal();
            // Refrescar resultados
            handleSearch();
        } catch (error: any) {
            console.error('Error reserving tutoring:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            if (error.response?.status === 409) {
                const backendMsg = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message;
                alert(backendMsg || 'Este bloque ya no está disponible o ya tienes una tutoría en este horario');
            } else if (error.response?.status === 400) {
                alert('Error en los datos enviados: ' + (error.response?.data?.message || 'Verifica que todos los campos sean correctos'));
            } else {
                alert('Error al reservar la tutoría. Por favor intenta de nuevo.');
            }
        } finally {
            setReserving(false);
        }
    };

    const filteredResults = results.filter(block => {
        // Solo mostrar bloques DISPONIBLES
        if (block.estado !== 'DISPONIBLE') return false;

        //No mostrar bloques del propio estudiante
        if(block.idTutor === user?.id) return false; // No mostrar bloques propios

        // No mostrar bloques con menos de 1 hora de anticipación
        const ahora = new Date();
        const fechaHoraBloque = new Date(`${block.fecha}T${block.horaInicio}`);
        const diferenciaMs = fechaHoraBloque.getTime() - ahora.getTime();
        const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
        if (diferenciaHoras < 1) return false;
        
        // Filtrar por modalidad
        if (selectedModality === 'TODAS') return true;
        return block.modalidad === selectedModality;
    });

    const searchButtonContent = !loading ? (
        <><SearchIcon /> Buscar</>
    ) : (
        <>Buscando...</>
    );

    return (
        <div className="student-browser">
            <div className="availability-header">
                <h2>Buscar Tutorías Disponibles</h2>
                <p style={{ color: '#666' }}>Selecciona una materia y encuentra el horario ideal para tu próxima sesión.</p>
            </div>

            {/* Panel de Búsqueda */}
            <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                marginBottom: '30px',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '20px',
                    alignItems: 'end'
                }}>
                    <div className="filter-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Materia</label>
                        <select
                            value={selectedMateria}
                            onChange={(e) => setSelectedMateria(e.target.value)}
                            style={{ 
                                width: '100%',
                                padding: '10px 12px', 
                                borderRadius: '10px', 
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                color: '#1e293b',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        >
                            <option value="">Seleccione una materia...</option>
                            {materias.map(m => (
                                <option key={m.idMateria} value={m.idMateria}>
                                    {m.codigoMateria} - {m.nombreMateria}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Modalidad</label>
                        <select
                            value={selectedModality}
                            onChange={(e) => setSelectedModality(e.target.value)}
                            style={{ 
                                width: '100%',
                                padding: '10px 12px', 
                                borderRadius: '10px', 
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                color: '#1e293b',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        >
                            <option value="TODAS">Todas</option>
                            <option value="VIRTUAL">Virtual</option>
                            <option value="PRESENCIAL">Presencial</option>
                        </select>
                    </div>

                    <div className="filter-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Desde</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            style={{ 
                                width: '100%',
                                padding: '10px 12px', 
                                borderRadius: '10px', 
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                color: '#1e293b',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div className="filter-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Hasta</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            style={{ 
                                width: '100%',
                                padding: '10px 12px', 
                                borderRadius: '10px', 
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                color: '#1e293b',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading || !selectedMateria}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: loading || !selectedMateria ? '#e2e8f0' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: loading || !selectedMateria ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s ease',
                            boxShadow: loading || !selectedMateria ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)',
                            height: '42px'
                        }}
                    >
                        {searchButtonContent}
                    </button>
                </div>
            </div>

            <div className="results-area">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        Buscando los mejores tutores para ti...
                    </div>
                ) : searched && filteredResults.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}><SearchIcon /></div>
                        <p>No se encontraron horarios disponibles para esta materia.</p>
                        <p style={{ fontSize: '13px' }}>Prueba seleccionando otro rango de fechas o modalidad.</p>
                    </div>
                ) : (
                    <div className="results-grid">
                        {filteredResults.map(block => (
                            <div key={block.idDisponibilidadMensual} className="tutor-card">
                                <div className="tutor-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                            <UserIcon style={{ margin: 'auto' }} />
                                        </div>
                                        <span className="tutor-name" style={{ fontSize: '15px' }}>{block.nombreTutor}</span>
                                    </div>
                                    <span
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            backgroundColor: block.modalidad === 'VIRTUAL' ? '#eff6ff' : '#fffbeb',
                                            color: block.modalidad === 'VIRTUAL' ? '#2563eb' : '#d97706',
                                            border: `1px solid ${block.modalidad === 'VIRTUAL' ? '#bfdbfe' : '#fef3c7'}`,
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {block.modalidad === 'VIRTUAL' ? <LaptopIcon size={12} /> : <ChalkboardIcon size={12} />} 
                                        {block.modalidad}
                                    </span>
                                </div>

                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
                                        <CalendarIcon style={{ color: '#10b981' }} />
                                        <strong style={{ fontWeight: '600' }}>{formatDate(block.fecha)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', marginLeft: '2px' }}>
                                        <div style={{ color: '#cbd5e1' }}><ClockIcon size={16} /></div>
                                        <span>{block.horaInicio.substring(0, 5)} - {block.horaFin.substring(0, 5)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleOpenModal(block)}
                                    style={{
                                        marginTop: '20px',
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#1e293b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(30, 41, 59, 0.15)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                                >
                                    Reservar Tutoría
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Reserva */}
            {showModal && selectedBlock && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>Confirmar Reserva</h3>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                <TimesIcon />
                            </button>
                        </div>

                        <div style={{ 
                            backgroundColor: '#f8fafc', 
                            padding: '16px', 
                            borderRadius: '12px', 
                            marginBottom: '24px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '24px', color: '#10b981' }}><UserIcon size={16} /></div>
                                <span style={{ color: '#475569', fontSize: '14px' }}>Tutor: <strong style={{ color: '#1e293b' }}>{selectedBlock.nombreTutor}</strong></span>
                            </div>
                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '24px', color: '#10b981' }}><CalendarIcon size={16} /></div>
                                <span style={{ color: '#475569', fontSize: '14px' }}>Fecha: <strong style={{ color: '#1e293b' }}>{formatDate(selectedBlock.fecha)}</strong></span>
                            </div>
                            <div style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '24px', color: '#10b981' }}><ClockIcon size={16} /></div>
                                <span style={{ color: '#475569', fontSize: '14px' }}>Hora: <strong style={{ color: '#1e293b' }}>{selectedBlock.horaInicio.substring(0, 5)} - {selectedBlock.horaFin.substring(0, 5)}</strong></span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                ¿Sobre qué tema quieres la tutoría?
                            </label>
                            <input
                                type="text"
                                value={nombreTema}
                                onChange={(e) => setNombreTema(e.target.value)}
                                placeholder="Ej: Derivadas implícitas o Ensayo argumentativo"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f8fafc'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                disabled={reserving}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleCloseModal}
                                disabled={reserving}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    color: '#64748b',
                                    cursor: reserving ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReservar}
                                disabled={reserving || !nombreTema.trim()}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    backgroundColor: reserving || !nombreTema.trim() ? '#e2e8f0' : '#10b981',
                                    color: 'white',
                                    cursor: reserving || !nombreTema.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    boxShadow: reserving || !nombreTema.trim() ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)'
                                }}
                            >
                                {reserving ? 'Reservando...' : 'Confirmar Reserva'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAvailabilityBrowser;
