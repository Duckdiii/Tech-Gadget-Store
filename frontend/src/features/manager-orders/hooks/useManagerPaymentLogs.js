import { useState, useEffect } from 'react'
import { managerOrderService } from '../services/managerOrderService'

export function useManagerPaymentLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await managerOrderService.getManagerPaymentLogs()
      setLogs(data || [])
    } catch (e) {
      console.error('Lỗi tải payment logs manager:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    return (
      !q ||
      l.id.toLowerCase().includes(q) ||
      (l.orderId && l.orderId.toLowerCase().includes(q)) ||
      (l.customerName && l.customerName.toLowerCase().includes(q))
    )
  })

  return {
    logs,
    loading,
    search,
    setSearch,
    selected,
    setSelected,
    filtered,
    fetchLogs,
  }
}
