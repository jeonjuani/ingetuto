import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaBook } from 'react-icons/fa';
import './TutorSubjects.css';

interface TutorSubject {
    idTutorXMateria: number;
    idMateria: number;
    nombreMateria: string;
    codigoMateria: string;
}

const TutorSubjects: React.FC = () => {
    const { user, token, reloadUser, switchRole } = useAuth();
    const [subjects, setSubjects] = useState<TutorSubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fix para TypeScript con react-icons
    const TrashIcon: any = FaTrash;
    const BookIcon: any = FaBook;

    const fetchSubjects = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/tutor-subjects/my-subjects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            } else {
                setError('Error al cargar las materias');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (user?.activeRole === 'TUTOR' && token) {
            fetchSubjects();
        }
    }, [user, token, fetchSubjects]);

    const handleDelete = async (id: number, nombreMateria: string) => {
        const isLastSubject = subjects.length === 1;
        const confirmMessage = isLastSubject
            ? `ADVERTENCIA: Estás a punto de eliminar tu única materia ("${nombreMateria}").\n\nSi continúas, perderás tu rol de TUTOR y el acceso a las funciones de tutor.\n\n¿Estás seguro de proceder?`
            : `¿Estás seguro de eliminar "${nombreMateria}" de tus materias?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/tutor-subjects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess('Materia eliminada exitosamente');
                setSubjects(subjects.filter(s => s.idTutorXMateria !== id));

                if (isLastSubject) {
                    // Si era la última materia, recargar el usuario para actualizar roles
                    setTimeout(async () => {
                        await reloadUser();

                        // Si el usuario tiene rol ESTUDIANTE, cambiar automáticamente a ese rol
                        if (user?.roles.some(role => role.nombre === 'ESTUDIANTE')) {
                            await switchRole('ESTUDIANTE');
                        } else {
                            // Si no tiene ESTUDIANTE, redirigir al dashboard
                            window.location.href = '/dashboard';
                        }
                    }, 500);
                }

                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Error al eliminar la materia');
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión');
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading) return <div className="loading">Cargando materias...</div>;

    return (
        <div className="student-browser">
            <div className="availability-header">
                <h2>Mis Materias como Tutor</h2>
                <p style={{ color: '#64748b' }}>Estas son las materias en las que estás habilitado para impartir tutorías.</p>
            </div>

            {error && (
                <div style={{ 
                    padding: '12px 20px', 
                    backgroundColor: '#fef2f2', 
                    color: '#dc2626', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    border: '1px solid #fecaca',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>⚠️</span> {error}
                </div>
            )}
            
            {success && (
                <div style={{ 
                    padding: '12px 20px', 
                    backgroundColor: '#f0fdf4', 
                    color: '#16a34a', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    border: '1px solid #bbf7d0',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>✅</span> {success}
                </div>
            )}

            {subjects.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px', 
                    backgroundColor: 'white', 
                    borderRadius: '20px', 
                    border: '1px dashed #cbd5e1',
                    color: '#94a3b8'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '15px', color: '#cbd5e1' }}><BookIcon /></div>
                    <p>No tienes materias asignadas todavía.</p>
                    <p style={{ fontSize: '13px' }}>Postúlate a nuevas materias en la sección de "Solicitud para ser Tutor".</p>
                </div>
            ) : (
                <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {subjects.map(subject => (
                        <div key={subject.idTutorXMateria} className="tutor-card" style={{ 
                            backgroundColor: 'white', 
                            padding: '24px', 
                            borderRadius: '20px', 
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        backgroundColor: '#ecfdf5', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        color: '#10b981',
                                        fontSize: '20px'
                                    }}>
                                        <BookIcon />
                                    </div>
                                    <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: '700', 
                                        color: '#64748b', 
                                        backgroundColor: '#f1f5f9', 
                                        padding: '4px 10px', 
                                        borderRadius: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {subject.codigoMateria}
                                    </span>
                                </div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '700', color: '#1e293b', lineHeight: '1.4' }}>
                                    {subject.nombreMateria}
                                </h4>
                            </div>

                            <button
                                onClick={() => handleDelete(subject.idTutorXMateria, subject.nombreMateria)}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    border: '1px solid #fecaca',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fef2f2';
                                    e.currentTarget.style.borderColor = '#f87171';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#fecaca';
                                }}
                            >
                                <TrashIcon /> Dejar de ser tutor
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TutorSubjects;
