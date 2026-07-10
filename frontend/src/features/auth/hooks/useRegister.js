import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { authService } from '../services/authService'

export function useRegister() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(err => ({ ...err, [field]: '' }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên.'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ.'
    
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu.'
    else if (form.password.length < 6) e.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
    
    if (!form.confirm) e.confirm = 'Vui lòng xác nhận mật khẩu.'
    else if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp.'
    
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setLoading(true)
    try {
      const data = await authService.register(
        form.fullName.trim(),
        form.phone.trim() || null,
        form.email.trim().toLowerCase(),
        form.password
      )
      login({ role: 'customer', name: data.fullName, email: data.email }, data.token)
      navigate('/', { replace: true })
    } catch (err) {
      // Check if duplicate email conflict (status code 409 is handled inside axiosClient as rejecting with message)
      if (err.message && err.message.includes('409')) {
        setErrors(errs => ({ ...errs, email: 'Email này đã được sử dụng.' }))
        setServerError('Email này đã được sử dụng.')
      } else {
        setServerError(err.message || 'Không kết nối được server. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    errors,
    serverError,
    loading,
    showPass,
    setShowPass,
    showConfirm,
    setShowConfirm,
    set,
    handleSubmit,
  }
}
