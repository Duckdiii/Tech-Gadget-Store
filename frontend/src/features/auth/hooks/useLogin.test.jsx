import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../../../context/AuthContext'
import { useAuth } from '../../../context/useAuth'
import { useLogin } from './useLogin'
import { authService } from '../services/authService'

// Biên network thật sự là authService (đi qua axiosClient) — mock ở đây.
// AuthContext/AuthProvider để chạy THẬT (không mock) vì đã được test riêng ở AuthContext.test.jsx,
// nên ở đây dùng nó để verify tích hợp: login() có thật sự cập nhật state của context không.
vi.mock('../services/authService', () => ({
  authService: { login: vi.fn() },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

function setup(opts) {
  return renderHook(() => ({ login: useLogin(opts), auth: useAuth() }), { wrapper })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('useLogin', () => {
  it('chặn submit và báo lỗi khi thiếu email hoặc mật khẩu, không gọi API', async () => {
    const { result } = setup()

    await act(async () => { await result.current.login.handleLogin() })

    expect(authService.login).not.toHaveBeenCalled()
    expect(result.current.login.error).toBe('Vui lòng nhập email và mật khẩu.')
  })

  it('đăng nhập thành công: trim/lowercase email, lưu user vào AuthContext, điều hướng đúng role', async () => {
    authService.login.mockResolvedValue({
      role: 'MANAGER', fullName: 'Duy', email: 'duy@example.com', token: 'jwt-abc',
    })
    const { result } = setup()

    act(() => result.current.login.setEmail('  Duy@Example.com  '))
    act(() => result.current.login.setPassword('secret123'))

    await act(async () => { await result.current.login.handleLogin() })

    expect(authService.login).toHaveBeenCalledWith('duy@example.com', 'secret123')
    expect(result.current.auth.user).toEqual({ role: 'manager', name: 'Duy', email: 'duy@example.com' })
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('chặn đăng nhập nếu role không nằm trong allowedRoles của cổng đang truy cập', async () => {
    authService.login.mockResolvedValue({
      role: 'CUSTOMER', fullName: 'Duy', email: 'duy@example.com', token: 'jwt-abc',
    })
    // Portal dành cho manager/staff — customer đăng nhập nhầm cổng phải bị chặn.
    const { result } = setup({ allowedRoles: ['manager', 'staff'] })

    act(() => result.current.login.setEmail('duy@example.com'))
    act(() => result.current.login.setPassword('secret123'))

    await act(async () => { await result.current.login.handleLogin() })

    expect(result.current.login.error).toBe('Tài khoản không được phép đăng nhập tại cổng này.')
    expect(result.current.auth.user).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('hiện lỗi từ server và tắt loading khi đăng nhập thất bại, không lưu user', async () => {
    authService.login.mockRejectedValue(new Error('Sai email hoặc mật khẩu'))
    const { result } = setup()

    act(() => result.current.login.setEmail('duy@example.com'))
    act(() => result.current.login.setPassword('wrong'))

    await act(async () => { await result.current.login.handleLogin() })

    expect(result.current.login.error).toBe('Sai email hoặc mật khẩu')
    expect(result.current.login.loading).toBe(false)
    expect(result.current.auth.user).toBeNull()
  })
})
