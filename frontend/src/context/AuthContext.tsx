import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
  const hasInitialized = React.useRef(false);

  // Helper para decodificar el payload del JWT
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
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
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const usuario = await response.json();
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
      }
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
      const response = await fetch(`http://localhost:8080/api/auth/switch-role?targetRole=${targetRole}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        await fetchUser(newToken);
        window.location.reload(); // Recargar para asegurar que el estado se limpie/actualice completamente
      } else {
        console.error('Error al cambiar de rol');
      }
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
      const response = await fetch(`http://localhost:8080/api/usuarios/phone?phoneNumber=${encodeURIComponent(phone)}&userId=${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el teléfono');
      }

      // Recargar usuario para actualizar el estado
      await fetchUser(token);
      setNeedsPhoneNumber(false);
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
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

