import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ROLE_LANDING } from '../config/constants'

export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_LANDING[user.role] || '/'} replace />
  }

  return children
}
