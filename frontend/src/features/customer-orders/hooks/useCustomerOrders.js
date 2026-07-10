import { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'

const mapStatus = (backendStatus) => {
  switch (backendStatus) {
    case 'COMPLETED': return 'completed'
    case 'SHIPPING': return 'shipping'
    case 'PROCESSING': return 'processing'
    case 'AWAITING_CONFIRMATION': return 'pending'
    case 'CANCELLED': return 'cancelled'
    case 'REFUNDED': return 'refunded'
    default: return 'pending'
  }
}

export function useCustomerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getCustomerOrders()
      setOrders(data || [])
    } catch (e) {
      console.error('Lỗi tải lịch sử đơn hàng:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return
    try {
      await orderService.cancelCustomerOrder(orderId)
      await fetchOrders()
    } catch (e) {
      alert('Hủy đơn hàng thất bại: ' + e.message)
    }
  }

  const filtered = orders.filter((o) => { // lọc đơn hàng dựa trên tab đang chọn và từ khóa tìm kiếm
    const mapped = mapStatus(o.orderStatus) // chuyển trạng thái từ backend sang trạng thái hiển thị
    const matchTab = activeTab === 'all' || mapped === activeTab // nếu tab là "all" thì hiển thị tất cả, nếu không thì chỉ hiển thị những đơn hàng có trạng thái trùng với tab
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase())// kiểm tra xem id của đơn hàng có chứa từ khóa tìm kiếm hay không
    return matchTab && matchSearch
  })

  const getTabCount = (tabId) => {
    if (tabId === 'all') return orders.length
    return orders.filter((o) => mapStatus(o.orderStatus) === tabId).length
  }

  return {
    orders,
    loading,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    filtered,
    getTabCount,
    handleCancelOrder,
  }
}
