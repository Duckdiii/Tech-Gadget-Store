import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { downloadFile } from '../../../utils/downloadFile'
import { resolveReportFilterRange, previousPeriodOf } from '../utils/dateRanges'

const DEFAULT_FILTER = { period: 'MONTHLY' }

export function useRevenueReport(initialFilter) {
  const [filter, setFilter] = useState(initialFilter || DEFAULT_FILTER)
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
      const query = analyticsService.buildExportQuery(filter)
      await downloadFile(`/api/manager/revenue-report/export${query}`, 'revenue_report.csv', 'Lỗi xuất báo cáo')
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
