import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './SubjectManagement.css';
import { FaSearch } from 'react-icons/fa';

interface Subject {
    id_materia: number;
    nombre_materia: string;
    codigoMateria: string;
}

const SubjectManagement: React.FC = () => {
    const { token } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSubject, setEditingSubject] = useState<number | null>(null);
    const [formData, setFormData] = useState({ nombre_materia: '', codigoMateria: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fix para TypeScript con react-icons
    const SearchIcon: any = FaSearch;

    // Filtrar materias por nombre o código
    const filteredSubjects = subjects.filter(subject =>
        subject.nombre_materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.codigoMateria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/materias', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error('Error al cargar materias:', error);
            setError('Error al cargar las materias');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.nombre_materia.trim() || !formData.codigoMateria.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/materias', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchSubjects();
                setFormData({ nombre_materia: '', codigoMateria: '' });
                setShowAddForm(false);
                setSuccess('Materia creada exitosamente');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const errorText = await response.text();
                setError(errorText || 'Error al crear la materia');
            }
        } catch (error) {
            console.error('Error al crear materia:', error);
            setError('Error de red al crear la materia');
        }
    };

    const handleEditSubject = (subject: Subject) => {
        setEditingSubject(subject.id_materia);
        setFormData({
            nombre_materia: subject.nombre_materia,
            codigoMateria: subject.codigoMateria
        });
        setError(null);
    };

    const handleUpdateSubject = async (id: number) => {
        setError(null);
        setSuccess(null);

        if (!formData.nombre_materia.trim() || !formData.codigoMateria.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/materias/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchSubjects();
                setEditingSubject(null);
                setFormData({ nombre_materia: '', codigoMateria: '' });
                setSuccess('Materia actualizada exitosamente');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const errorText = await response.text();
                setError(errorText || 'Error al actualizar la materia');
            }
        } catch (error) {
            console.error('Error al actualizar materia:', error);
            setError('Error de red al actualizar la materia');
        }
    };

    const handleDeleteSubject = async (id: number, nombre: string) => {
        if (!window.confirm(`¿Está seguro de eliminar la materia "${nombre}"?`)) return;

        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`http://localhost:8080/api/materias/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchSubjects();
                setSuccess('Materia eliminada exitosamente');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const errorText = await response.text();
                setError(errorText || 'Error al eliminar la materia');
            }
        } catch (error) {
            console.error('Error al eliminar materia:', error);
            setError('Error de red al eliminar la materia');
        }
    };

    const handleCancelEdit = () => {
        setEditingSubject(null);
        setFormData({ nombre_materia: '', codigoMateria: '' });
        setError(null);
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
        setFormData({ nombre_materia: '', codigoMateria: '' });
        setError(null);
    };

    if (loading) {
        return <div className="loading">Cargando materias...</div>;
    }

    return (
        <div className="subject-management">
            <h2>Gestión de Materias</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="controls-container">
                <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <button
                    className="btn-add"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancelar' : 'Agregar Materia'}
                </button>
            </div>

            {showAddForm && (
                <div className="add-form-container">
                    <h3>Nueva Materia</h3>
                    <form onSubmit={handleAddSubject} className="subject-form">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre de la Materia:</label>
                            <input
                                id="nombre"
                                type="text"
                                value={formData.nombre_materia}
                                onChange={(e) => setFormData({ ...formData, nombre_materia: e.target.value })}
                                placeholder="Ej: Cálculo Diferencial"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="codigo">Código de la Materia:</label>
                            <input
                                id="codigo"
                                type="text"
                                value={formData.codigoMateria}
                                onChange={(e) => setFormData({ ...formData, codigoMateria: e.target.value })}
                                placeholder="Ej: 2550010"
                                className="form-input"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                Crear Materia
                            </button>
                            <button type="button" className="btn-cancel" onClick={handleCancelAdd}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="subjects-table">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre de la Materia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubjects.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="no-data">
                                    No se encontraron materias
                                </td>
                            </tr>
                        ) : (
                            filteredSubjects.map(subject => (
                                <tr key={subject.id_materia}>
                                    <td>
                                        {editingSubject === subject.id_materia ? (
                                            <input
                                                type="text"
                                                value={formData.codigoMateria}
                                                onChange={(e) => setFormData({ ...formData, codigoMateria: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            subject.codigoMateria
                                        )}
                                    </td>
                                    <td>
                                        {editingSubject === subject.id_materia ? (
                                            <input
                                                type="text"
                                                value={formData.nombre_materia}
                                                onChange={(e) => setFormData({ ...formData, nombre_materia: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            subject.nombre_materia
                                        )}
                                    </td>
                                    <td>
                                        {editingSubject === subject.id_materia ? (
                                            <>
                                                <button
                                                    className="btn-save"
                                                    onClick={() => handleUpdateSubject(subject.id_materia)}
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    className="btn-cancel"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditSubject(subject)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteSubject(subject.id_materia, subject.nombre_materia)}
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
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

export default SubjectManagement;
