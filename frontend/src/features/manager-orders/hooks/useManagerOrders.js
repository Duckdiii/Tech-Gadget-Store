import { useState, useEffect } from 'react'
import { managerOrderService } from '../services/managerOrderService'

export function useManagerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await managerOrderService.getManagerOrders(activeFilter)
      // /api/manager/orders returns a CursorPageResponseDto ({ items, nextCursor, hasNext }),
      // not a raw array — assigning `data` itself made `orders` a plain object, so
      // orders.map(...) in OrderListTab threw and the page got stuck on its loading spinner.
      setOrders(data?.items || [])
    } catch (e) {
      console.error('Lỗi tải đơn hàng manager:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await managerOrderService.updateOrderStatus(orderId, newStatus)
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
