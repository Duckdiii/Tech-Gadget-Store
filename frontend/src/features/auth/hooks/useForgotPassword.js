import { useState } from 'react'
import { useNav } from '../../../hooks/useNav'
import { authService } from '../services/authService'

export function useForgotPassword() {
  const onNavigate = useNav()
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
      onNavigate('emailSent', { state: { email: email.trim() } })
    } catch (err) {
      setError(err.message || 'Không kết nối được server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    error,
    setError,
    loading,
    handleSubmit,
  }
}
