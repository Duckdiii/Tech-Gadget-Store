import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../../../context/AuthContext'
import { useAuth } from '../../../context/useAuth'
import { useRegister } from './useRegister'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: { register: vi.fn() },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

function setup() {
  return renderHook(() => ({ register: useRegister(), auth: useAuth() }), { wrapper })
}

function fillValidForm(result) {
  act(() => result.current.register.set('fullName')({ target: { value: 'Nguyễn Đức Duy' } }))
  act(() => result.current.register.set('email')({ target: { value: 'Duy@Example.com' } }))
  act(() => result.current.register.set('phone')({ target: { value: ' 0912345678 ' } }))
  act(() => result.current.register.set('password')({ target: { value: 'secret123' } }))
  act(() => result.current.register.set('confirm')({ target: { value: 'secret123' } }))
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('useRegister', () => {
  it('validate: báo đủ lỗi khi để trống toàn bộ form, không gọi API', async () => {
    const { result } = setup()

    await act(async () => { await result.current.register.handleSubmit() })

    expect(authService.register).not.toHaveBeenCalled()
    expect(result.current.register.errors).toEqual({
      fullName: 'Vui lòng nhập họ tên.',
      email: 'Vui lòng nhập email.',
      password: 'Vui lòng nhập mật khẩu.',
      confirm: 'Vui lòng xác nhận mật khẩu.',
    })
  })

  it('validate: báo lỗi email sai định dạng', async () => {
    const { result } = setup()
    act(() => result.current.register.set('email')({ target: { value: 'not-an-email' } }))

    await act(async () => { await result.current.register.handleSubmit() })

    expect(result.current.register.errors.email).toBe('Email không hợp lệ.')
  })

  it('validate: chấp nhận email có khoảng trắng đầu/cuối (đã trim trước khi kiểm tra định dạng)', async () => {
    authService.register.mockResolvedValue({ fullName: 'Nguyễn Đức Duy', email: 'duy@example.com', token: 'jwt-abc' })
    const { result } = setup()
    fillValidForm(result)
    act(() => result.current.register.set('email')({ target: { value: '  duy@example.com  ' } }))

    await act(async () => { await result.current.register.handleSubmit() })

    // không bị chặn ở bước validate (nếu bị chặn, errors.email sẽ là 'Email không hợp lệ.'
    // và authService.register sẽ không được gọi)
    expect(result.current.register.errors.email).toBe('')
    expect(authService.register).toHaveBeenCalledWith('Nguyễn Đức Duy', '0912345678', 'duy@example.com', 'secret123')
  })

  it('validate: báo lỗi mật khẩu ngắn hơn 6 ký tự', async () => {
    const { result } = setup()
    act(() => result.current.register.set('password')({ target: { value: '123' } }))

    await act(async () => { await result.current.register.handleSubmit() })

    expect(result.current.register.errors.password).toBe('Mật khẩu phải có ít nhất 6 ký tự.')
  })

  it('validate: báo lỗi xác nhận mật khẩu không khớp', async () => {
    const { result } = setup()
    act(() => result.current.register.set('password')({ target: { value: 'secret123' } }))
    act(() => result.current.register.set('confirm')({ target: { value: 'khac123' } }))

    await act(async () => { await result.current.register.handleSubmit() })

    expect(result.current.register.errors.confirm).toBe('Mật khẩu xác nhận không khớp.')
  })

  it('đăng ký thành công: trim/lowercase đúng, lưu user role customer, điều hướng về trang chủ', async () => {
    authService.register.mockResolvedValue({ fullName: 'Nguyễn Đức Duy', email: 'duy@example.com', token: 'jwt-abc' })
    const { result } = setup()
    fillValidForm(result)

    await act(async () => { await result.current.register.handleSubmit() })

    expect(authService.register).toHaveBeenCalledWith('Nguyễn Đức Duy', '0912345678', 'duy@example.com', 'secret123')
    expect(result.current.auth.user).toEqual({ role: 'customer', name: 'Nguyễn Đức Duy', email: 'duy@example.com' })
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('lỗi 409 (email đã tồn tại): set lỗi field email và serverError', async () => {
    authService.register.mockRejectedValue(new Error('Request failed with status code 409'))
    const { result } = setup()
    fillValidForm(result)

    await act(async () => { await result.current.register.handleSubmit() })

    expect(result.current.register.errors.email).toBe('Email này đã được sử dụng.')
    expect(result.current.register.serverError).toBe('Email này đã được sử dụng.')
    expect(result.current.auth.user).toBeNull()
  })

  it('lỗi khác từ server: chỉ set serverError chung, không đụng vào errors.email', async () => {
    authService.register.mockRejectedValue(new Error('Không kết nối được server.'))
    const { result } = setup()
    fillValidForm(result)

    await act(async () => { await result.current.register.handleSubmit() })

    expect(result.current.register.serverError).toBe('Không kết nối được server.')
    expect(result.current.register.errors.email).toBe('')
  })

  it('set(field): gõ lại 1 trường thì xoá lỗi của riêng trường đó và xoá serverError', async () => {
    const { result } = setup()

    await act(async () => { await result.current.register.handleSubmit() }) // tạo lỗi cho mọi field trống
    expect(result.current.register.errors.email).toBeTruthy()

    act(() => result.current.register.set('email')({ target: { value: 'duy@example.com' } }))

    expect(result.current.register.errors.email).toBe('')
    expect(result.current.register.form.email).toBe('duy@example.com')
  })
})
