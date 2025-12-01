import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserManagement.css';
import { FaSearch, FaFilter } from 'react-icons/fa';

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

const ALL_ROLES = ['ESTUDIANTE', 'TUTOR', 'FUNCIONARIO_BIENESTAR', 'ADMIN'];

const UserManagement: React.FC = () => {
    const { token, user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<number | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('TODOS');

    // Fix para TypeScript con react-icons
    const SearchIcon: any = FaSearch;
    const FilterIcon: any = FaFilter;

    // RN: FUNCIONARIO_BIENESTAR no puede asignar rol ADMIN
    const availableRoles = user?.activeRole === 'FUNCIONARIO_BIENESTAR'
        ? ALL_ROLES.filter(role => role !== 'ADMIN')
        : ALL_ROLES;

    // Filtrar usuarios por correo y rol
    const filteredUsers = users.filter(u => {
        const matchesEmail = u.correoUsuario.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'TODOS' || u.roles.some(r => r.nombre === roleFilter);
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

    const handleEditRoles = (user: User) => {
        setEditingUser(user.idUsuario);
        setSelectedRoles(user.roles.map(r => r.nombre));
    };

    const handleRoleToggle = (roleName: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSaveRoles = async (userId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/roles`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedRoles),
            });

            if (response.ok) {
                await fetchUsers();
                setEditingUser(null);
            } else {
                const errorText = await response.text();
                alert(errorText || 'Error al actualizar roles');
            }
        } catch (error) {
            console.error('Error al guardar roles:', error);
            alert('Error de red al actualizar roles');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

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
        return <div className="loading">Cargando usuarios...</div>;
    }

    return (
        <div className="user-management">
            <h2>Administración de Usuarios</h2>

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
                        {ALL_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
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
                                    {editingUser === user.idUsuario ? (
                                        <div className="role-checkboxes">
                                            {availableRoles.map(role => (
                                                <label key={role}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRoles.includes(role)}
                                                        onChange={() => handleRoleToggle(role)}
                                                    />
                                                    {role}
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="role-badges">
                                            {user.roles.map(role => (
                                                <span key={role.idRol} className="role-badge">
                                                    {role.nombre}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {editingUser === user.idUsuario ? (
                                        <>
                                            <button
                                                className="btn-save"
                                                onClick={() => handleSaveRoles(user.idUsuario)}
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                className="btn-cancel"
                                                onClick={() => setEditingUser(null)}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditRoles(user)}
                                            >
                                                Editar Roles
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteUser(user.idUsuario)}
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
