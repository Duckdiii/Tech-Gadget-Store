import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, ROLE_LANDING } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_LANDING[user.role] || '/'} replace />
  }

  return children
}
