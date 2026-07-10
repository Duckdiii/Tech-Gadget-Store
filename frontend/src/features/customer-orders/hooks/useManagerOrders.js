import { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'

export function useManagerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getManagerOrders(activeFilter)
      setOrders(data || [])
    } catch (e) {
      console.error('Lỗi tải đơn hàng manager:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [activeFilter])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateManagerOrderStatus(orderId, newStatus)
      await fetchOrders()
    } catch (e) {
      alert('Cập nhật trạng thái thất bại: ' + e.message)
    }
  }

  return {
    orders,
    loading,
    activeFilter,
    setActiveFilter,
    handleUpdateStatus,
  }
}
