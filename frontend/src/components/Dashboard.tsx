import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src="/logoIngeTUTO.png" 
              alt="IngeTUTO Logo" 
              className="header-logo"
            />
            <h1>Facultad de Ingeniería</h1>
          </div>
          <div className="user-section">
            <span className="user-name">Hola, {user?.name || user?.email}</span>
            <button onClick={logout} className="logout-button">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Bienvenido a IngeTUTO</h2>
          <p>Sistema de gestión de tutorías académicas</p>
          <div className="dashboard-card">
            <h3>Tu Perfil</h3>
            <div className="profile-info">
              <p><strong>Nombre:</strong> {user?.name || 'No especificado'}</p>
              <p><strong>Correo:</strong> {user?.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

