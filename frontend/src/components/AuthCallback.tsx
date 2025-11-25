import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const AuthCallback: React.FC = () => {
  const { setTokenFromCallback, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const errorMessage = urlParams.get('message');
      
      if (errorMessage) {
        setError(decodeURIComponent(errorMessage));
        setLoading(false);
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else if (token) {
        try {
          await setTokenFromCallback(token);
          // Limpiar la URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          // Esperar un momento para que el estado se actualice
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } catch (err) {
          setError('Error al procesar la autenticación');
          setLoading(false);
        }
      } else {
        setError('No se recibió token de autenticación');
        setLoading(false);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    processCallback();
  }, [setTokenFromCallback]);

  // Si ya está autenticado, redirigir inmediatamente
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img 
            src="/logoIngeTUTO.png" 
            alt="IngeTUTO Logo" 
            className="auth-logo"
          />
          {loading ? (
            <>
              <h2>Autenticando...</h2>
              <p>Por favor espera mientras procesamos tu sesión</p>
            </>
          ) : error ? (
            <>
              <h2>Error de Autenticación</h2>
              <div className="error-message">{error}</div>
              <p>Serás redirigido en unos momentos...</p>
            </>
          ) : (
            <>
              <h2>¡Autenticación exitosa!</h2>
              <p>Redirigiendo al dashboard...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

