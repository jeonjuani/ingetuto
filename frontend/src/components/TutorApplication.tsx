import React, { useState, useEffect, useCallback } from 'react';
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

    const fetchSubjects = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/materias`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    }, [token]);

    const fetchMyApplications = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/tutor-requests/my-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchSubjects();
        fetchMyApplications();
    }, [fetchSubjects, fetchMyApplications]);

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
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/tutor-requests`, {
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
        <div className="student-browser">
            <div className="availability-header">
                <h2>Solicitud para ser Tutor</h2>
                <p style={{ color: '#64748b' }}>Postúlate para compartir tus conocimientos con otros estudiantes de la Facultad.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', alignItems: 'start' }}>
                
                {/* Formulario de Solicitud */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '30px', 
                    borderRadius: '20px', 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f1f5f9'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Nueva Solicitud</h3>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Selecciona la Materia</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                style={{ 
                                    width: '100%',
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    border: '1.5px solid #e2e8f0',
                                    backgroundColor: '#f8fafc',
                                    color: '#1e293b',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            >
                                <option value="">-- Seleccionar --</option>
                                {subjects.map(subject => (
                                    <option key={subject.id_materia} value={subject.id_materia}>
                                        {subject.nombre_materia} ({subject.codigoMateria})
                                    </option>
                                ))}
                            </select>
                            {selectedSubject && (
                                <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '10px', fontSize: '12px', color: '#2563eb', border: '1px solid #dbeafe' }}>
                                    <strong>Importante:</strong> Verifica que el código <strong>{subjects.find(s => s.id_materia.toString() === selectedSubject)?.codigoMateria}</strong> coincida con tu historia académica.
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Historia Académica (PDF)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setAcademicHistory(e.target.files ? e.target.files[0] : null)}
                                style={{ 
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '13px',
                                    color: '#64748b'
                                }}
                            />
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>Debe mostrar la nota aprobatoria de la materia.</p>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Constancia de Matrícula (PDF)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setEnrollmentCert(e.target.files ? e.target.files[0] : null)}
                                style={{ 
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '13px',
                                    color: '#64748b'
                                }}
                            />
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>Para verificar que eres estudiante activo.</p>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px' }}>
                                {error}
                            </div>
                        )}
                        
                        {success && (
                            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#16a34a', fontSize: '13px' }}>
                                {success}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                marginTop: '10px',
                                padding: '14px',
                                backgroundColor: loading ? '#e2e8f0' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '15px',
                                fontWeight: '700',
                                transition: 'all 0.2s ease',
                                boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            {loading ? 'Procesando...' : 'Enviar Solicitud'}
                        </button>
                    </form>
                </div>

                {/* Listado de Solicitudes */}
                <div className="applications-list">
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Mis Solicitudes</h3>
                    
                    {applications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                            <p style={{ color: '#94a3b8', margin: 0 }}>Aún no has realizado ninguna solicitud.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {applications.map(app => (
                                <div key={app.idSolicitud} style={{ 
                                    backgroundColor: 'white', 
                                    padding: '20px', 
                                    borderRadius: '16px', 
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{app.materia.nombre_materia}</h4>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Solicitado el {new Date(app.fechaSolicitud).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            backgroundColor: app.estado === 'APROBADO' ? '#ecfdf5' : app.estado === 'DENEGADO' ? '#fef2f2' : '#fffbeb',
                                            color: app.estado === 'APROBADO' ? '#059669' : app.estado === 'DENEGADO' ? '#dc2626' : '#d97706',
                                            border: `1px solid ${app.estado === 'APROBADO' ? '#bbf7d0' : app.estado === 'DENEGADO' ? '#fecaca' : '#fef3c7'}`,
                                            textTransform: 'uppercase'
                                        }}>
                                            {app.estado}
                                        </span>
                                    </div>
                                    
                                    {app.observacion && (
                                        <div style={{ 
                                            padding: '10px', 
                                            backgroundColor: '#f8fafc', 
                                            borderRadius: '8px', 
                                            fontSize: '13px', 
                                            color: '#64748b',
                                            borderLeft: '3px solid #cbd5e1'
                                        }}>
                                            <strong>Nota:</strong> {app.observacion}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorApplication;
