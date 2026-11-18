import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AdminThemeProvider } from '../context/AdminThemeContext';
import { AdminLayout } from '../layouts/AdminLayout';

export const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('fampay_admin_token');

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminThemeProvider>
      <AdminLayout>{children || <Outlet />}</AdminLayout>
    </AdminThemeProvider>
  );
};
