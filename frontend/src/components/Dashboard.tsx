import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import UserManagement from './UserManagement';
import SubjectManagement from './SubjectManagement';
import TutorApplication from './TutorApplication';
import TutorRequestReview from './TutorRequestReview';
import TutorSubjects from './TutorSubjects';
import StudentManagement from './StudentManagement';
import ProfilePanel from './ProfilePanel';
import PhoneNumberModal from './PhoneNumberModal';
import AvailabilityManagement from './AvailabilityManagement';
import StudentAvailabilityBrowser from './StudentAvailabilityBrowser';
import MyTutoringSessions from './MyTutoringSessions';
import TutorSessions from './TutorSessions';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout, switchRole, reloadUser, needsPhoneNumber, updatePhoneNumber } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const [activeView, setActiveView] = React.useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleOpenRoleMenu = async () => {
    if (!showRoleMenu) {
      if (reloadUser) {
        await reloadUser();
      }
    }
    setShowRoleMenu(!showRoleMenu);
  };

  const MenuIcon: any = mobileMenuOpen ? FaTimes : FaBars;

  const roleMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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

  return (
    <>
      {needsPhoneNumber === true && <PhoneNumberModal onPhoneSubmit={updatePhoneNumber} />}
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo-section">
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <MenuIcon />
              </button>
              <img
                src="/logoIngeTUTO.png"
                alt="IngeTUTO Logo"
                className="header-logo"
              />
              <h1 className="header-title">Facultad de Ingeniería</h1>
            </div>
            <div className="user-section">
              <div className="role-selector" ref={roleMenuRef}>
                <button
                  className="current-role-btn"
                  onClick={handleOpenRoleMenu}
                >
                  {user?.activeRole || 'Sin Rol'} ▼
                </button>
                {showRoleMenu && (
                  <div className="role-menu">
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
              <span className="user-name">Hola, {user?.name || user?.email}</span>
              <button onClick={logout} className="logout-button">
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          {mobileMenuOpen && (
            <div
              className="mobile-overlay"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <ProfilePanel
            activeView={activeView}
            setActiveView={setActiveView}
            userRole={user?.activeRole}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          <div className="dashboard-content">
            {activeView === 'admin' && (user?.activeRole === 'ADMIN' || user?.activeRole === 'FUNCIONARIO_BIENESTAR') ? (
              <UserManagement />
            ) : activeView === 'subjects' && (user?.activeRole === 'ADMIN' || user?.activeRole === 'FUNCIONARIO_BIENESTAR') ? (
              <SubjectManagement />
            ) : activeView === 'tutor-application' && user?.activeRole === 'ESTUDIANTE' ? (
              <TutorApplication />
            ) : activeView === 'tutor-requests' && user?.activeRole === 'FUNCIONARIO_BIENESTAR' ? (
              <TutorRequestReview />
            ) : activeView === 'tutor-subjects' && user?.activeRole === 'TUTOR' ? (
              <TutorSubjects />
            ) : activeView === 'availability' && user?.activeRole === 'TUTOR' ? (
              <AvailabilityManagement />
            ) : activeView === 'find-tutors' && user?.activeRole === 'ESTUDIANTE' ? (
              <StudentAvailabilityBrowser />
            ) : activeView === 'my-tutoring-sessions' && user?.activeRole === 'ESTUDIANTE' ? (
              <MyTutoringSessions />
            ) : activeView === 'tutor-sessions' && user?.activeRole === 'TUTOR' ? (
              <TutorSessions />
            ) : activeView === 'students' && user?.activeRole === 'FUNCIONARIO_BIENESTAR' ? (
              <StudentManagement />
            ) : (
              <div className="welcome-view">
                <h2>Bienvenido a IngeTUTO</h2>
                <p>Sistema de gestión de tutorías académicas</p>
                <p className="welcome-msg">Selecciona una opción del menú lateral para comenzar.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
