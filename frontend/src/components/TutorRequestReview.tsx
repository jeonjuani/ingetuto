import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaDownload, FaCheck, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';
import './TutorRequestReview.css';

interface Subject {
    id_materia: number;
    nombre_materia: string;
    codigoMateria: string;
}

interface User {
    idUsuario: number;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    correoUsuario: string;
}

interface Application {
    idSolicitud: number;
    aspirante: User;
    materia: Subject;
    fechaSolicitud: string;
    estado: string;
    historiaAcademica: string;
    archivoSoporte: string;
    observacion: string;
}

const TutorRequestReview: React.FC = () => {
    const { token } = useAuth();
    const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
    const [historyApplications, setHistoryApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [observation, setObservation] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

    // Filtros para historial
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS');

    // Fix para TypeScript con react-icons
    const DownloadIcon: any = FaDownload;
    const CheckIcon: any = FaCheck;
    const TimesIcon: any = FaTimes;
    const SearchIcon: any = FaSearch;
    const FilterIcon: any = FaFilter;

    useEffect(() => {
        fetchPendingApplications();
        fetchHistoryApplications();
    }, []);

    const fetchPendingApplications = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/tutor-requests/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingApplications(data);
            }
        } catch (error) {
            console.error('Error fetching pending applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryApplications = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/tutor-requests/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHistoryApplications(data);
            }
        } catch (error) {
            console.error('Error fetching history applications:', error);
        }
    };

    const handleDownload = async (fileName: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/tutor-requests/download/${fileName}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('Error al descargar el archivo');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleAction = async (id: number, status: 'APROBADO' | 'DENEGADO') => {
        if (status === 'DENEGADO' && !observation.trim()) {
            alert('Por favor ingrese una observación para denegar la solicitud.');
            return;
        }

        if (!window.confirm(`¿Está seguro de ${status === 'APROBADO' ? 'aprobar' : 'denegar'} esta solicitud?`)) {
            return;
        }

        setProcessingId(id);
        try {
            const response = await fetch(`http://localhost:8080/api/tutor-requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado: status,
                    observacion: observation
                })
            });

            if (response.ok) {
                const updatedApp = await response.json();
                // Mover de pendientes a historial
                setPendingApplications(pendingApplications.filter(app => app.idSolicitud !== id));
                setHistoryApplications([updatedApp, ...historyApplications]);
                setSelectedApp(null);
                setObservation('');
            } else {
                alert('Error al actualizar el estado de la solicitud');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const getFullName = (user: User) => {
        return `${user.primerNombre} ${user.segundoNombre || ''} ${user.primerApellido} ${user.segundoApellido || ''}`.trim();
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'APROBADO': return 'badge-success';
            case 'DENEGADO': return 'badge-danger';
            case 'REVOCADO': return 'badge-revoked';
            default: return 'badge-warning';
        }
    };

    const filteredHistory = historyApplications.filter(app => {
        const fullName = getFullName(app.aspirante).toLowerCase();
        const email = app.aspirante.correoUsuario.toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = fullName.includes(search) || email.includes(search);
        const matchesStatus = statusFilter === 'TODOS' || app.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading">Cargando solicitudes...</div>;

    return (
        <div className="tutor-review">
            <h2>Gestión de Solicitudes de Tutores</h2>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setActiveTab('PENDING')}
                >
                    Pendientes ({pendingApplications.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
                    onClick={() => setActiveTab('HISTORY')}
                >
                    Historial
                </button>
            </div>

            {activeTab === 'PENDING' ? (
                <div className="pending-view">
                    {pendingApplications.length === 0 ? (
                        <div className="no-data">No hay solicitudes pendientes de revisión.</div>
                    ) : (
                        <div className="requests-grid">
                            {pendingApplications.map(app => (
                                <div key={app.idSolicitud} className="request-card">
                                    <div className="request-header">
                                        <h3>{getFullName(app.aspirante)}</h3>
                                        <span className="date">{app.fechaSolicitud}</span>
                                    </div>

                                    <div className="request-body">
                                        <p><strong>Materia:</strong> {app.materia.nombre_materia} ({app.materia.codigoMateria})</p>
                                        <p><strong>Email:</strong> {app.aspirante.correoUsuario}</p>

                                        <div className="documents-section">
                                            <h4>Documentos:</h4>
                                            <button
                                                className="btn-download"
                                                onClick={() => handleDownload(app.historiaAcademica)}
                                            >
                                                <DownloadIcon /> Historia Académica
                                            </button>
                                            <button
                                                className="btn-download"
                                                onClick={() => handleDownload(app.archivoSoporte)}
                                            >
                                                <DownloadIcon /> Constancia Matrícula
                                            </button>
                                        </div>

                                        {selectedApp === app.idSolicitud ? (
                                            <div className="action-area">
                                                <textarea
                                                    placeholder="Observaciones (requerido para denegar)..."
                                                    value={observation}
                                                    onChange={(e) => setObservation(e.target.value)}
                                                    className="observation-input"
                                                />
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => handleAction(app.idSolicitud, 'APROBADO')}
                                                        disabled={processingId === app.idSolicitud}
                                                    >
                                                        <CheckIcon /> Aprobar
                                                    </button>
                                                    <button
                                                        className="btn-deny"
                                                        onClick={() => handleAction(app.idSolicitud, 'DENEGADO')}
                                                        disabled={processingId === app.idSolicitud}
                                                    >
                                                        <TimesIcon /> Denegar
                                                    </button>
                                                    <button
                                                        className="btn-cancel-action"
                                                        onClick={() => {
                                                            setSelectedApp(null);
                                                            setObservation('');
                                                        }}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn-review"
                                                onClick={() => setSelectedApp(app.idSolicitud)}
                                            >
                                                Revisar Solicitud
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="history-view">
                    <div className="filters-container">
                        <div className="search-box">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o correo"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-box">
                            <FilterIcon className="filter-icon" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="status-filter-select"
                            >
                                <option value="TODOS">Todos los estados</option>
                                <option value="APROBADO">Aprobado</option>
                                <option value="DENEGADO">Denegado</option>
                                <option value="REVOCADO">Revocado</option>
                            </select>
                        </div>
                    </div>

                    <div className="history-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Aspirante</th>
                                    <th>Materia</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Observación</th>
                                    <th>Documentos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="no-results">No se encontraron solicitudes.</td>
                                    </tr>
                                ) : (
                                    filteredHistory.map(app => (
                                        <tr key={app.idSolicitud}>
                                            <td>
                                                <div className="user-cell">
                                                    <span className="user-name">{getFullName(app.aspirante)}</span>
                                                    <span className="user-email">{app.aspirante.correoUsuario}</span>
                                                </div>
                                            </td>
                                            <td>{app.materia.nombre_materia}</td>
                                            <td>{app.fechaSolicitud}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(app.estado)}`}>
                                                    {app.estado}
                                                </span>
                                            </td>
                                            <td>{app.observacion || '-'}</td>
                                            <td>
                                                <div className="mini-actions">
                                                    <button onClick={() => handleDownload(app.historiaAcademica)} title="Historia Académica">
                                                        <DownloadIcon /> HA
                                                    </button>
                                                    <button onClick={() => handleDownload(app.archivoSoporte)} title="Constancia Matrícula">
                                                        <DownloadIcon /> CM
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorRequestReview;