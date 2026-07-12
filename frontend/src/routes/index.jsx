import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import CustomerLayout from '../layouts/CustomerLayout'
import ManagerLayout from '../layouts/ManagerLayout'
import StaffLayout from '../layouts/StaffLayout'
import ProtectedRoute from './ProtectedRoute'
import { LoginPage, PortalLoginPage, RegisterPage, ForgotPasswordPage, EmailSentPage, ResetPasswordPage } from '../features/auth'
import { customerRoutes } from './customerRoutes'
import { managerRoutes } from './managerRoutes'
import { staffRoutes } from './staffRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/portal/login" element={<PortalLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/email-sent" element={<EmailSentPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Customer Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['customer']} redirectTo="/login">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        {customerRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Manager Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['manager']} redirectTo="/portal/login">
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        {managerRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Staff Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['staff']} redirectTo="/portal/login">
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        {staffRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
