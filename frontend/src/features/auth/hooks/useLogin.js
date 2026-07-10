import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_LANDING } from '../../../context/AuthContext'
import { authService } from '../services/authService'

export function useLogin({ allowedRoles = ['customer', 'manager', 'staff'] } = {}) { // hook này dùng để xử lý việc đăng nhập, kiểm tra vai trò của người dùng và điều hướng đến trang phù hợp
  const { login } = useAuth() // lấy hàm login từ context AuthContext để lưu thông tin người dùng và token vào localStorage
  const navigate = useNavigate() // lấy hàm navigate từ react-router-dom để điều hướng đến trang khác sau khi đăng nhập thành công
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }
    setError('')
    setLoading(true)
    try {
      // đợi kết quả từ hàm login của authService, truyền vào email và password đã được trim và chuyển sang chữ thường
      const data = await authService.login(email.trim().toLowerCase(), password)
      const role = data.role.toLowerCase()
      if (!allowedRoles.includes(role)) {
        setError('Tài khoản không được phép đăng nhập tại cổng này.')
        return
      }
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
    showPass,
    setShowPass,
    handleLogin,
  }
}
