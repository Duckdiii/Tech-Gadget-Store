import { useState, useEffect } from 'react'
import { managerOrderService } from '../services/managerOrderService'

export function useManagerOrders(initialFilter = 'all') {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [hasNext, setHasNext] = useState(false)
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  const fetchOrders = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true)
        const data = await managerOrderService.getManagerOrders(activeFilter, null)
        setOrders(data?.items || [])
        setNextCursor(data?.nextCursor || null)
        setHasNext(!!data?.hasNext)
      } else {
        setLoadingMore(true)
        const data = await managerOrderService.getManagerOrders(activeFilter, nextCursor)
        setOrders(prev => [...prev, ...(data?.items || [])])
        setNextCursor(data?.nextCursor || null)
        setHasNext(!!data?.hasNext)
      }
    } catch (e) {
      console.error('Lỗi tải đơn hàng manager:', e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchOrders(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await managerOrderService.updateOrderStatus(orderId, newStatus)
      await fetchOrders(true)
    } catch (e) {
      alert('Cập nhật trạng thái thất bại: ' + e.message)
    }
  }

  return {
    orders,
    loading,
    loadingMore,
    hasNext,
    activeFilter,
    setActiveFilter,
    handleUpdateStatus,
    fetchOrders,
  }
}
