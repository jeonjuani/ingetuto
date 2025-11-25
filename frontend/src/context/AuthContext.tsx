import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  email: string;
  name: string;
  id?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setTokenFromCallback: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar usuario y token desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    // No procesamos el token de la URL aquí, lo hace AuthCallback
  }, []);

  const setTokenFromCallback = async (token: string) => {
    try {
      setToken(token);
      localStorage.setItem('token', token);
      
      // Obtener información del usuario desde el backend
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const usuario = await response.json();
        const userData: User = {
          email: usuario.correoUsuario,
          name: `${usuario.primerNombre} ${usuario.primerApellido}`.trim(),
          id: usuario.idUsuario,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error al procesar token:', error);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        setTokenFromCallback,
        logout,
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

