import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  // Si hay token o error en la URL, mostrar el callback
  const urlParams = new URLSearchParams(window.location.search);
  const hasCallback = urlParams.has('token') || urlParams.has('message');
  
  if (hasCallback) {
    return <AuthCallback />;
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <Login />;
}

export default App;
