import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatSocket } from './useChatSocket'
import { getToken } from '../../../utils/authToken'
import { Client } from '@stomp/stompjs'

vi.mock('../../../utils/authToken', () => ({
  getToken: vi.fn(),
}))

// Client giả: activate() tự gọi onConnect() ngay (mô phỏng kết nối thành công tức thì),
// subscribe() lưu lại callback để test tự bắn "tin nhắn" đến từ server.
let subscribeCallback
vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn().mockImplementation(function (config) {
    this.activate = vi.fn(() => config.onConnect())
    this.deactivate = vi.fn()
    this.publish = vi.fn()
    this.subscribe = vi.fn((dest, cb) => { subscribeCallback = cb })
  }),
}))

const CUSTOMER = { role: 'customer', email: 'duy@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
  subscribeCallback = undefined
  getToken.mockReturnValue('jwt-token')
})

describe('useChatSocket', () => {
  it('không kết nối nếu user không tồn tại', () => {
    renderHook(() => useChatSocket(null))
    expect(Client).not.toHaveBeenCalled()
  })

  it('không kết nối nếu user không phải role customer', () => {
    renderHook(() => useChatSocket({ role: 'staff' }))
    expect(Client).not.toHaveBeenCalled()
  })

  it('không kết nối nếu không có token', () => {
    getToken.mockReturnValue(null)
    renderHook(() => useChatSocket(CUSTOMER))
    expect(Client).not.toHaveBeenCalled()
  })

  it('kết nối và subscribe đúng kênh khi có user customer + token', () => {
    renderHook(() => useChatSocket(CUSTOMER))
    expect(Client).toHaveBeenCalledWith(expect.objectContaining({
      connectHeaders: { Authorization: 'Bearer jwt-token' },
    }))
    expect(subscribeCallback).toBeTypeOf('function')
  })

  it('sendMessage: thêm tin nhắn của user, bật isStreaming, publish đúng payload', () => {
    const { result } = renderHook(() => useChatSocket(CUSTOMER))

    act(() => result.current.sendMessage('Xin chào'))

    expect(result.current.messages).toEqual([{ role: 'user', content: 'Xin chào' }])
    expect(result.current.isStreaming).toBe(true)
  })

  it('sendMessage: bỏ qua nếu nội dung rỗng/toàn khoảng trắng', () => {
    const { result } = renderHook(() => useChatSocket(CUSTOMER))

    act(() => result.current.sendMessage('   '))

    expect(result.current.messages).toEqual([])
  })

  it('nhận tin nhắn streaming: gộp các đoạn delta vào cùng 1 message cho tới khi done=true', () => {
    const { result } = renderHook(() => useChatSocket(CUSTOMER))

    act(() => subscribeCallback({ body: JSON.stringify({ delta: 'Xin ', done: false }) }))
    expect(result.current.messages).toEqual([{ role: 'assistant', content: 'Xin ', streaming: true }])

    act(() => subscribeCallback({ body: JSON.stringify({ delta: 'chào!', done: true }) }))
    expect(result.current.messages).toEqual([{ role: 'assistant', content: 'Xin chào!', streaming: false }])
    expect(result.current.isStreaming).toBe(false)
  })

  it('loadHistory: map role về chữ thường', () => {
    const { result } = renderHook(() => useChatSocket(CUSTOMER))

    act(() => result.current.loadHistory([
      { role: 'USER', content: 'Chào' },
      { role: 'ASSISTANT', content: 'Xin chào' },
    ]))

    expect(result.current.messages).toEqual([
      { role: 'user', content: 'Chào' },
      { role: 'assistant', content: 'Xin chào' },
    ])
  })
})
