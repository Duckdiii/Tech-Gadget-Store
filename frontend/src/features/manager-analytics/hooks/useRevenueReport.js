import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { getToken } from '../../../context/AuthContext'

const DEFAULT_FILTER = { period: 'MONTHLY' }

export function useRevenueReport() {
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true)
      const res = await analyticsService.getRevenueReport(filter)
      setData(res)
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
    loading,
    filter,
    setFilter,
    handleExport,
    fetchReport,
  }
}
