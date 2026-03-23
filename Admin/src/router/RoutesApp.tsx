import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectRoutes from './ProtectRoutes';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import SystemLogsPage from '../pages/SystemLogsPage';
import UserFeedbackPage from '../pages/UserFeedbackPage';
import UserNotificationsPage from '../pages/UserNotificationsPage';
import AdminLayout from '../router/AdminLayout';

export default function RoutesApp(){
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectRoutes />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/logs" element={<SystemLogsPage />} />
            <Route path="/feedback" element={<UserFeedbackPage />} />
            <Route path="/notifications" element={<UserNotificationsPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}