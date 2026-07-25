import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useManagerPaymentLogs } from './useManagerPaymentLogs'
import { managerOrderService } from '../services/managerOrderService'

vi.mock('../services/managerOrderService', () => ({
  managerOrderService: { getManagerPaymentLogs: vi.fn() },
}))

const SAMPLE_LOGS = {
  items: [
    { id: 'LOG-1', orderId: 'ORD-100', customerName: 'Nguyễn Đức Duy' },
    { id: 'LOG-2', orderId: 'ORD-200', customerName: 'Trần Thị Bích' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useManagerPaymentLogs', () => {
  it('tải logs và đọc đúng field .items từ CursorPageResponseDto (không phải mảng trần)', async () => {
    managerOrderService.getManagerPaymentLogs.mockResolvedValue(SAMPLE_LOGS)
    const { result } = renderHook(() => useManagerPaymentLogs())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.logs).toEqual(SAMPLE_LOGS.items)
    expect(result.current.filtered).toEqual(SAMPLE_LOGS.items)
  })

  it('search lọc đúng theo id, orderId hoặc customerName (không phân biệt hoa thường)', async () => {
    managerOrderService.getManagerPaymentLogs.mockResolvedValue(SAMPLE_LOGS)
    const { result } = renderHook(() => useManagerPaymentLogs())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setSearch('bích'))

    expect(result.current.filtered).toEqual([SAMPLE_LOGS.items[1]])
  })

  it('lỗi API: tắt loading, giữ logs rỗng, không crash', async () => {
    managerOrderService.getManagerPaymentLogs.mockRejectedValue(new Error('Server lỗi'))
    const { result } = renderHook(() => useManagerPaymentLogs())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.logs).toEqual([])
    expect(result.current.filtered).toEqual([])
  })
})
