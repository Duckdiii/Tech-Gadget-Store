import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { getToken } from '../../../utils/authToken'
import { resolveReportFilterRange, previousPeriodOf } from '../utils/dateRanges'

const DEFAULT_FILTER = { period: 'MONTHLY' }

export function useRevenueReport() {
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const [data, setData] = useState(null)
  // Report for the equivalent-length window immediately preceding `filter`'s range, used to
  // compute real growth % on the KPI cards. Null while unavailable (loading, or an incomplete
  // CUSTOM range that hasn't had both dates picked yet) — the UI falls back to "…" for that.
  const [previousData, setPreviousData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true)
      const currentRange = resolveReportFilterRange(filter)
      const previousRange = currentRange ? previousPeriodOf(currentRange) : null

      const [res, prevRes] = await Promise.all([
        analyticsService.getRevenueReport(filter),
        previousRange
          ? analyticsService.getRevenueReport({ period: 'CUSTOM', ...previousRange })
          : Promise.resolve(null),
      ])
      setData(res)
      setPreviousData(prevRes)
    } catch (e) {
      console.error('Lỗi tải báo cáo doanh thu:', e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleExport = async () => {
    try {
      const token = getToken()
      const query = analyticsService.buildExportQuery(filter)
      const res = await fetch(`/api/manager/revenue-report/export${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Lỗi xuất báo cáo')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `revenue_report.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Lỗi xuất file báo cáo: ' + e.message)
    }
  }

  return {
    data,
    previousData,
    loading,
    filter,
    setFilter,
    handleExport,
    fetchReport,
  }
}
