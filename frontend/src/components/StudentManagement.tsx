import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserManagement.css';
import { FaSearch, FaFilter, FaUserMinus, FaTrash } from 'react-icons/fa';

interface Role {
    idRol: number;
    nombre: string;
    descripcion: string;
}

interface User {
    idUsuario: number;
    primerNombre: string;
    primerApellido: string;
    correoUsuario: string;
    roles: Role[];
}

const StudentManagement: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('TODOS');

    // Fix para TypeScript con react-icons
    const SearchIcon: any = FaSearch;
    const FilterIcon: any = FaFilter;
    const RevokeIcon: any = FaUserMinus;
    const DeleteIcon: any = FaTrash;

    // Filtrar usuarios por correo y rol
    const filteredUsers = users.filter(u => {
        const matchesEmail = u.correoUsuario.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'TODOS' || u.roles.some(r => r.nombre === roleFilter);
        // Solo mostrar estudiantes y tutores (excluir admins y funcionarios si se desea, o mostrar todos pero limitar acciones)
        // Por ahora mostramos todos para que pueda buscar cualquier estudiante, pero las acciones dependerán del rol
        return matchesEmail && matchesRole;
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeTutor = async (user: User) => {
        if (!window.confirm(`¿Estás seguro de quitar el rol de TUTOR a ${user.primerNombre} ${user.primerApellido}? Esto eliminará sus materias asociadas.`)) {
            return;
        }

        // Filtrar el rol de TUTOR
        const newRoles = user.roles.filter(r => r.nombre !== 'TUTOR').map(r => r.nombre);

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${user.idUsuario}/roles`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRoles),
            });

            if (response.ok) {
                alert('Rol de tutor revocado exitosamente');
                await fetchUsers();
            } else {
                const errorText = await response.text();
                alert(errorText || 'Error al revocar rol');
            }
        } catch (error) {
            console.error('Error al revocar rol:', error);
            alert('Error de red al revocar rol');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario permanentemente?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchUsers();
            } else {
                alert('Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error de red al eliminar usuario');
        }
    };

    if (loading) {
        return <div className="loading">Cargando estudiantes...</div>;
    }

    return (
        <div className="user-management">
            <h2>Gestión de Estudiantes</h2>

            <div className="filters-container">
                <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por correo"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-box">
                    <FilterIcon className="filter-icon" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="role-filter-select"
                    >
                        <option value="TODOS">Todos los roles</option>
                        <option value="ESTUDIANTE">Estudiante</option>
                        <option value="TUTOR">Tutor</option>
                    </select>
                </div>
            </div>

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Roles</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.idUsuario}>
                                <td>{`${user.primerNombre} ${user.primerApellido}`}</td>
                                <td>{user.correoUsuario}</td>
                                <td>
                                    <span className="role-badges">
                                        {user.roles.map(role => (
                                            <span key={role.idRol} className="role-badge">
                                                {role.nombre}
                                            </span>
                                        ))}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {user.roles.some(r => r.nombre === 'TUTOR') && (
                                            <button
                                                className="btn-revoke"
                                                onClick={() => handleRevokeTutor(user)}
                                                title="Revocar rol de Tutor"
                                            >
                                                <RevokeIcon /> Revocar Tutor
                                            </button>
                                        )}
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteUser(user.idUsuario)}
                                            title="Eliminar Usuario"
                                        >
                                            <DeleteIcon /> Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentManagement;
