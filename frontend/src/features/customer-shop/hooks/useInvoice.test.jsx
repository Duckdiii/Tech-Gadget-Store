import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { useInvoice } from './useInvoice'
import { shopService } from '../services/shopService'

vi.mock('../services/shopService', () => ({
  shopService: { getInvoiceByOrderId: vi.fn() },
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useInvoice', () => {
  it('không có orderId trên URL: tắt loading ngay, không gọi API', async () => {
    const { result } = renderHook(() => useInvoice(), { wrapper: makeWrapper('/invoice') })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(shopService.getInvoiceByOrderId).not.toHaveBeenCalled()
    expect(result.current.invoice).toBeNull()
  })

  it('có orderId: tải đúng hoá đơn và hiển thị', async () => {
    shopService.getInvoiceByOrderId.mockResolvedValue({ id: 1, orderId: 999, total: 20000000 })
    const { result } = renderHook(() => useInvoice(), { wrapper: makeWrapper('/invoice?orderId=999') })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(shopService.getInvoiceByOrderId).toHaveBeenCalledWith('999')
    expect(result.current.invoice).toEqual({ id: 1, orderId: 999, total: 20000000 })
    expect(result.current.visible).toBe(true)
  })

  it('success mặc định true khi URL không có tham số success', () => {
    const { result } = renderHook(() => useInvoice(), { wrapper: makeWrapper('/invoice?orderId=999') })
    expect(result.current.success).toBe(true)
  })

  it('success là false khi URL có success=false', () => {
    const { result } = renderHook(() => useInvoice(), {
      wrapper: makeWrapper('/invoice?orderId=999&success=false'),
    })
    expect(result.current.success).toBe(false)
  })

  it('lỗi API: không crash, tắt loading, giữ invoice là null và lộ ra thông báo lỗi thật từ backend', async () => {
    shopService.getInvoiceByOrderId.mockRejectedValue(new Error('Không thể xuất hoá đơn cho đơn hàng đã huỷ'))
    const { result } = renderHook(() => useInvoice(), { wrapper: makeWrapper('/invoice?orderId=999') })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.invoice).toBeNull()
    expect(result.current.error).toBe('Không thể xuất hoá đơn cho đơn hàng đã huỷ')
  })
})
