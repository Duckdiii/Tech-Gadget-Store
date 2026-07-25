import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRevenueReport } from './useRevenueReport'
import { analyticsService } from '../services/analyticsService'

vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    getRevenueReport: vi.fn(),
    buildExportQuery: vi.fn(() => '?period=MONTHLY'),
  },
}))

vi.mock('../../../utils/authToken', () => ({
  getToken: vi.fn(() => 'test-token'),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  window.URL.revokeObjectURL = vi.fn()
})

describe('useRevenueReport', () => {
  it('tải data hiện tại và data kỳ trước (CUSTOM range) để so sánh tăng trưởng', async () => {
    analyticsService.getRevenueReport
      .mockResolvedValueOnce({ totalRevenue: 20000000 })
      .mockResolvedValueOnce({ totalRevenue: 15000000 })

    const { result } = renderHook(() => useRevenueReport())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual({ totalRevenue: 20000000 })
    expect(result.current.previousData).toEqual({ totalRevenue: 15000000 })
    expect(analyticsService.getRevenueReport).toHaveBeenCalledTimes(2)
    expect(analyticsService.getRevenueReport.mock.calls[1][0].period).toBe('CUSTOM')
  })

  it('CUSTOM filter thiếu 1 trong 2 ngày: không tải previousData, chỉ gọi API 1 lần', async () => {
    analyticsService.getRevenueReport.mockResolvedValue({ totalRevenue: 1000000 })

    const { result } = renderHook(() => useRevenueReport({ period: 'CUSTOM', startDate: '2026-07-01' }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.previousData).toBeNull()
    expect(analyticsService.getRevenueReport).toHaveBeenCalledTimes(1)
  })

  it('handleExport: thành công thì gọi fetch với token xác thực và tải file về', async () => {
    analyticsService.getRevenueReport.mockResolvedValue({ totalRevenue: 0 })
    window.fetch = vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) })
    const { result } = renderHook(() => useRevenueReport())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleExport() })

    expect(window.fetch).toHaveBeenCalledWith('/api/manager/revenue-report/export?period=MONTHLY', {
      headers: { Authorization: 'Bearer test-token' },
    })
    expect(window.URL.createObjectURL).toHaveBeenCalled()
  })

  it('handleExport: hiện alert khi server trả lỗi', async () => {
    analyticsService.getRevenueReport.mockResolvedValue({ totalRevenue: 0 })
    window.fetch = vi.fn().mockResolvedValue({ ok: false })
    const { result } = renderHook(() => useRevenueReport())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.handleExport() })

    expect(window.alert).toHaveBeenCalledWith('Lỗi xuất file báo cáo: Lỗi xuất báo cáo')
  })
})
