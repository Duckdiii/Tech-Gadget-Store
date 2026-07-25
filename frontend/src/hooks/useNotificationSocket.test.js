import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotificationSocket } from './useNotificationSocket'
import { getToken } from '../utils/authToken'
import { Client } from '@stomp/stompjs'

vi.mock('../utils/authToken', () => ({
  getToken: vi.fn(),
}))

let subscribeCallback
vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn().mockImplementation(function (config) {
    this.activate = vi.fn(() => config.onConnect())
    this.deactivate = vi.fn()
    this.subscribe = vi.fn((dest, cb) => { subscribeCallback = cb })
  }),
}))

const CUSTOMER = { role: 'customer', email: 'duy@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
  subscribeCallback = undefined
  getToken.mockReturnValue('jwt-token')
})

describe('useNotificationSocket', () => {
  it('không kết nối nếu user không tồn tại hoặc không phải customer', () => {
    const { rerender } = renderHook(({ user }) => useNotificationSocket(user, vi.fn()), {
      initialProps: { user: null },
    })
    expect(Client).not.toHaveBeenCalled()

    rerender({ user: { role: 'staff' } })
    expect(Client).not.toHaveBeenCalled()
  })

  it('không kết nối nếu không có token', () => {
    getToken.mockReturnValue(null)
    renderHook(() => useNotificationSocket(CUSTOMER, vi.fn()))
    expect(Client).not.toHaveBeenCalled()
  })

  it('kết nối và subscribe đúng kênh "/user/queue/notifications" khi có user customer + token', () => {
    renderHook(() => useNotificationSocket(CUSTOMER, vi.fn()))

    expect(Client).toHaveBeenCalledWith(expect.objectContaining({
      connectHeaders: { Authorization: 'Bearer jwt-token' },
    }))
    expect(subscribeCallback).toBeTypeOf('function')
  })

  it('gọi đúng onNotification với payload đã parse khi nhận tin nhắn', () => {
    const onNotification = vi.fn()
    renderHook(() => useNotificationSocket(CUSTOMER, onNotification))

    act(() => subscribeCallback({ body: JSON.stringify({ id: 'n1', message: 'Đơn hàng mới' }) }))

    expect(onNotification).toHaveBeenCalledWith({ id: 'n1', message: 'Đơn hàng mới' })
  })

  it('dùng đúng callback MỚI khi onNotification đổi giữa các lần render, không tạo lại kết nối', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = renderHook(({ cb }) => useNotificationSocket(CUSTOMER, cb), {
      initialProps: { cb: first },
    })

    rerender({ cb: second })
    act(() => subscribeCallback({ body: JSON.stringify({ id: 'n1' }) }))

    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
    expect(Client).toHaveBeenCalledTimes(1) // không kết nối lại chỉ vì đổi callback
  })
})
