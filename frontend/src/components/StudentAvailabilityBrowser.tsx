import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { disponibilidadService, DisponibilidadMensualDTO } from '../services/disponibilidadService';
import { tutoriaService } from '../services/tutoriaService';
import { FaSearch as FaSearchIcon, FaCalendarAlt as FaCalendarAltIcon, FaUser as FaUserIcon, FaLaptop as FaLaptopIcon, FaChalkboardTeacher as FaChalkboardTeacherIcon, FaTimes as FaTimesIcon } from 'react-icons/fa';
import './AvailabilityManagement.css';

const FaTimes: any = FaTimesIcon;

const FaSearch: any = FaSearchIcon;
const FaCalendarAlt: any = FaCalendarAltIcon;
const FaUser: any = FaUserIcon;
const FaLaptop: any = FaLaptopIcon;
const FaChalkboardTeacher: any = FaChalkboardTeacherIcon;

interface Materia {
    idMateria: number;
    nombreMateria: string;
    codigoMateria: string;
}

const StudentAvailabilityBrowser: React.FC = () => {
    const { token } = useAuth();
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

    useEffect(() => {
        loadMaterias();
    }, []);

    const loadMaterias = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/api/materias', {
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
    };

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
                alert('Este bloque ya no está disponible o ya tienes una tutoría en este horario');
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

        // Filtrar por modalidad
        if (selectedModality === 'TODAS') return true;
        return block.modalidad === selectedModality;
    });

    return (
        <div className="student-browser">
            <div className="availability-header">
                <h2>Buscar Tutorías Disponibles</h2>
                <p style={{ color: '#666' }}>Selecciona una materia y un rango de fechas para encontrar tutores disponibles.</p>
            </div>

            <div className="search-filters">
                <div className="filter-group">
                    <label>Materia:</label>
                    <select
                        value={selectedMateria}
                        onChange={(e) => setSelectedMateria(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
                    >
                        <option value="">Seleccione una materia...</option>
                        {materias.map(m => (
                            <option key={m.idMateria} value={m.idMateria}>
                                {m.codigoMateria} - {m.nombreMateria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Modalidad:</label>
                    <select
                        value={selectedModality}
                        onChange={(e) => setSelectedModality(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '120px' }}
                    >
                        <option value="TODAS">Todas</option>
                        <option value="VIRTUAL">Virtual</option>
                        <option value="PRESENCIAL">Presencial</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Desde:</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div className="filter-group">
                    <label>Hasta:</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !selectedMateria}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: '#008148',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            height: '38px',
                            marginTop: '22px'
                        }}
                    >
                        {loading ? 'Buscando...' : <><FaSearch /> Buscar</>}
                    </button>
                </div>
            </div>

            <div className="results-area">
                {searched && filteredResults.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No se encontraron horarios disponibles para esta materia en las fechas seleccionadas.</p>
                    </div>
                )}

                < div className="results-grid">
                    {filteredResults.map(block => (
                        <div key={block.idDisponibilidadMensual} className="tutor-card">
                            <div className="tutor-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaUser style={{ color: '#666' }} />
                                    <span className="tutor-name">{block.nombreTutor}</span>
                                </div>
                                <span className={`modality-badge ${block.modalidad.toLowerCase()}`}>
                                    {block.modalidad === 'VIRTUAL' ? <FaLaptop /> : <FaChalkboardTeacher />} {block.modalidad}
                                </span>
                            </div>

                            <div className="card-time">
                                <FaCalendarAlt style={{ marginRight: '5px', color: '#888' }} />
                                <strong>{formatDate(block.fecha)}</strong>
                                <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    {block.horaInicio.substring(0, 5)} - {block.horaFin.substring(0, 5)}
                                </div>
                            </div>

                            <button
                                className="reserve-btn"
                                onClick={() => handleOpenModal(block)}
                            >
                                Reservar Tutoría
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Reserva */}
            {showModal && selectedBlock && (
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
                            <h3 style={{ margin: 0, color: '#008148' }}>Reservar Tutoría</h3>
                            <button
                                onClick={handleCloseModal}
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

                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ margin: '8px 0', color: '#666' }}>
                                <strong>Tutor:</strong> {selectedBlock.nombreTutor}
                            </p>
                            <p style={{ margin: '8px 0', color: '#666' }}>
                                <strong>Fecha:</strong> {formatDate(selectedBlock.fecha)}
                            </p>
                            <p style={{ margin: '8px 0', color: '#666' }}>
                                <strong>Hora:</strong> {selectedBlock.horaInicio.substring(0, 5)} - {selectedBlock.horaFin.substring(0, 5)}
                            </p>
                            <p style={{ margin: '8px 0', color: '#666' }}>
                                <strong>Modalidad:</strong> {selectedBlock.modalidad}
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                Tema de la tutoría *
                            </label>
                            <input
                                type="text"
                                value={nombreTema}
                                onChange={(e) => setNombreTema(e.target.value)}
                                placeholder="Ej: Teorema del valor medio"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                                disabled={reserving}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCloseModal}
                                disabled={reserving}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: reserving ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReservar}
                                disabled={reserving || !nombreTema.trim()}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: reserving || !nombreTema.trim() ? '#ccc' : '#008148',
                                    color: 'white',
                                    cursor: reserving || !nombreTema.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
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
