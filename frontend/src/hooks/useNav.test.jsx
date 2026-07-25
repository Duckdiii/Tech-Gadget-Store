import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../context/useAuth'
import { useNav } from './useNav'

const mockNavigate = vi.fn()
// useNav chỉ dùng useNavigate (không dùng useLocation/useSearchParams) nên mock toàn bộ
// module là an toàn — không cần <MemoryRouter> bọc ngoài.
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

function setup() {
  return renderHook(() => ({ nav: useNav(), auth: useAuth() }), { wrapper })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('useNav', () => {
  it('pageId="login": tự logout rồi điều hướng về /login', () => {
    const { result } = setup()
    act(() => result.current.auth.login({ role: 'staff', name: 'Bích', email: 'bich@techstore.vn' }, 'jwt'))

    act(() => result.current.nav('login'))

    expect(result.current.auth.user).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('chưa đăng nhập (user=null): điều hướng bình thường, không bị chặn theo role', () => {
    const { result } = setup()

    act(() => result.current.nav('home'))

    expect(mockNavigate).toHaveBeenCalledWith('/', {})
  })

  it('user có role phù hợp với trang: điều hướng thành công', () => {
    const { result } = setup()
    act(() => result.current.auth.login({ role: 'staff' }, 'jwt'))

    act(() => result.current.nav('staffDashboard'))

    expect(mockNavigate).toHaveBeenCalledWith('/staff/dash', {})
  })

  it('user KHÔNG có quyền vào trang (role không khớp ROLE_PAGES): chặn, không điều hướng', () => {
    const { result } = setup()
    act(() => result.current.auth.login({ role: 'staff' }, 'jwt')) // staff không có managerDashboard

    act(() => result.current.nav('managerDashboard'))

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('options.search nối vào path, options.state chỉ được truyền khi có', () => {
    const { result } = setup()
    act(() => result.current.auth.login({ role: 'manager' }, 'jwt'))

    act(() => result.current.nav('customerDetail', { search: '?id=5', state: { from: 'list' } }))

    expect(mockNavigate).toHaveBeenCalledWith('/customers/detail?id=5', { state: { from: 'list' } })
  })

  it('pageId không tồn tại trong ROUTE_MAP: không gọi navigate', () => {
    const { result } = setup()

    act(() => result.current.nav('trang-khong-ton-tai'))

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
