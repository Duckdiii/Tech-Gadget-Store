import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLowStockProducts } from './useLowStockProducts'
import axiosClient from '../config/axiosClient'

vi.mock('../config/axiosClient', () => ({
  default: { get: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useLowStockProducts', () => {
  it('tải dữ liệu lần đầu với limit mặc định = 5', async () => {
    axiosClient.get.mockResolvedValue({ items: [{ id: 'p1' }], totalCount: 1, threshold: 5 })
    const { result } = renderHook(() => useLowStockProducts())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(axiosClient.get).toHaveBeenCalledWith('/api/warehouse/low-stock-products', { params: { limit: 5 } })
    expect(result.current.items).toEqual([{ id: 'p1' }])
    expect(result.current.totalCount).toBe(1)
  })

  it('đổi limit thì gọi lại API với limit mới', async () => {
    axiosClient.get.mockResolvedValue({ items: [], totalCount: 0, threshold: 5 })
    const { rerender, result } = renderHook(({ limit }) => useLowStockProducts(limit), { initialProps: { limit: 5 } })
    await waitFor(() => expect(result.current.loading).toBe(false))
    axiosClient.get.mockClear()

    rerender({ limit: 10 })

    await waitFor(() => expect(axiosClient.get).toHaveBeenCalledWith('/api/warehouse/low-stock-products', { params: { limit: 10 } }))
  })

  it('refetch(): gọi lại API thủ công', async () => {
    axiosClient.get.mockResolvedValue({ items: [], totalCount: 0, threshold: 5 })
    const { result } = renderHook(() => useLowStockProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))
    axiosClient.get.mockClear()

    await act(async () => { await result.current.refetch() })

    expect(axiosClient.get).toHaveBeenCalledTimes(1)
  })

  it('lỗi API: tắt loading, giữ dữ liệu mặc định rỗng', async () => {
    axiosClient.get.mockRejectedValue(new Error('Server lỗi'))
    const { result } = renderHook(() => useLowStockProducts())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toEqual([])
    expect(result.current.totalCount).toBe(0)
  })
})
