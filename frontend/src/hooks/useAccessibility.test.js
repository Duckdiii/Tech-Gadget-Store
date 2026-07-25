import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAccessibility } from './useAccessibility'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-font')
})

describe('useAccessibility', () => {
  it('khởi tạo từ giá trị đã lưu trong localStorage', () => {
    localStorage.setItem('a11y-dark', 'true')
    localStorage.setItem('a11y-font', 'lg')
    localStorage.setItem('a11y-motion', 'true')

    const { result } = renderHook(() => useAccessibility())

    expect(result.current.dark).toBe(true)
    expect(result.current.font).toBe('lg')
    expect(result.current.noMotion).toBe(true)
  })

  it('mặc định khi chưa lưu gì: dark=false, font="md", noMotion=false', () => {
    const { result } = renderHook(() => useAccessibility())
    expect(result.current.dark).toBe(false)
    expect(result.current.font).toBe('md')
    expect(result.current.noMotion).toBe(false)
  })

  it('setDark: bật/tắt class "dark" trên <html> và lưu localStorage', () => {
    const { result } = renderHook(() => useAccessibility())

    act(() => result.current.setDark(true))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('a11y-dark')).toBe('true')

    act(() => result.current.setDark(false))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setFont: set attribute data-font trên <html> và lưu localStorage', () => {
    const { result } = renderHook(() => useAccessibility())

    act(() => result.current.setFont('xl'))

    expect(document.documentElement.getAttribute('data-font')).toBe('xl')
    expect(localStorage.getItem('a11y-font')).toBe('xl')
  })

  it('setNoMotion: bật/tắt class "reduce-motion" trên <html> và lưu localStorage', () => {
    const { result } = renderHook(() => useAccessibility())

    act(() => result.current.setNoMotion(true))

    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true)
    expect(localStorage.getItem('a11y-motion')).toBe('true')
  })
})
