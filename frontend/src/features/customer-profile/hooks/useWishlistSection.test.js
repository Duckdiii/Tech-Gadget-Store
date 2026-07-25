import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWishlistSection } from './useWishlistSection'
import { profileService } from '../services/profileService'

vi.mock('../services/profileService', () => ({
  profileService: {
    getFavorites: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}))

const FAVORITES = {
  items: [
    { productId: 'p1', productName: 'iPhone', ramGb: 8, storageGb: 128, price: 20000000, imageUrl: 'img1' },
    { productId: 'p2', productName: 'iPad', price: 10000000, imageUrl: 'img2' },
    { productId: 'p3', productName: 'MacBook', price: 30000000, imageUrl: 'img3' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('useWishlistSection', () => {
  it('tải và map đúng field, ghép tên kèm RAM/storage khi item có variant', async () => {
    profileService.getFavorites.mockResolvedValue(FAVORITES)
    const { result } = renderHook(() => useWishlistSection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const iphone = result.current.sorted.find((i) => i.productId === 'p1')
    expect(iphone.name).toBe('iPhone (8GB RAM / 128GB)')
    expect(iphone.price).toBe(20000000)
  })

  it('không tự bịa "giá gốc"/% giảm giá giả khi API chưa trả dữ liệu khuyến mãi thật', async () => {
    profileService.getFavorites.mockResolvedValue(FAVORITES)
    const { result } = renderHook(() => useWishlistSection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    for (const item of result.current.sorted) {
      expect(item.original).toBeUndefined()
      expect(result.current.getDiscount(item)).toBe(0)
    }
  })

  it('sort: price_asc/price_desc sắp xếp đúng theo giá', async () => {
    profileService.getFavorites.mockResolvedValue(FAVORITES)
    const { result } = renderHook(() => useWishlistSection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setSort('price_asc'))
    expect(result.current.sorted.map((i) => i.productId)).toEqual(['p2', 'p1', 'p3'])

    act(() => result.current.setSort('price_desc'))
    expect(result.current.sorted.map((i) => i.productId)).toEqual(['p3', 'p1', 'p2'])
  })

  it('removeItem: thành công thì gọi toggleFavorite, hiện toast, tải lại danh sách', async () => {
    profileService.getFavorites.mockResolvedValue(FAVORITES)
    profileService.toggleFavorite.mockResolvedValue(null)
    const { result } = renderHook(() => useWishlistSection())
    await waitFor(() => expect(result.current.loading).toBe(false))
    profileService.getFavorites.mockClear()

    await act(async () => { await result.current.removeItem('p1') })

    expect(profileService.toggleFavorite).toHaveBeenCalledWith('p1')
    expect(result.current.toast).toBe('Đã xóa khỏi danh sách yêu thích')
    expect(profileService.getFavorites).toHaveBeenCalledTimes(1)
    expect(result.current.removing).toBeNull()
  })

  it('removeItem: hiện alert khi thất bại', async () => {
    profileService.getFavorites.mockResolvedValue(FAVORITES)
    profileService.toggleFavorite.mockRejectedValue(new Error('Lỗi kết nối'))
    const { result } = renderHook(() => useWishlistSection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.removeItem('p1') })

    expect(window.alert).toHaveBeenCalledWith('Lỗi kết nối')
  })
})
