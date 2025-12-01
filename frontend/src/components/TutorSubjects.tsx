import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTrash } from 'react-icons/fa';
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

    const fetchSubjects = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/api/tutor-subjects/my-subjects', {
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
            const response = await fetch(`http://localhost:8080/api/tutor-subjects/${id}`, {
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
        <div className="tutor-subjects">
            <h2>Mis materias</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="subjects-table">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre de la materia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="no-data">
                                    No tienes materias asignadas como tutor
                                </td>
                            </tr>
                        ) : (
                            subjects.map(subject => (
                                <tr key={subject.idTutorXMateria}>
                                    <td>{subject.codigoMateria}</td>
                                    <td>{subject.nombreMateria}</td>
                                    <td>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(
                                                subject.idTutorXMateria,
                                                subject.nombreMateria
                                            )}
                                            title="Eliminar materia"
                                        >
                                            <TrashIcon /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TutorSubjects;
