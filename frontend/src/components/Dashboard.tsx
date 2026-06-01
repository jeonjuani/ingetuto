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
import BienestarDashboard from './BienestarDashboard';
import BienestarErrorBoundary from './BienestarErrorBoundary';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, needsPhoneNumber, updatePhoneNumber } = useAuth();
  const [activeView, setActiveView] = React.useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const MenuIcon: any = mobileMenuOpen ? FaTimes : FaBars;

  return (
    <>
      {needsPhoneNumber === true && <PhoneNumberModal onPhoneSubmit={updatePhoneNumber} />}
      <div className="dashboard-container">
        <button
          className="mobile-menu-btn floating"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>

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
            ) : activeView === 'bienestar-dashboard' && user?.activeRole === 'FUNCIONARIO_BIENESTAR' ? (
              <BienestarErrorBoundary>
                <BienestarDashboard />
              </BienestarErrorBoundary>
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
