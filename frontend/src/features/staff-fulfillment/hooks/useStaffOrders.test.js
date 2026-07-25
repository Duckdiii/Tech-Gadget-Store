import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStaffOrders } from './useStaffOrders'
import { staffFulfillmentService } from '../services/staffFulfillmentService'

vi.mock('../services/staffFulfillmentService', () => ({
  staffFulfillmentService: {
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}))

const SAMPLE_ORDERS = {
  items: [
    { id: 'ORD-1', customerName: 'Nguyễn Đức Duy', orderStatus: 'CONFIRMED' },
    { id: 'ORD-2', customerName: 'Trần Thị Bích', orderStatus: 'SHIPPING' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('useStaffOrders', () => {
  it('tải danh sách đơn hàng lần đầu', async () => {
    staffFulfillmentService.getOrders.mockResolvedValue(SAMPLE_ORDERS)
    const { result } = renderHook(() => useStaffOrders())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.orders).toEqual(SAMPLE_ORDERS.items)
  })

  it('filtered: kết hợp đúng search + statusF', async () => {
    staffFulfillmentService.getOrders.mockResolvedValue(SAMPLE_ORDERS)
    const { result } = renderHook(() => useStaffOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setStatusF('SHIPPING'))
    expect(result.current.filtered).toEqual([SAMPLE_ORDERS.items[1]])

    act(() => result.current.setStatusF(''))
    act(() => result.current.setSearch('duy'))
    expect(result.current.filtered).toEqual([SAMPLE_ORDERS.items[0]])
  })

  it('handleMarkDone: thành công thì cập nhật trạng thái, tải lại đơn, bỏ chọn và hiện toast', async () => {
    staffFulfillmentService.getOrders.mockResolvedValue(SAMPLE_ORDERS)
    staffFulfillmentService.updateOrderStatus.mockResolvedValue(null)
    const { result } = renderHook(() => useStaffOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSelected(SAMPLE_ORDERS.items[0]))
    staffFulfillmentService.getOrders.mockClear()

    await act(async () => { await result.current.handleMarkDone('ORD-1', 'DELIVERED') })

    expect(staffFulfillmentService.updateOrderStatus).toHaveBeenCalledWith('ORD-1', 'DELIVERED')
    expect(staffFulfillmentService.getOrders).toHaveBeenCalledTimes(1)
    expect(result.current.selected).toBeNull()
    expect(result.current.toast).toBe('Đã cập nhật trạng thái đơn hàng')
  })

  it('handleMarkDone: hiện alert khi API thất bại', async () => {
    staffFulfillmentService.getOrders.mockResolvedValue(SAMPLE_ORDERS)
    staffFulfillmentService.updateOrderStatus.mockRejectedValue(new Error('Đơn hàng đã bị huỷ'))
    const { result } = renderHook(() => useStaffOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleMarkDone('ORD-1', 'DELIVERED') })

    expect(window.alert).toHaveBeenCalledWith('Lỗi cập nhật trạng thái: Đơn hàng đã bị huỷ')
  })
})
