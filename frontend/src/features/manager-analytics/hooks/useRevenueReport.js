import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService'
import { getToken } from '../../../context/AuthContext'

export function useRevenueReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const res = await analyticsService.getRevenueReport()
      setData(res)
    } catch (e) {
      console.error('Lỗi tải báo cáo doanh thu:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleExport = async () => {
    try {
      const token = getToken()
      const res = await fetch('/api/manager/revenue-report/export', {
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
    handleExport,
    fetchReport,
  }
}
