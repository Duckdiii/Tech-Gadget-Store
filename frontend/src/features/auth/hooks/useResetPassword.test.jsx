import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { useResetPassword } from './useResetPassword'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: { resetPassword: vi.fn() },
}))

const mockNavigate = vi.fn()
// useSearchParams (đọc token trên URL) giữ nguyên bản thật qua importOriginal — chỉ thay useNavigate.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

// useResetPassword dùng useNav() → cần cả Router (lấy token qua useSearchParams) lẫn AuthProvider
// (useNav gọi useAuth() để logout() trước khi điều hướng về trang login sau khi đổi mật khẩu thành công).
function makeWrapper(path) {
  return function wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    )
  }
}

const wrapperWithToken = makeWrapper('/reset-password?token=abc123')
const wrapperNoToken = makeWrapper('/reset-password')

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('useResetPassword', () => {
  it('báo lỗi khi URL không có token, không gọi API', async () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper: wrapperNoToken })

    await act(async () => { await result.current.handleSubmit() })

    expect(authService.resetPassword).not.toHaveBeenCalled()
    expect(result.current.error).toBe(
      'Mã khôi phục không tìm thấy hoặc không hợp lệ. Vui lòng kiểm tra lại liên kết trong email.',
    )
  })

  it('đọc đúng token từ query string trên URL', () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper: wrapperWithToken })
    expect(result.current.token).toBe('abc123')
  })

  it('validate: báo lỗi khi mật khẩu mới để trống', async () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper: wrapperWithToken })

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.error).toBe('Vui lòng nhập mật khẩu mới.')
  })

  it('validate: báo lỗi khi mật khẩu mới ngắn hơn 8 ký tự', async () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper: wrapperWithToken })
    act(() => result.current.setNewPwd('1234567'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.error).toBe('Mật khẩu phải có ít nhất 8 ký tự.')
  })

  it('validate: báo lỗi khi mật khẩu xác nhận không khớp', async () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper: wrapperWithToken })
    act(() => result.current.setNewPwd('password123'))
    act(() => result.current.setConfirmPwd('khac123456'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.error).toBe('Mật khẩu xác nhận không khớp.')
  })

  it('thành công: gọi API đúng token, set success, sau 2s tự logout và điều hướng về /login', async () => {
    vi.useFakeTimers()
    authService.resetPassword.mockResolvedValue(null)
    const { result } = renderHook(() => useResetPassword(), { wrapper: wrapperWithToken })

    act(() => result.current.setNewPwd('password123'))
    act(() => result.current.setConfirmPwd('password123'))

    await act(async () => { await result.current.handleSubmit() })

    expect(authService.resetPassword).toHaveBeenCalledWith('abc123', 'password123')
    expect(result.current.success).toBe(true)
    expect(mockNavigate).not.toHaveBeenCalled() // chưa điều hướng ngay, phải đợi 2s

    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })

    expect(mockNavigate).toHaveBeenCalledWith('/login')

    vi.useRealTimers()
  })

  it('hiện lỗi từ server và tắt loading khi API thất bại', async () => {
    authService.resetPassword.mockRejectedValue(new Error('Mã khôi phục đã hết hạn'))
    const { result } = renderHook(() => useResetPassword(), { wrapper: wrapperWithToken })
    act(() => result.current.setNewPwd('password123'))
    act(() => result.current.setConfirmPwd('password123'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.error).toBe('Mã khôi phục đã hết hạn')
    expect(result.current.loading).toBe(false)
    expect(result.current.success).toBe(false)
  })
})
