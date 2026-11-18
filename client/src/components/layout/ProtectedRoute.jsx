import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';

export const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  const location = useLocation();

  const token = authService.getStoredToken();
  const isAuthenticated = user.isLoggedIn && !!token;

  if (!isAuthenticated) {
    // Redirect to login page and remember where the user tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

