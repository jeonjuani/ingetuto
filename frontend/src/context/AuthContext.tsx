import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { axiosInstance } from '../services/axiosConfig';
import SessionExpiredModal from '../components/SessionExpiredModal';

interface Role {
  idRol: number;
  nombre: string;
  descripcion: string;
}

interface User {
  email: string;
  name: string;
  id?: number;
  roles: Role[];
  activeRole?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  needsPhoneNumber: boolean | null;
  setTokenFromCallback: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (targetRole: string) => Promise<void>;
  reloadUser: () => Promise<void>;
  updatePhoneNumber: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [needsPhoneNumber, setNeedsPhoneNumber] = useState<boolean | null>(null);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const hasInitialized = React.useRef(false);

  // Helper para decodificar el payload del JWT
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Escuchar evento de sesión expirada
  useEffect(() => {
    const handleSessionExpired = () => {
      setShowSessionExpiredModal(true);
      // Limpiar datos locales pero mantener el modal visible
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  const handleSessionExpiredConfirm = () => {
    setShowSessionExpiredModal(false);
    window.location.href = '/login';
  };

  // Cargar usuario y token desde localStorage al iniciar
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Siempre obtener datos frescos del servidor al iniciar
      fetchUser(savedToken);
    }
  }, []);

  const fetchUser = async (accessToken: string) => {
    try {
      const response = await axiosInstance.get('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const usuario = response.data;
      const decodedToken = parseJwt(accessToken);
      const activeRole = decodedToken ? decodedToken.activeRole : null;

      const userData: User = {
        email: usuario.correoUsuario,
        name: `${usuario.primerNombre} ${usuario.primerApellido}`.trim(),
        id: usuario.idUsuario,
        roles: usuario.roles || [],
        activeRole: activeRole
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Verificar si necesita teléfono
      const phoneValue = usuario.telefonoUsuario;
      const hasPhone = phoneValue && typeof phoneValue === 'string' && phoneValue.trim().length >= 10;
      setNeedsPhoneNumber(!hasPhone);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  const setTokenFromCallback = async (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    await fetchUser(newToken);
  };

  const switchRole = async (targetRole: string) => {
    if (!token) return;

    try {
      const response = await axiosInstance.post(`/api/auth/switch-role?targetRole=${targetRole}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
      const newToken = data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      await fetchUser(newToken);
      window.location.reload(); // Recargar para asegurar que el estado se limpie/actualice completamente
    } catch (error) {
      console.error('Error de red al cambiar de rol:', error);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await api.logout(token);
      } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error);
      }
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const reloadUser = async () => {
    if (!token) return;
    await fetchUser(token);
  };

  const updatePhoneNumber = async (phone: string) => {
    if (!token || !user?.id) {
      throw new Error('No hay sesión activa');
    }

    try {
      await axiosInstance.put(`/api/usuarios/phone?phoneNumber=${encodeURIComponent(phone)}&userId=${user.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Recargar usuario para actualizar el estado
      await fetchUser(token);
      setNeedsPhoneNumber(false);
    } catch (error: any) {
      throw new Error(error.response?.data || error.message || 'Error de conexión');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        needsPhoneNumber,
        setTokenFromCallback,
        logout,
        switchRole,
        reloadUser,
        updatePhoneNumber,
      }}
    >
      {children}
      {showSessionExpiredModal && (
        <SessionExpiredModal onConfirm={handleSessionExpiredConfirm} />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

