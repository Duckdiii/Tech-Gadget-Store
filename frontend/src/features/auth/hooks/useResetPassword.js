import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import { authService } from '../services/authService'

export function useResetPassword() {
  const onNavigate = useNav()
  const [searchParams] = useSearchParams() // lấy token từ query string trong URL, ví dụ: /reset-password?token=abc123
  const token = searchParams.get('token')

  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!token) {
      setError('Mã khôi phục không tìm thấy hoặc không hợp lệ. Vui lòng kiểm tra lại liên kết trong email.')
      return
    }
    if (!newPwd) {
      setError('Vui lòng nhập mật khẩu mới.')
      return
    }
    if (newPwd.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }
    if (newPwd !== confirmPwd) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(token, newPwd)
      setSuccess(true)
      setTimeout(() => {
        onNavigate('login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Không kết nối được server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return {
    token,
    newPwd,
    setNewPwd,
    confirmPwd,
    setConfirmPwd,
    error,
    setError,
    success,
    loading,
    handleSubmit,
  }
}
