import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { useCart } from './useCart'
import { shopService } from '../services/shopService'

vi.mock('../services/shopService', () => ({
  shopService: {
    getCart: vi.fn(),
    getCartItemBundles: vi.fn(),
    updateCartItemBundles: vi.fn(),
    updateCartItemQuantity: vi.fn(),
    deleteCartItem: vi.fn(),
  },
}))

// useCart dùng useNav() → cần Router + AuthProvider (useNav gọi useAuth() vô điều kiện).
function wrapper({ children }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  )
}

const SAMPLE_CART = {
  items: [
    { cartItemId: 1, productName: 'iPhone 15', variantName: '128GB', unitPrice: 20000000, quantity: 1, bundleServices: [] },
    { cartItemId: 2, productName: 'iPad', variantName: '64GB', unitPrice: 10000000, quantity: 2, bundleServices: [] },
  ],
}

function mockShop({ cart = SAMPLE_CART, bundlesByItem = {} } = {}) {
  shopService.getCart.mockResolvedValue(cart)
  shopService.getCartItemBundles.mockImplementation((itemId) => Promise.resolve(bundlesByItem[itemId] ?? []))
  shopService.updateCartItemBundles.mockResolvedValue(null)
  shopService.updateCartItemQuantity.mockResolvedValue(null)
  shopService.deleteCartItem.mockResolvedValue(null)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCart', () => {
  it('tải giỏ hàng và tính đúng tổng tiền/số lượng khi mọi item đều được chọn mặc định', async () => {
    mockShop()
    const { result } = renderHook(() => useCart(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items.every((i) => i.checked)).toBe(true)
    expect(result.current.totalQty).toBe(3)
    expect(result.current.subtotal).toBe(40000000)
    expect(result.current.grandTotal).toBe(40000000)
  })

  it('toggleItem: bỏ chọn 1 item thì tổng tiền và số lượng giảm tương ứng', async () => {
    mockShop()
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.toggleItem(1))

    expect(result.current.checkedItems).toHaveLength(1)
    expect(result.current.subtotal).toBe(20000000)
    expect(result.current.totalQty).toBe(2)
  })

  it('toggleAll: đang chọn hết thì bấm 1 lần sẽ bỏ chọn hết', async () => {
    mockShop()
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.allChecked).toBe(true)

    act(() => result.current.toggleAll())

    expect(result.current.checkedItems).toHaveLength(0)
    expect(result.current.grandTotal).toBe(0)
  })

  it('toggleBundle: gọi API cập nhật đúng danh sách bundle đã chọn và tải lại giỏ hàng', async () => {
    mockShop({ bundlesByItem: { 1: [{ id: 'b1', name: 'Bảo hành mở rộng', price: 500000 }] } })
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items[0].bundles).toEqual([
      { id: 'b1', label: 'Bảo hành mở rộng', price: 500000, checked: false },
    ])

    shopService.getCart.mockClear()
    await act(async () => { await result.current.toggleBundle(1, 'b1') })

    expect(shopService.updateCartItemBundles).toHaveBeenCalledWith(1, ['b1'])
    expect(shopService.getCart).toHaveBeenCalledTimes(1) // refetch sau khi cập nhật
  })

  it('changeQty: gọi API cập nhật số lượng đúng item và tải lại giỏ hàng', async () => {
    mockShop()
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    shopService.getCart.mockClear()

    await act(async () => { await result.current.changeQty(1, 5) })

    expect(shopService.updateCartItemQuantity).toHaveBeenCalledWith(1, 5)
    expect(shopService.getCart).toHaveBeenCalledTimes(1)
  })

  it('removeItem: gọi API xoá đúng item và tải lại giỏ hàng', async () => {
    mockShop()
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    shopService.getCart.mockClear()

    await act(async () => { await result.current.removeItem(2) })

    expect(shopService.deleteCartItem).toHaveBeenCalledWith(2)
    expect(shopService.getCart).toHaveBeenCalledTimes(1)
  })

  it('removeCheckedItems: chỉ xoá các item đang được chọn, bỏ qua item đã bỏ chọn', async () => {
    mockShop()
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.toggleItem(2)) // bỏ chọn item 2, chỉ còn item 1 được chọn
    shopService.getCart.mockClear()
    shopService.deleteCartItem.mockClear()

    await act(async () => { await result.current.removeCheckedItems() })

    expect(shopService.deleteCartItem).toHaveBeenCalledTimes(1)
    expect(shopService.deleteCartItem).toHaveBeenCalledWith(1)
  })
})
