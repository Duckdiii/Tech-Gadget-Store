import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { apiFetch } from '../services/api'
import {
  getToken,
  setToken,
  clearToken,
  getPersistedUser,
  setPersistedUser,
  clearPersistedUser,
} from '../utils/authToken'

vi.mock('../services/api', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('../utils/authToken', () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
  getPersistedUser: vi.fn(() => null),
  setPersistedUser: vi.fn(),
  clearPersistedUser: vi.fn(),
}))
// wrapper component để cung cấp context cho hook useAuth trong các test case.
function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  vi.clearAllMocks() // reset tất cả các mock trước mỗi test case để tránh ảnh hưởng giữa các test case.
  getPersistedUser.mockReturnValue(null) // mặc định getPersistedUser trả về null, có thể override trong từng test case nếu cần.
  apiFetch.mockResolvedValue(null) // mặc định apiFetch trả về Promise resolved với null, có thể override trong từng test case nếu cần.
})
//"PersistedUser" là tên gọi cho thông tin user được lưu bền (persist) vào localStorage, để nó không bị mất khi người dùng reload trang hay đóng/mở lại tab trình duyệt
// nhóm các test liên quan đến AuthProvider và useAuth, kiểm tra việc khởi tạo user từ persisted user, login cập nhật user và token, logout gọi API và xoá user/token.
describe('AuthProvider / useAuth', () => {
  it('khởi tạo user từ getPersistedUser', () => {
    getPersistedUser.mockReturnValue({ id: 1, name: 'Duy' })// mock getPersistedUser trả về một user cụ thể để kiểm tra việc khởi tạo user từ persisted user.

    const { result } = renderHook(() => useAuth(), { wrapper })// renderHook để sử dụng hook useAuth trong context của AuthProvider, cho phép kiểm tra giá trị user được khởi tạo từ persisted user.

    expect(result.current.user).toEqual({ id: 1, name: 'Duy' })
  })

  it('login cập nhật user, lưu persisted user và set token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    const userData = { id: 1, name: 'Duy' }

    act(() => result.current.login(userData, 'jwt-token'))// act để gọi hàm login trong hook useAuth, cập nhật user và token. 

    expect(result.current.user).toEqual(userData)
    expect(setPersistedUser).toHaveBeenCalledWith(userData)// kiểm tra rằng setPersistedUser được gọi với userData, xác nhận việc lưu persisted user.
    expect(setToken).toHaveBeenCalledWith('jwt-token')// kiểm tra rằng setToken được gọi với 'jwt-token', xác nhận việc lưu token.
  })

  it('login không set token khi không truyền token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.login({ id: 1, name: 'Duy' }))

    expect(setToken).not.toHaveBeenCalled()
  })

  it('logout gọi API logout khi có token, và xoá user/token', () => {
    getToken.mockReturnValue('jwt-token')
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.logout())

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    expect(result.current.user).toBeNull()
    expect(clearPersistedUser).toHaveBeenCalled()
    expect(clearToken).toHaveBeenCalled()
  })

  it('logout không gọi API khi không có token', () => {
    getToken.mockReturnValue(null)
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.logout())

    expect(apiFetch).not.toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })
})
