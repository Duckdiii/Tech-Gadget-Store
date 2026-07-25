import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useManagerOrders } from './useManagerOrders'
import { managerOrderService } from '../services/managerOrderService'

vi.mock('../services/managerOrderService', () => ({
  managerOrderService: {
    getManagerOrders: vi.fn(),
    getManagerOrderStats: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}))

function deferred() {
  let resolve
  const promise = new Promise((res) => { resolve = res })
  return { promise, resolve }
}

beforeEach(() => {
  vi.clearAllMocks()
  managerOrderService.getManagerOrderStats.mockResolvedValue({ total: 0 })
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('useManagerOrders', () => {
  it('tải danh sách đơn hàng và thống kê ngay khi mount', async () => {
    managerOrderService.getManagerOrders.mockResolvedValue({
      items: [{ id: 'ord-1' }], nextCursor: 'c2', hasNext: true,
    })
    const { result } = renderHook(() => useManagerOrders())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.orders).toEqual([{ id: 'ord-1' }])
    expect(result.current.hasNext).toBe(true)
    expect(managerOrderService.getManagerOrderStats).toHaveBeenCalled()
  })

  it('đổi activeFilter thì gọi lại API với đúng status', async () => {
    managerOrderService.getManagerOrders.mockResolvedValue({ items: [], nextCursor: null, hasNext: false })
    const { result } = renderHook(() => useManagerOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    managerOrderService.getManagerOrders.mockClear()

    act(() => result.current.setActiveFilter('pending'))

    await waitFor(() => expect(managerOrderService.getManagerOrders).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending', cursor: null }),
    ))
  })

  it('dateFilter=today: gửi đúng khoảng ngày là hôm nay', async () => {
    managerOrderService.getManagerOrders.mockResolvedValue({ items: [], nextCursor: null, hasNext: false })
    const { result } = renderHook(() => useManagerOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    managerOrderService.getManagerOrders.mockClear()

    const todayStr = new Date().toISOString().split('T')[0]
    act(() => result.current.setDateFilter('today'))

    await waitFor(() => expect(managerOrderService.getManagerOrders).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: todayStr, endDate: todayStr }),
    ))
  })

  it('handleUpdateStatus: gọi API đúng và tải lại danh sách khi thành công', async () => {
    managerOrderService.getManagerOrders.mockResolvedValue({ items: [], nextCursor: null, hasNext: false })
    managerOrderService.updateOrderStatus.mockResolvedValue(null)
    const { result } = renderHook(() => useManagerOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))
    managerOrderService.getManagerOrders.mockClear()

    await act(async () => { await result.current.handleUpdateStatus('ord-1', 'shipped') })

    expect(managerOrderService.updateOrderStatus).toHaveBeenCalledWith('ord-1', 'shipped')
    expect(managerOrderService.getManagerOrders).toHaveBeenCalledTimes(1) // refetch
  })

  it('handleUpdateStatus: hiện alert khi API thất bại', async () => {
    managerOrderService.getManagerOrders.mockResolvedValue({ items: [], nextCursor: null, hasNext: false })
    managerOrderService.updateOrderStatus.mockRejectedValue(new Error('Trạng thái không hợp lệ'))
    const { result } = renderHook(() => useManagerOrders())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleUpdateStatus('ord-1', 'shipped') })

    expect(window.alert).toHaveBeenCalledWith('Cập nhật trạng thái thất bại: Trạng thái không hợp lệ')
  })

  it('bảo vệ race-condition: đổi filter liên tục thì chỉ giữ kết quả của request mới nhất, bỏ qua response cũ về muộn', async () => {
    const first = deferred()
    const second = deferred()
    managerOrderService.getManagerOrders
      .mockImplementationOnce(() => first.promise) // request lúc mount (activeFilter='all')
      .mockImplementationOnce(() => second.promise) // request sau khi đổi sang 'pending'

    const { result } = renderHook(() => useManagerOrders())
    act(() => result.current.setActiveFilter('pending'))

    // Response của request MỚI (thứ 2) về trước
    await act(async () => { second.resolve({ items: [{ id: 'ord-new' }], nextCursor: null, hasNext: false }) })
    await waitFor(() => expect(result.current.orders).toEqual([{ id: 'ord-new' }]))

    // Response của request CŨ (thứ 1) về sau — phải bị bỏ qua, không đè lên state hiện tại
    await act(async () => { first.resolve({ items: [{ id: 'ord-stale' }], nextCursor: null, hasNext: false }) })

    expect(result.current.orders).toEqual([{ id: 'ord-new' }])
  })
})
