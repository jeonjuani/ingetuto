import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaUsers, FaBook, FaFileSignature, FaClipboardCheck, FaCalendarAlt, FaSearch, FaClipboardList } from 'react-icons/fa';
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
    const { user } = useAuth();

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
                <div className="profile-card">
                    <h3>Tu Perfil</h3>
                    <div className="profile-info">
                        <div className="info-item">
                            <strong>Nombre:</strong>
                            <span>{user?.name || 'No especificado'}</span>
                        </div>
                        <div className="info-item">
                            <strong>Correo:</strong>
                            <span>{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <strong>Rol Actual:</strong>
                            <span className="current-role">{user?.activeRole}</span>
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
            </div>
        </aside>
    );
};

export default ProfilePanel;
