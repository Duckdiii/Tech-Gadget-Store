import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useHeaderNotifications } from './useHeaderNotifications'
import { apiFetch } from '../../../services/api'

vi.mock('../../../services/api', () => ({
  apiFetch: vi.fn(),
}))

const NOTIFS = [
  { id: 'n1', message: 'Đơn hàng mới', readAt: null },
  { id: 'n2', message: 'Đã đọc rồi', readAt: '2026-01-01T00:00:00Z' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useHeaderNotifications', () => {
  it('tải thông báo và tính đúng số chưa đọc', async () => {
    apiFetch.mockResolvedValue(NOTIFS)
    const { result } = renderHook(() => useHeaderNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.unreadCount).toBe(1)
  })

  it('markAllRead: đánh dấu tất cả đã đọc (optimistic) và gọi API', async () => {
    apiFetch.mockResolvedValue(NOTIFS)
    const { result } = renderHook(() => useHeaderNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))
    apiFetch.mockClear()
    apiFetch.mockResolvedValue(null)

    act(() => result.current.markAllRead())

    expect(result.current.unreadCount).toBe(0)
    expect(apiFetch).toHaveBeenCalledWith('/api/notifications/read-all', { method: 'PATCH' })
  })

  it('markRead: chỉ đánh dấu đúng 1 thông báo và gọi API đúng id', async () => {
    apiFetch.mockResolvedValue(NOTIFS)
    const { result } = renderHook(() => useHeaderNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))
    apiFetch.mockClear()
    apiFetch.mockResolvedValue(null)

    act(() => result.current.markRead('n1'))

    expect(result.current.unreadCount).toBe(0)
    expect(apiFetch).toHaveBeenCalledWith('/api/notifications/n1/read', { method: 'PATCH' })
  })

  it('lỗi tải: không crash, giữ danh sách rỗng', async () => {
    apiFetch.mockRejectedValue(new Error('Server lỗi'))
    const { result } = renderHook(() => useHeaderNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.notifications).toEqual([])
  })
})
