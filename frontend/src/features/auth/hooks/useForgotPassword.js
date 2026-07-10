import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export function useForgotPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const isPortal = location.state?.isPortal || false

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email.trim().toLowerCase())
      // Chuyển sang trang xác nhận email đã gửi kèm theo email và isPortal
      navigate('/email-sent', { state: { email: email.trim(), isPortal } })
    } catch (err) {
      setError(err.message || 'Không kết nối được server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    isPortal,
    error,
    setError,
    loading,
    handleSubmit,
  }
}
