import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { useCheckout } from './useCheckout'
import { shopService } from '../services/shopService'
import { profileService } from '../../customer-profile/services/profileService'

vi.mock('../services/shopService', () => ({
  shopService: {
    getCheckoutSummary: vi.fn(),
    confirmPayment: vi.fn(),
  },
}))

vi.mock('../../customer-profile/services/profileService', () => ({
  profileService: { getAddresses: vi.fn() },
}))

const mockNavigate = vi.fn()
// useLocation (đọc cartItemIds) và useSearchParams giữ module thật qua importOriginal — chỉ thay useNavigate.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function makeWrapper(cartItemIds) {
  const entries = [{ pathname: '/checkout', state: { cartItemIds } }]
  return function wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={entries}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    )
  }
}

const SAMPLE_SUMMARY = {
  availablePaymentMethods: [{ id: 'cod', name: 'COD' }, { id: 'vnpay', name: 'VNPay' }],
}
const SAMPLE_ADDRESSES = [{ id: 'addr-1', label: 'Nhà riêng' }, { id: 'addr-2', label: 'Công ty' }]

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('useCheckout', () => {
  it('điều hướng về giỏ hàng ngay nếu không có cartItemIds (chống truy cập thẳng /checkout)', async () => {
    renderHook(() => useCheckout(), { wrapper: makeWrapper([]) })

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/cart', {}))
    expect(shopService.getCheckoutSummary).not.toHaveBeenCalled()
  })

  it('tải summary + địa chỉ, tự chọn phương thức thanh toán và địa chỉ mặc định đầu tiên', async () => {
    shopService.getCheckoutSummary.mockResolvedValue(SAMPLE_SUMMARY)
    profileService.getAddresses.mockResolvedValue(SAMPLE_ADDRESSES)
    const { result } = renderHook(() => useCheckout(), { wrapper: makeWrapper([1, 2]) })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(shopService.getCheckoutSummary).toHaveBeenCalledWith([1, 2])
    expect(result.current.paymentMethodId).toBe('cod')
    expect(result.current.addressId).toBe('addr-1')
  })

  it('handleOrderSubmit: cảnh báo và không gọi API khi chưa chọn địa chỉ', async () => {
    shopService.getCheckoutSummary.mockResolvedValue({ availablePaymentMethods: [] })
    profileService.getAddresses.mockResolvedValue([])
    const { result } = renderHook(() => useCheckout(), { wrapper: makeWrapper([1]) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleOrderSubmit() })

    expect(window.alert).toHaveBeenCalledWith('Vui lòng chọn địa chỉ giao nhận hàng')
    expect(shopService.confirmPayment).not.toHaveBeenCalled()
  })

  it('handleOrderSubmit: cảnh báo khi đã có địa chỉ nhưng chưa chọn phương thức thanh toán', async () => {
    shopService.getCheckoutSummary.mockResolvedValue({ availablePaymentMethods: [] })
    profileService.getAddresses.mockResolvedValue(SAMPLE_ADDRESSES)
    const { result } = renderHook(() => useCheckout(), { wrapper: makeWrapper([1]) })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.addressId).toBe('addr-1') // có địa chỉ mặc định

    await act(async () => { await result.current.handleOrderSubmit() })

    expect(window.alert).toHaveBeenCalledWith('Vui lòng chọn phương thức thanh toán')
    expect(shopService.confirmPayment).not.toHaveBeenCalled()
  })

  it('handleOrderSubmit: đặt hàng thành công thì điều hướng sang trang hoá đơn kèm orderId', async () => {
    shopService.getCheckoutSummary.mockResolvedValue(SAMPLE_SUMMARY)
    profileService.getAddresses.mockResolvedValue(SAMPLE_ADDRESSES)
    shopService.confirmPayment.mockResolvedValue({ status: 'SUCCESS', orderId: 999 })
    const { result } = renderHook(() => useCheckout(), { wrapper: makeWrapper([1, 2]) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleOrderSubmit() })

    expect(shopService.confirmPayment).toHaveBeenCalledWith(expect.objectContaining({
      cartItemIds: [1, 2], addressId: 'addr-1', paymentMethodId: 'cod',
    }))
    expect(mockNavigate).toHaveBeenCalledWith('/invoice?orderId=999&success=true', undefined)
  })

  it('handleOrderSubmit: hiện lỗi khi API xác nhận thanh toán thất bại', async () => {
    shopService.getCheckoutSummary.mockResolvedValue(SAMPLE_SUMMARY)
    profileService.getAddresses.mockResolvedValue(SAMPLE_ADDRESSES)
    shopService.confirmPayment.mockRejectedValue(new Error('Server quá tải'))
    const { result } = renderHook(() => useCheckout(), { wrapper: makeWrapper([1]) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleOrderSubmit() })

    expect(window.alert).toHaveBeenCalledWith('Đã xảy ra lỗi khi xử lý đơn hàng: Server quá tải')
    expect(result.current.submitting).toBe(false)
  })
})
