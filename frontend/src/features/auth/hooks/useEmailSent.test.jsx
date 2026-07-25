import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useEmailSent } from './useEmailSent'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: { forgotPassword: vi.fn() },
}))

function makeWrapper(entries) {
  return function wrapper({ children }) {
    return <MemoryRouter initialEntries={entries}>{children}</MemoryRouter>
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useEmailSent', () => {
  it('đọc đúng email/isPortal từ location.state', () => {
    const entries = [{ pathname: '/email-sent', state: { email: 'Duy@Example.com', isPortal: true } }]
    const { result } = renderHook(() => useEmailSent(), { wrapper: makeWrapper(entries) })

    expect(result.current.email).toBe('Duy@Example.com')
    expect(result.current.isPortal).toBe(true)
  })

  it('email mặc định là "email của bạn" khi vào thẳng trang không qua flow forgot-password', () => {
    const { result } = renderHook(() => useEmailSent(), { wrapper: makeWrapper(['/email-sent']) })
    expect(result.current.email).toBe('email của bạn')
    expect(result.current.isPortal).toBe(false)
  })

  it('handleResend: không làm gì khi chưa có email thật (giá trị mặc định)', async () => {
    const { result } = renderHook(() => useEmailSent(), { wrapper: makeWrapper(['/email-sent']) })

    await act(async () => { await result.current.handleResend() })

    expect(authService.forgotPassword).not.toHaveBeenCalled()
  })

  it('handleResend: gửi lại thành công thì báo đúng message', async () => {
    authService.forgotPassword.mockResolvedValue(null)
    const entries = [{ pathname: '/email-sent', state: { email: 'Duy@Example.com' } }]
    const { result } = renderHook(() => useEmailSent(), { wrapper: makeWrapper(entries) })

    await act(async () => { await result.current.handleResend() })

    expect(authService.forgotPassword).toHaveBeenCalledWith('duy@example.com')
    expect(result.current.resendMessage).toBe('Đã gửi lại email thành công!')
    expect(result.current.resending).toBe(false)
  })

  it('handleResend: thất bại thì báo đúng lỗi', async () => {
    authService.forgotPassword.mockRejectedValue(new Error('Không tìm thấy tài khoản'))
    const entries = [{ pathname: '/email-sent', state: { email: 'duy@example.com' } }]
    const { result } = renderHook(() => useEmailSent(), { wrapper: makeWrapper(entries) })

    await act(async () => { await result.current.handleResend() })

    expect(result.current.resendMessage).toBe('Không tìm thấy tài khoản')
  })
})
