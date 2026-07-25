import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useViewerCount } from './useViewerCount'
import { shopService } from '../services/shopService'

vi.mock('../services/shopService', () => ({
  shopService: { getViewerCount: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useViewerCount', () => {
  it('gọi API ngay khi mount và set đúng số người đang xem', async () => {
    shopService.getViewerCount.mockResolvedValue({ count: 7 })
    const { result } = renderHook(() => useViewerCount('p1'))

    await act(async () => { await vi.advanceTimersByTimeAsync(0) })

    expect(result.current.viewerCount).toBe(7)
  })

  it('poll lại đúng sau mỗi 20 giây, dùng chung 1 visitorId cho mọi lần gọi', async () => {
    shopService.getViewerCount.mockResolvedValue({ count: 1 })
    renderHook(() => useViewerCount('p1'))
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    expect(shopService.getViewerCount).toHaveBeenCalledTimes(1)

    await act(async () => { await vi.advanceTimersByTimeAsync(20000) })
    expect(shopService.getViewerCount).toHaveBeenCalledTimes(2)

    const visitorIdCall1 = shopService.getViewerCount.mock.calls[0][1]
    const visitorIdCall2 = shopService.getViewerCount.mock.calls[1][1]
    expect(visitorIdCall1).toBe(visitorIdCall2)
    expect(sessionStorage.getItem('visitorId')).toBe(visitorIdCall1)
  })

  it('không gọi API nếu không có productId', async () => {
    renderHook(() => useViewerCount(undefined))
    await act(async () => { await vi.advanceTimersByTimeAsync(20000) })
    expect(shopService.getViewerCount).not.toHaveBeenCalled()
  })
})
