import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useManagerDashboard } from './useManagerDashboard'
import { dashboardService } from '../services/dashboardService'

vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    getRevenueReport: vi.fn(),
    getCustomerStats: vi.fn(),
    getOrderCount: vi.fn(),
    getRecentOrders: vi.fn(),
    getPendingOrdersCount: vi.fn(),
    exportReport: vi.fn(),
  },
}))

function deferred() {
  let resolve
  const promise = new Promise((res) => { resolve = res })
  return { promise, resolve }
}

// Baseline vô hại cho mọi lời gọi — từng test override riêng phần mình cần bằng mockResolvedValueOnce
// (được tiêu thụ TRƯỚC baseline, theo đúng thứ tự gọi thật của fetchKpis: revenue x4, customerStats x2, orderCount x2).
function mockBaseline() {
  dashboardService.getRevenueReport.mockResolvedValue({ totalRevenue: 0, trend: [], topSellingProducts: [] })
  dashboardService.getCustomerStats.mockResolvedValue({ newCustomers: 0 })
  dashboardService.getOrderCount.mockResolvedValue({ count: 0 })
  dashboardService.getRecentOrders.mockResolvedValue({ items: [], nextCursor: null, hasNext: false })
  dashboardService.getPendingOrdersCount.mockResolvedValue({ count: 0 })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('useManagerDashboard', () => {
  it('fetchKpis: tính đúng % tăng trưởng doanh thu/đơn hàng/khách mới so với kỳ trước', async () => {
    mockBaseline()
    dashboardService.getRevenueReport
      .mockResolvedValueOnce({ totalRevenue: 1000000 }) // hôm nay
      .mockResolvedValueOnce({ totalRevenue: 800000 })  // hôm qua
      .mockResolvedValueOnce({ totalRevenue: 20000000 }) // tháng này
      .mockResolvedValueOnce({ totalRevenue: 18000000 }) // tháng trước
    dashboardService.getCustomerStats
      .mockResolvedValueOnce({ newCustomers: 5 })
      .mockResolvedValueOnce({ newCustomers: 3 })
    dashboardService.getOrderCount
      .mockResolvedValueOnce({ count: 10 })
      .mockResolvedValueOnce({ count: 8 })

    const { result } = renderHook(() => useManagerDashboard())
    await waitFor(() => expect(result.current.kpiLoading).toBe(false))

    expect(result.current.kpis.revenueToday).toBe(1000000)
    expect(result.current.kpis.revenueTodayGrowth).toBeCloseTo(25)
    expect(result.current.kpis.revenueMonthGrowth).toBeCloseTo(11.11, 1)
    expect(result.current.kpis.ordersTodayDelta).toBe(2)
    expect(result.current.kpis.newCustomersDelta).toBe(2)
  })

  it('fetchKpis: growth = null (hiển thị "Mới") khi kỳ trước bằng 0 nhưng kỳ này > 0', async () => {
    mockBaseline()
    dashboardService.getRevenueReport
      .mockResolvedValueOnce({ totalRevenue: 500000 }) // hôm nay
      .mockResolvedValueOnce({ totalRevenue: 0 })       // hôm qua = 0

    const { result } = renderHook(() => useManagerDashboard())
    await waitFor(() => expect(result.current.kpiLoading).toBe(false))

    expect(result.current.kpis.revenueTodayGrowth).toBeNull()
  })

  it('fetchChartData: bảo vệ race-condition — đổi chartPeriod liên tục thì bỏ qua response cũ về muộn', async () => {
    mockBaseline()
    const firstChart = deferred()
    const secondChart = deferred()
    dashboardService.getRevenueReport
      .mockResolvedValueOnce({ totalRevenue: 0 }) // kpi: hôm nay
      .mockResolvedValueOnce({ totalRevenue: 0 }) // kpi: hôm qua
      .mockResolvedValueOnce({ totalRevenue: 0 }) // kpi: tháng này
      .mockResolvedValueOnce({ totalRevenue: 0 }) // kpi: tháng trước
      .mockImplementationOnce(() => firstChart.promise)  // chart lúc mount (period='month')
      .mockImplementationOnce(() => secondChart.promise) // chart sau khi đổi sang 'week'

    const { result } = renderHook(() => useManagerDashboard())
    act(() => result.current.setChartPeriod('week'))

    await act(async () => {
      secondChart.resolve({ trend: [{ label: 'new' }], topSellingProducts: [] })
    })
    await waitFor(() => expect(result.current.trend).toEqual([{ label: 'new' }]))

    await act(async () => {
      firstChart.resolve({ trend: [{ label: 'stale' }], topSellingProducts: [] })
    })
    expect(result.current.trend).toEqual([{ label: 'new' }])
  })

  it('loadMoreOrders: nối thêm đơn hàng vào danh sách hiện có và cập nhật cursor', async () => {
    mockBaseline()
    dashboardService.getRecentOrders
      .mockResolvedValueOnce({ items: [{ id: 'o1' }], nextCursor: 'c2', hasNext: true })
      .mockResolvedValueOnce({ items: [{ id: 'o2' }], nextCursor: null, hasNext: false })

    const { result } = renderHook(() => useManagerDashboard())
    await waitFor(() => expect(result.current.ordersLoading).toBe(false))
    expect(result.current.recentOrders).toEqual([{ id: 'o1' }])

    await act(async () => { await result.current.loadMoreOrders() })

    expect(result.current.recentOrders).toEqual([{ id: 'o1' }, { id: 'o2' }])
    expect(result.current.ordersHasNext).toBe(false)
    expect(dashboardService.getRecentOrders).toHaveBeenCalledWith(5, 'c2')
  })

  it('handleExport: gọi API đúng filter đang xem, và hiện alert khi lỗi', async () => {
    mockBaseline()
    const { result } = renderHook(() => useManagerDashboard())
    await waitFor(() => expect(result.current.chartLoading).toBe(false))

    dashboardService.exportReport.mockResolvedValue(null)
    await act(async () => { await result.current.handleExport() })
    expect(dashboardService.exportReport).toHaveBeenCalledWith({ period: 'MONTHLY' })

    dashboardService.exportReport.mockRejectedValue(new Error('Xuất file thất bại'))
    await act(async () => { await result.current.handleExport() })
    expect(window.alert).toHaveBeenCalledWith('Lỗi xuất file báo cáo: Xuất file thất bại')
  })
})
