import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../context/useAuth'
import { useFavorites } from './useFavorites'
import { profileService } from '../features/customer-profile/services/profileService'

vi.mock('../features/customer-profile/services/profileService', () => ({
  profileService: {
    getFavorites: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}))

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

function setup() {
  return renderHook(() => ({ fav: useFavorites(), auth: useAuth() }), { wrapper })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  localStorage.clear()
})

describe('useFavorites', () => {
  it('chưa đăng nhập: favoritesMap rỗng, không gọi API', () => {
    const { result } = setup()
    expect(result.current.fav.favoritesMap).toEqual({})
    expect(profileService.getFavorites).not.toHaveBeenCalled()
  })

  it('đã đăng nhập: tải và map đúng productId -> true', async () => {
    profileService.getFavorites.mockResolvedValue({ items: [{ productId: 'p1' }, { productId: 'p2' }] })
    const { result } = setup()

    act(() => result.current.auth.login({ role: 'customer', email: 'duy@example.com' }, 'jwt'))

    await waitFor(() => expect(result.current.fav.favoritesMap).toEqual({ p1: true, p2: true }))
  })

  it('toggleWishlist: chưa đăng nhập thì alert, không gọi API', async () => {
    const { result } = setup()

    await act(async () => { await result.current.fav.toggleWishlist({ id: 'p1' }, true) })

    expect(window.alert).toHaveBeenCalledWith('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!')
    expect(profileService.toggleFavorite).not.toHaveBeenCalled()
  })

  it('toggleWishlist: dùng variantId nếu có, fallback về product.id nếu không', async () => {
    profileService.getFavorites.mockResolvedValue({ items: [] })
    profileService.toggleFavorite.mockResolvedValue(null)
    const { result } = setup()
    act(() => result.current.auth.login({ role: 'customer', email: 'duy@example.com' }, 'jwt'))
    await waitFor(() => expect(profileService.getFavorites).toHaveBeenCalled())

    await act(async () => { await result.current.fav.toggleWishlist({ id: 'p1', variantId: 'v1' }, true) })
    expect(profileService.toggleFavorite).toHaveBeenCalledWith('v1')
    expect(result.current.fav.favoritesMap.p1).toBe(true)

    await act(async () => { await result.current.fav.toggleWishlist({ id: 'p2' }, true) }) // không có variantId
    expect(profileService.toggleFavorite).toHaveBeenCalledWith('p2')
  })

  it('toggleWishlist: bắn event "favorites_changed" khi thành công', async () => {
    profileService.getFavorites.mockResolvedValue({ items: [] })
    profileService.toggleFavorite.mockResolvedValue(null)
    const { result } = setup()
    act(() => result.current.auth.login({ role: 'customer', email: 'duy@example.com' }, 'jwt'))
    await waitFor(() => expect(profileService.getFavorites).toHaveBeenCalled())
    const handler = vi.fn()
    window.addEventListener('favorites_changed', handler)

    await act(async () => { await result.current.fav.toggleWishlist({ id: 'p1' }, true) })

    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener('favorites_changed', handler)
  })
})
