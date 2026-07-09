import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth, ROLE_LANDING } from '../context/AuthContext'

export default function AuthLayout() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to={ROLE_LANDING[user.role] || '/'} replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <Outlet />
    </div>
  )
}
