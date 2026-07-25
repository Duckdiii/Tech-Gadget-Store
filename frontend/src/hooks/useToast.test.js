import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from './useToast'

// useToast: nhóm các test liên quan đến hook useToast, kiểm tra việc hiển thị thông báo toast, tự ẩn thông báo sau một khoảng thời gian và sử dụng duration riêng khi được truyền vào showToast.
//Toast là 1 pattern UI phổ biến — 1 khung thông báo nhỏ, tự nổi lên rồi tự biến mất sau vài giây, không cần người dùng bấm gì để đóng
describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('toast ban đầu là null', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast).toBeNull()
  })

  it('showToast hiển thị message', () => {
    const { result } = renderHook(() => useToast())

    act(() => result.current.showToast('Đã lưu'))

    expect(result.current.toast).toBe('Đã lưu')
  })

  it('tự ẩn message sau defaultDuration', () => {
    const { result } = renderHook(() => useToast(1000))

    act(() => result.current.showToast('Đã lưu'))
    expect(result.current.toast).toBe('Đã lưu')

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.toast).toBeNull()
  })

  it('dùng duration riêng khi được truyền vào showToast', () => {
    const { result } = renderHook(() => useToast(3200))

    act(() => result.current.showToast('Lỗi', 500)) // truyền duration riêng là 500ms
    act(() => vi.advanceTimersByTime(500)) // tiến thời gian 500ms

    expect(result.current.toast).toBeNull() // sau 500ms, toast đã tự ẩn
  })
})
