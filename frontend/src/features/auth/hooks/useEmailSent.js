import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { authService } from '../services/authService'

export function useEmailSent() {
  const location = useLocation()
  const email = location.state?.email || 'email của bạn'

  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResend = async () => {
    if (!email || email === 'email của bạn') return
    setResending(true)
    setResendMessage('')
    try {
      await authService.forgotPassword(email.toLowerCase())
      setResendMessage('Đã gửi lại email thành công!')
    } catch (err) {
      setResendMessage(err.message || 'Gửi lại thất bại. Vui lòng thử lại.')
    } finally {
      setResending(false)
    }
  }

  return {
    email,
    resending,
    resendMessage,
    handleResend,
  }
}
