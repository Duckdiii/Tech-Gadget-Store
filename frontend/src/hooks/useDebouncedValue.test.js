import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'
// useDebouncedValue: nhóm các test liên quan đến hook useDebouncedValue, kiểm tra việc trả về giá trị ban đầu ngay lập tức, 
// chưa cập nhật giá trị trước khi hết delay, cập nhật giá trị sau khi hết delay và reset lại bộ đếm nếu giá trị đổi liên tục trước khi hết delay.
describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers() // Sử dụng fake timers để kiểm soát thời gian trong các test case, giúp kiểm tra việc cập nhật giá trị sau delay mà không cần chờ thực tế.
  })

  afterEach(() => {
    vi.useRealTimers()// Quay lại sử dụng real timers sau mỗi test case để tránh ảnh hưởng đến các test case khác.
  })


  it('trả về giá trị ban đầu ngay lập tức', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300))
    expect(result.current).toBe('a')
  })

  it('chưa cập nhật giá trị trước khi hết delay', () => { // Kiểm tra rằng giá trị chưa được cập nhật trước khi hết thời gian delay, đảm bảo tính năng debounce hoạt động đúng.
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(200))

    expect(result.current).toBe('a')
  })

  it('cập nhật giá trị sau khi hết delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(300))

    expect(result.current).toBe('b')
  })

  it('reset lại bộ đếm nếu giá trị đổi liên tục trước khi hết delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(200))

    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('c')
  })
})
