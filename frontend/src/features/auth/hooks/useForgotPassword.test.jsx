import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useForgotPassword } from './useForgotPassword'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: { forgotPassword: vi.fn() },
}))

const mockNavigate = vi.fn()
// Hook này còn dùng useLocation (để đọc isPortal) nên giữ lại module thật qua importOriginal,
// chỉ thay useNavigate — khác với useLogin/useRegister (chỉ cần useNavigate nên mock toàn bộ module).
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function makeWrapper(initialEntries) {
  return function wrapper({ children }) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useForgotPassword', () => {
  it('validate: báo lỗi khi email trống, không gọi API', async () => {
    const { result } = renderHook(() => useForgotPassword(), { wrapper: makeWrapper(['/forgot-password']) })

    await act(async () => { await result.current.handleSubmit() })

    expect(authService.forgotPassword).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Vui lòng nhập email.')
  })

  it('isPortal mặc định là false khi vào từ trang thường (không có state)', () => {
    const { result } = renderHook(() => useForgotPassword(), { wrapper: makeWrapper(['/forgot-password']) })
    expect(result.current.isPortal).toBe(false)
  })

  it('isPortal đọc đúng true khi vào từ cổng quản trị (location.state.isPortal)', () => {
    const entries = [{ pathname: '/forgot-password', state: { isPortal: true } }]
    const { result } = renderHook(() => useForgotPassword(), { wrapper: makeWrapper(entries) })
    expect(result.current.isPortal).toBe(true)
  })

  it('thành công: gọi API với email trim/lowercase, điều hướng sang trang xác nhận kèm state', async () => {
    authService.forgotPassword.mockResolvedValue(null)
    const entries = [{ pathname: '/forgot-password', state: { isPortal: true } }]
    const { result } = renderHook(() => useForgotPassword(), { wrapper: makeWrapper(entries) })

    act(() => result.current.setEmail('  Duy@Example.com  '))

    await act(async () => { await result.current.handleSubmit() })

    expect(authService.forgotPassword).toHaveBeenCalledWith('duy@example.com')
    expect(mockNavigate).toHaveBeenCalledWith('/email-sent', {
      state: { email: 'Duy@Example.com', isPortal: true },
    })
  })

  it('hiện lỗi từ server và tắt loading khi API thất bại', async () => {
    authService.forgotPassword.mockRejectedValue(new Error('Không tìm thấy tài khoản'))
    const { result } = renderHook(() => useForgotPassword(), { wrapper: makeWrapper(['/forgot-password']) })

    act(() => result.current.setEmail('duy@example.com'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.error).toBe('Không tìm thấy tài khoản')
    expect(result.current.loading).toBe(false)
  })
})
