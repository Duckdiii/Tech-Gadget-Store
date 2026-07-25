import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { useProductDetail } from './useProductDetail'
import { shopService } from '../services/shopService'

vi.mock('../services/shopService', () => ({
  shopService: {
    getProductById: vi.fn(),
    addCartItem: vi.fn(),
  },
}))

function makeWrapper(path) {
  return function wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    )
  }
}

const PRODUCT = {
  id: 'p1',
  variants: [
    { id: 'v1', ramGb: 8, storageGb: 128, color: 'Đen' },
    { id: 'v2', ramGb: 8, storageGb: 256, color: 'Đen' },
    { id: 'v3', ramGb: 8, storageGb: 128, color: 'Trắng' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('useProductDetail', () => {
  it('tải sản phẩm theo id trên URL, tự chọn variant đầu tiên', async () => {
    shopService.getProductById.mockResolvedValue(PRODUCT)
    const { result } = renderHook(() => useProductDetail(), { wrapper: makeWrapper('/product?id=p1') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(shopService.getProductById).toHaveBeenCalledWith('p1')
    expect(result.current.selectedVariant).toEqual(PRODUCT.variants[0])
    expect(result.current.selectedStorage).toBe(128)
  })

  it('đổi lựa chọn storage thì tự tính lại đúng variant khớp cấu hình', async () => {
    shopService.getProductById.mockResolvedValue(PRODUCT)
    const { result } = renderHook(() => useProductDetail(), { wrapper: makeWrapper('/product?id=p1') })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setSelectedStorage(256))

    expect(result.current.selectedVariant).toEqual(PRODUCT.variants[1])
  })

  it('không có variant khớp cấu hình đã chọn: selectedVariant = null', async () => {
    shopService.getProductById.mockResolvedValue(PRODUCT)
    const { result } = renderHook(() => useProductDetail(), { wrapper: makeWrapper('/product?id=p1') })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setSelectedStorage(512)) // không tồn tại cấu hình này

    expect(result.current.selectedVariant).toBeNull()
  })

  it('handleAddToCart: thành công thì gọi API đúng variant và hiện toast', async () => {
    shopService.getProductById.mockResolvedValue(PRODUCT)
    shopService.addCartItem.mockResolvedValue(null)
    const { result } = renderHook(() => useProductDetail(), { wrapper: makeWrapper('/product?id=p1') })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleAddToCart() })

    expect(shopService.addCartItem).toHaveBeenCalledWith('v1', 1)
    expect(result.current.toast).toBe('Đã thêm vào giỏ hàng')
  })

  it('handleAddToCart: hiện alert khi API thất bại', async () => {
    shopService.getProductById.mockResolvedValue(PRODUCT)
    shopService.addCartItem.mockRejectedValue(new Error('Sản phẩm đã hết hàng'))
    const { result } = renderHook(() => useProductDetail(), { wrapper: makeWrapper('/product?id=p1') })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleAddToCart() })

    expect(window.alert).toHaveBeenCalledWith('Lỗi thêm vào giỏ hàng: Sản phẩm đã hết hàng')
  })
})
