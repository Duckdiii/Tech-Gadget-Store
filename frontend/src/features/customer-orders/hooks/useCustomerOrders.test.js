import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCustomerOrders } from './useCustomerOrders'
import { orderService } from '../services/orderService'

vi.mock('../services/orderService', () => ({
  orderService: {
    getCustomerOrders: vi.fn(),
    cancelCustomerOrder: vi.fn(),
  },
}))

const ORDERS = {
  items: [
    { id: 'ORD-1', orderStatus: 'SHIPPING' },
    { id: 'ORD-2', orderStatus: 'COMPLETED' },
    { id: 'ORD-3', orderStatus: 'AWAITING_CONFIRMATION' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

async function setupWithData() {
  orderService.getCustomerOrders.mockResolvedValue(ORDERS)
  const { result } = renderHook(() => useCustomerOrders())
  await waitFor(() => expect(result.current.loading).toBe(false))
  return result
}

describe('useCustomerOrders', () => {
  it('tải danh sách đơn hàng lần đầu', async () => {
    const result = await setupWithData()
    expect(result.current.orders).toEqual(ORDERS.items)
  })

  it('filtered: kết hợp đúng tab (map trạng thái backend → hiển thị) và search', async () => {
    const result = await setupWithData()

    act(() => result.current.setActiveTab('shipping'))
    expect(result.current.filtered.map((o) => o.id)).toEqual(['ORD-1'])

    act(() => result.current.setActiveTab('pending')) // AWAITING_CONFIRMATION → 'pending'
    expect(result.current.filtered.map((o) => o.id)).toEqual(['ORD-3'])

    act(() => result.current.setActiveTab('all'))
    act(() => result.current.setSearch('ORD-2'))
    expect(result.current.filtered.map((o) => o.id)).toEqual(['ORD-2'])
  })

  it('getTabCount: đếm đúng số đơn theo từng tab', async () => {
    const result = await setupWithData()

    expect(result.current.getTabCount('all')).toBe(3)
    expect(result.current.getTabCount('shipping')).toBe(1)
    expect(result.current.getTabCount('completed')).toBe(1)
    expect(result.current.getTabCount('pending')).toBe(1)
    expect(result.current.getTabCount('cancelled')).toBe(0)
  })

  it('handleCancelOrder: chỉ gọi API khi người dùng xác nhận confirm()', async () => {
    const result = await setupWithData()
    orderService.cancelCustomerOrder.mockResolvedValue(null)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    await act(async () => { await result.current.handleCancelOrder('ORD-1') })
    expect(orderService.cancelCustomerOrder).not.toHaveBeenCalled()

    window.confirm.mockReturnValue(true)
    orderService.getCustomerOrders.mockClear()
    await act(async () => { await result.current.handleCancelOrder('ORD-1') })

    expect(orderService.cancelCustomerOrder).toHaveBeenCalledWith('ORD-1')
    expect(orderService.getCustomerOrders).toHaveBeenCalledTimes(1) // tải lại sau khi huỷ
  })

  it('handleCancelOrder: hiện alert khi API thất bại', async () => {
    const result = await setupWithData()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    orderService.cancelCustomerOrder.mockRejectedValue(new Error('Đơn hàng đã giao, không thể huỷ'))

    await act(async () => { await result.current.handleCancelOrder('ORD-1') })

    expect(window.alert).toHaveBeenCalledWith('Hủy đơn hàng thất bại: Đơn hàng đã giao, không thể huỷ')
  })
})
