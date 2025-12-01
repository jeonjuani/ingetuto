import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './TutorApplication.css';

interface Subject {
    id_materia: number;
    nombre_materia: string;
    codigoMateria: string;
}

interface Application {
    idSolicitud: number;
    materia: Subject;
    fechaSolicitud: string;
    estado: string;
    observacion: string;
}

const TutorApplication: React.FC = () => {
    const { token } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [academicHistory, setAcademicHistory] = useState<File | null>(null);
    const [enrollmentCert, setEnrollmentCert] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchSubjects();
        fetchMyApplications();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/materias', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/tutor-requests/my-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedSubject || !academicHistory || !enrollmentCert) {
            setError('Por favor completa todos los campos y adjunta los documentos requeridos.');
            return;
        }

        const formData = new FormData();
        formData.append('idMateria', selectedSubject);
        formData.append('historiaAcademica', academicHistory);
        formData.append('archivoSoporte', enrollmentCert);

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/tutor-requests', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setSuccess('Solicitud enviada exitosamente.');
                setSelectedSubject('');
                setAcademicHistory(null);
                setEnrollmentCert(null);
                // Reset file inputs
                const fileInputs = document.querySelectorAll('input[type="file"]');
                fileInputs.forEach((input: any) => input.value = '');
                fetchMyApplications();
            } else {
                const errorText = await response.text();
                setError(errorText || 'Error al enviar la solicitud.');
            }
        } catch (error) {
            setError('Error de conexión al enviar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'APROBADO': return 'badge-success';
            case 'DENEGADO': return 'badge-danger';
            default: return 'badge-warning';
        }
    };

    return (
        <div className="tutor-application">
            <h2>Solicitud para ser Tutor</h2>

            <div className="application-form-card">
                <h3>Carga de archivos (máximo 10MB por archivo)</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Selecciona la Materia:</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="form-select"
                        >
                            <option value="">-- Seleccionar --</option>
                            {subjects.map(subject => (
                                <option key={subject.id_materia} value={subject.id_materia}>
                                    {subject.nombre_materia} ({subject.codigoMateria})
                                </option>
                            ))}
                        </select>
                        {selectedSubject && (
                            <div className="subject-code-info" style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                                <strong>Verifique que este código coincida con el de la historia académica:</strong> {subjects.find(s => s.id_materia.toString() === selectedSubject)?.codigoMateria}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Historia Académica (PDF) - Nota aprobatoria:</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setAcademicHistory(e.target.files ? e.target.files[0] : null)}
                            className="form-file-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Constancia de Matrícula (PDF) - Estudiante activo:</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setEnrollmentCert(e.target.files ? e.target.files[0] : null)}
                            className="form-file-input"
                        />
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                </form>
            </div>

            <div className="applications-list">
                <h3>Mis Solicitudes</h3>
                {applications.length === 0 ? (
                    <p className="no-data">No has realizado ninguna solicitud.</p>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Materia</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Observación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.idSolicitud}>
                                        <td>{app.materia.nombre_materia}</td>
                                        <td>{app.fechaSolicitud}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(app.estado)}`}>
                                                {app.estado}
                                            </span>
                                        </td>
                                        <td>{app.observacion || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorApplication;
