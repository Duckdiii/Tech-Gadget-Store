import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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

  const [chartPeriod, setChartPeriod] = useState('month') // 'week' | 'month' | 'year' | 'custom'
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' })
  const [chartData, setChartData] = useState({ trend: [], topProducts: [] })
  const [chartLoading, setChartLoading] = useState(true)

  const [recentOrders, setRecentOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersLoadingMore, setOrdersLoadingMore] = useState(false)
  const [ordersNextCursor, setOrdersNextCursor] = useState(null)
  const [ordersHasNext, setOrdersHasNext] = useState(false)

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  const [exporting, setExporting] = useState(false)

  const [lastUpdated, setLastUpdated] = useState(null)

  // null while a 'custom' period is missing one of its two dates — callers skip fetching in that case.
  const chartFilter = useMemo(() => {
    if (chartPeriod === 'custom') {
      if (!customRange.startDate || !customRange.endDate) return null
      return { period: 'CUSTOM', startDate: customRange.startDate, endDate: customRange.endDate }
    }
    return chartPeriodToFilter(chartPeriod)
  }, [chartPeriod, customRange])

  // Tracks the currently-active chart filter so an in-flight request for a period the user has
  // since navigated away from (e.g. a silent auto-refresh still bound to the old period/date
  // range) can detect it's stale and skip applying its response — otherwise it can resolve after
  // a newer request and overwrite the chart with outdated data.
  const chartFilterRef = useRef(chartFilter)
  useEffect(() => { chartFilterRef.current = chartFilter }, [chartFilter])

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
    const requestFilter = chartFilter
    if (!requestFilter) return // 'custom' period with an incomplete date range — nothing to fetch yet
    try {
      if (!silent) setChartLoading(true)
      const report = await dashboardService.getRevenueReport(requestFilter)
      if (chartFilterRef.current !== requestFilter) return // superseded by a newer period/range — discard
      setChartData({ trend: report.trend || [], topProducts: report.topSellingProducts || [] })
    } catch (e) {
      console.error('Lỗi tải biểu đồ doanh thu:', e)
    } finally {
      if (chartFilterRef.current === requestFilter) {
        if (!silent) setChartLoading(false)
        setLastUpdated(new Date())
      }
    }
  }, [chartFilter])

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await dashboardService.getPendingOrdersCount()
      setPendingOrdersCount(res.count || 0)
    } catch (e) {
      console.error('Lỗi tải số đơn chờ xác nhận:', e)
    }
  }, [])

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
  useEffect(() => { fetchPendingCount() }, [fetchPendingCount])

  const reload = useCallback(async ({ silent = false } = {}) => {
    await Promise.allSettled([
      fetchKpis({ silent }),
      fetchChartData({ silent }),
      fetchRecentOrders({ silent }),
      fetchPendingCount()
    ])
  }, [fetchKpis, fetchChartData, fetchRecentOrders, fetchPendingCount])

  const handleExport = useCallback(async () => {
    if (!chartFilter) return
    try {
      setExporting(true)
      await dashboardService.exportReport(chartFilter)
    } catch (e) {
      alert('Lỗi xuất file báo cáo: ' + e.message)
    } finally {
      setExporting(false)
    }
  }, [chartFilter])

  return {
    kpis,
    kpiLoading,
    chartPeriod,
    setChartPeriod,
    customRange,
    setCustomRange,
    chartFilterReady: !!chartFilter,
    trend: chartData.trend,
    topProducts: chartData.topProducts,
    chartLoading,
    recentOrders,
    ordersLoading,
    ordersLoadingMore,
    ordersHasNext,
    loadMoreOrders,
    pendingOrdersCount,
    handleExport,
    exporting,
    reload,
    lastUpdated,
  }
}
