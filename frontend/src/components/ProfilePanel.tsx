import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaUsers, FaBook, FaFileSignature, FaClipboardCheck, FaCalendarAlt, FaSearch, FaClipboardList, FaChartBar } from 'react-icons/fa';
import './ProfilePanel.css';

interface ProfilePanelProps {
    activeView: string;
    setActiveView: (view: string) => void;
    userRole?: string;
    mobileMenuOpen?: boolean;
    setMobileMenuOpen?: (open: boolean) => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: any; // react-icons tiene problemas de tipos con TypeScript, usamos any
    roles: string[];
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({
    activeView,
    setActiveView,
    userRole,
    mobileMenuOpen = false,
    setMobileMenuOpen
}) => {
    const { user, switchRole, reloadUser, logout } = useAuth();
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const roleMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
                setShowRoleMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOpenRoleMenu = async () => {
        if (!showRoleMenu) {
            if (reloadUser) {
                await reloadUser();
            }
        }
        setShowRoleMenu(!showRoleMenu);
    };

    const menuItems: MenuItem[] = [
        {
            id: 'home',
            label: 'Inicio',
            icon: FaHome,
            roles: ['ADMIN', 'FUNCIONARIO_BIENESTAR', 'ESTUDIANTE', 'TUTOR']
        },
        {
            id: 'admin',
            label: 'Administración de Usuarios',
            icon: FaUsers,
            roles: ['ADMIN']
        },
        {
            id: 'subjects',
            label: 'Gestión de Materias',
            icon: FaBook,
            roles: ['FUNCIONARIO_BIENESTAR']
        },
        {
            id: 'students',
            label: 'Gestión Estudiantes',
            icon: FaUsers,
            roles: ['FUNCIONARIO_BIENESTAR']
        },
        {
            id: 'tutor-application',
            label: 'Ser Tutor',
            icon: FaFileSignature,
            roles: ['ESTUDIANTE']
        },
        {
            id: 'tutor-requests',
            label: 'Solicitudes Tutores',
            icon: FaClipboardCheck,
            roles: ['FUNCIONARIO_BIENESTAR']
        },
        {
            id: 'bienestar-dashboard',
            label: 'Métricas de Bienestar',
            icon: FaChartBar,
            roles: ['FUNCIONARIO_BIENESTAR']
        },
        {
            id: 'tutor-subjects',
            label: 'Mis materias',
            icon: FaBook,
            roles: ['TUTOR']
        },
        {
            id: 'availability',
            label: 'Mi Disponibilidad',
            icon: FaCalendarAlt,
            roles: ['TUTOR']
        },
        {
            id: 'find-tutors',
            label: 'Buscar Tutorías',
            icon: FaSearch,
            roles: ['ESTUDIANTE']
        },
        {
            id: 'my-tutoring-sessions',
            label: 'Mis Tutorías',
            icon: FaClipboardList,
            roles: ['ESTUDIANTE']
        },
        {
            id: 'tutor-sessions',
            label: 'Mis Tutorías',
            icon: FaClipboardList,
            roles: ['TUTOR']
        }
    ];

    const visibleMenuItems = menuItems.filter(item =>
        userRole && item.roles.includes(userRole)
    );

    const handleMenuItemClick = (viewId: string) => {
        setActiveView(viewId);
        if (setMobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    return (
        <aside className={`profile-panel ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="panel-content">
                <div className="sidebar-logo-container">
                    <img
                        src="/logoIngeTUTO.png"
                        alt="IngeTUTO Logo"
                        className="sidebar-logo"
                    />
                </div>
                <div className="profile-card">
                    <div className="profile-info">
                        <div className="info-item">
                            <span>{user?.name || 'No especificado'}</span>
                            <strong>{user?.email}</strong>
                        </div>
                        <div className="info-item" style={{ overflow: 'visible' }}>
                            <div className="role-selector" ref={roleMenuRef} style={{ position: 'relative', marginTop: '4px' }}>
                                <button
                                    className="current-role-btn"
                                    onClick={handleOpenRoleMenu}
                                    style={{ width: '100%', justifyContent: 'space-between' }}
                                >
                                    {user?.activeRole || 'Sin Rol'} ▼
                                </button>
                                {showRoleMenu && (
                                    <div className="role-menu" style={{ top: '110%', width: '100%' }}>
                                        {user?.roles.map((role) => (
                                            <button
                                                key={role.idRol}
                                                className={`role-item ${user.activeRole === role.nombre ? 'active' : ''}`}
                                                onClick={() => {
                                                    switchRole(role.nombre);
                                                    setShowRoleMenu(false);
                                                }}
                                            >
                                                {role.nombre}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="panel-menu">
                    <h4>Menú</h4>
                    {visibleMenuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`menu-item ${activeView === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuItemClick(item.id)}
                            >
                                <Icon className="menu-icon" />
                                <span className="menu-label">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <button onClick={logout} className="logout-button" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ProfilePanel;
