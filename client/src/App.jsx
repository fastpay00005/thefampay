import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// User Mobile-First App Pages
import { DashboardPage } from './pages/DashboardPage';
import { TokenCashOutPage } from './pages/TokenCashOutPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { ToolPage } from './pages/ToolPage';
import { AssetsPage } from './pages/AssetsPage';
import { DepositPage } from './pages/DepositPage';
import { WalletPage } from './pages/WalletPage';
import { TeamsPage } from './pages/TeamsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LuckySpinPage } from './pages/LuckySpinPage';
import { TasksPage } from './pages/TasksPage';

// Public User Authentication Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Standalone Dedicated Admin Portal
import { AdminRoute } from './admin/components/AdminRoute';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminOverviewPage } from './admin/pages/AdminOverviewPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { AdminDepositsPage } from './admin/pages/AdminDepositsPage';
import { AdminWithdrawalsPage } from './admin/pages/AdminWithdrawalsPage';
import { AdminChannelsPage } from './admin/pages/AdminChannelsPage';
import { AdminTasksPage } from './admin/pages/AdminTasksPage';
import { AdminBroadcastPage } from './admin/pages/AdminBroadcastPage';
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage';
import { AdminUpiReviewPage } from './admin/pages/AdminUpiReviewPage';
import { AdminSellRequestsPage } from './admin/pages/AdminSellRequestsPage';
import { AdminBannersPage } from './admin/pages/AdminBannersPage';
import { AdminMaintenancePage } from './admin/pages/AdminMaintenancePage';

import { ToastNotification } from './components/common/ToastNotification';
import { MaintenanceBarrier } from './components/common/MaintenanceBarrier';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ToastNotification />
        <MaintenanceBarrier>
          <Routes>
            {/* ========================================= */}
            {/* 1. PUBLIC USER AUTHENTICATION             */}
            {/* ========================================= */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ========================================= */}
            {/* 2. PROTECTED USER MOBILE APP (5 Spec Tabs)*/}
            {/* ========================================= */}
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
            <Route path="/tool" element={<ProtectedRoute><ToolPage /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
            
            {/* Cash Out & Trade */}
            <Route path="/token" element={<ProtectedRoute><TokenCashOutPage /></ProtectedRoute>} />
            <Route path="/trade" element={<ProtectedRoute><TokenCashOutPage /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
            
            {/* Wallet, Profile & Utilities */}
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/lucky-spin" element={<ProtectedRoute><LuckySpinPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />

            {/* ========================================= */}
            {/* 3. DEDICATED STANDALONE ADMIN PORTAL      */}
            {/* ========================================= */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/deposits" element={<AdminDepositsPage />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
              <Route path="/admin/sell-requests" element={<AdminSellRequestsPage />} />
              <Route path="/admin/upi-review" element={<AdminUpiReviewPage />} />
              <Route path="/admin/channels" element={<AdminChannelsPage />} />
              <Route path="/admin/tasks" element={<AdminTasksPage />} />
              <Route path="/admin/banners" element={<AdminBannersPage />} />
              <Route path="/admin/maintenance" element={<AdminMaintenancePage />} />
              <Route path="/admin/broadcast" element={<AdminBroadcastPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MaintenanceBarrier>
      </BrowserRouter>
    </AppProvider>
  );
}
