import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_LANDING } from '../../../context/AuthContext'
import { authService } from '../services/authService'

export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [showPass, setShowPass] = useState(false)

  const fillDemo = (role) => {
    setSelectedRole(role)
    setError('')
    
    // Autofill credentials based on role for testing convenience
    const demoCredentials = {
      customer: { email: 'customer@gmail.com', password: 'password123' },
      manager: { email: 'manager@gmail.com', password: 'password123' },
      staff: { email: 'staff@gmail.com', password: 'password123' },
    }
    
    if (demoCredentials[role]) {
      setEmail(demoCredentials[role].email)
      setPassword(demoCredentials[role].password)
    }
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await authService.login(email.trim().toLowerCase(), password)
      const role = data.role.toLowerCase()
      login({ role, name: data.fullName, email: data.email }, data.token)
      navigate(ROLE_LANDING[role] ?? '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Không kết nối được server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    selectedRole,
    fillDemo,
    showPass,
    setShowPass,
    handleLogin,
  }
}
