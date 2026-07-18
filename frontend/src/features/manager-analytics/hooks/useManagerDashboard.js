import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../services/dashboardService'
import { todayVsYesterday, monthToDateVsPrevious, chartPeriodToFilter } from '../utils/dateRanges'

/** Percentage growth of current vs. previous. Returns null when there's no baseline to compare against (previous = 0 but current > 0) — the UI shows "Mới" for that case instead of a misleading "+∞%". */
function pctGrowth(current, previous) {
  const c = Number(current) || 0
  const p = Number(previous) || 0
  if (p === 0) return c === 0 ? 0 : null
  return ((c - p) / p) * 100
}

const RECENT_ORDERS_PAGE_SIZE = 5

export function useManagerDashboard() {
  const [kpis, setKpis] = useState(null)
  const [kpiLoading, setKpiLoading] = useState(true)

  const [chartPeriod, setChartPeriod] = useState('month')
  const [chartData, setChartData] = useState({ trend: [], topProducts: [] })
  const [chartLoading, setChartLoading] = useState(true)

  const [recentOrders, setRecentOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersLoadingMore, setOrdersLoadingMore] = useState(false)
  const [ordersNextCursor, setOrdersNextCursor] = useState(null)
  const [ordersHasNext, setOrdersHasNext] = useState(false)

  const [exporting, setExporting] = useState(false)

  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchKpis = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setKpiLoading(true)
      const { current: today, previous: yesterday } = todayVsYesterday()
      const { current: monthToDate, previous: prevMonth } = monthToDateVsPrevious()

      const [
        todayReport, yesterdayReport, monthReport, prevMonthReport,
        todayCustomers, yesterdayCustomers, todayOrders, yesterdayOrders,
      ] = await Promise.all([
        dashboardService.getRevenueReport({ period: 'CUSTOM', ...today }),
        dashboardService.getRevenueReport({ period: 'CUSTOM', ...yesterday }),
        dashboardService.getRevenueReport({ period: 'CUSTOM', ...monthToDate }),
        dashboardService.getRevenueReport({ period: 'CUSTOM', ...prevMonth }),
        dashboardService.getCustomerStats(today),
        dashboardService.getCustomerStats(yesterday),
        dashboardService.getOrderCount(today),
        dashboardService.getOrderCount(yesterday),
      ])

      setKpis({
        revenueToday: todayReport.totalRevenue,
        revenueTodayGrowth: pctGrowth(todayReport.totalRevenue, yesterdayReport.totalRevenue),
        revenueMonth: monthReport.totalRevenue,
        revenueMonthGrowth: pctGrowth(monthReport.totalRevenue, prevMonthReport.totalRevenue),
        // Đơn hàng mới = mọi đơn phát sinh hôm nay trừ đơn đã hủy/hoàn tiền (xem
        // OrderRepository.countActiveOrdersByDateRange) — khác với totalOrders của
        // revenue-report, vốn chỉ đếm đơn COMPLETED nên không phản ánh đơn vừa đặt trong ngày.
        ordersToday: todayOrders.count,
        ordersTodayDelta: todayOrders.count - yesterdayOrders.count,
        newCustomersToday: todayCustomers.newCustomers,
        newCustomersDelta: todayCustomers.newCustomers - yesterdayCustomers.newCustomers,
      })
    } catch (e) {
      console.error('Lỗi tải số liệu KPI:', e)
    } finally {
      if (!silent) setKpiLoading(false)
      setLastUpdated(new Date())
    }
  }, [])

  const fetchChartData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setChartLoading(true)
      const report = await dashboardService.getRevenueReport(chartPeriodToFilter(chartPeriod))
      setChartData({ trend: report.trend || [], topProducts: report.topSellingProducts || [] })
    } catch (e) {
      console.error('Lỗi tải biểu đồ doanh thu:', e)
    } finally {
      if (!silent) setChartLoading(false)
      setLastUpdated(new Date())
    }
  }, [chartPeriod])

  const fetchRecentOrders = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setOrdersLoading(true)
      const res = await dashboardService.getRecentOrders(RECENT_ORDERS_PAGE_SIZE)
      setRecentOrders(res.items || [])
      setOrdersNextCursor(res.nextCursor || null)
      setOrdersHasNext(!!res.hasNext)
    } catch (e) {
      console.error('Lỗi tải đơn hàng gần đây:', e)
    } finally {
      if (!silent) setOrdersLoading(false)
      setLastUpdated(new Date())
    }
  }, [])

  const loadMoreOrders = useCallback(async () => {
    if (!ordersNextCursor || ordersLoadingMore) return
    try {
      setOrdersLoadingMore(true)
      const res = await dashboardService.getRecentOrders(RECENT_ORDERS_PAGE_SIZE, ordersNextCursor)
      setRecentOrders((prev) => [...prev, ...(res.items || [])])
      setOrdersNextCursor(res.nextCursor || null)
      setOrdersHasNext(!!res.hasNext)
    } catch (e) {
      console.error('Lỗi tải thêm đơn hàng:', e)
    } finally {
      setOrdersLoadingMore(false)
    }
  }, [ordersNextCursor, ordersLoadingMore])

  useEffect(() => { fetchKpis() }, [fetchKpis])
  useEffect(() => { fetchChartData() }, [fetchChartData])
  useEffect(() => { fetchRecentOrders() }, [fetchRecentOrders])

  const reload = useCallback(async ({ silent = false } = {}) => {
    await Promise.allSettled([
      fetchKpis({ silent }),
      fetchChartData({ silent }),
      fetchRecentOrders({ silent })
    ])
  }, [fetchKpis, fetchChartData, fetchRecentOrders])

  const handleExport = useCallback(async () => {
    try {
      setExporting(true)
      await dashboardService.exportReport(chartPeriodToFilter(chartPeriod))
    } catch (e) {
      alert('Lỗi xuất file báo cáo: ' + e.message)
    } finally {
      setExporting(false)
    }
  }, [chartPeriod])

  return {
    kpis,
    kpiLoading,
    chartPeriod,
    setChartPeriod,
    trend: chartData.trend,
    topProducts: chartData.topProducts,
    chartLoading,
    recentOrders,
    ordersLoading,
    ordersLoadingMore,
    ordersHasNext,
    loadMoreOrders,
    handleExport,
    exporting,
    reload,
    lastUpdated,
  }
}
