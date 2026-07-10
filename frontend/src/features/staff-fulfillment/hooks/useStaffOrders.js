import { useState, useEffect } from 'react'
import { staffFulfillmentService } from '../services/staffFulfillmentService'

export function useStaffOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await staffFulfillmentService.getOrders()
      setOrders(data || [])
    } catch (e) {
      console.error('Lỗi tải đơn hàng staff:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    return (
      (!q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)) &&
      (!statusF || o.orderStatus === statusF)
    )
  })

  async function handleMarkDone(id) {
    try {
      await staffFulfillmentService.updateOrderStatus(id, 'COMPLETED')
      await fetchOrders()
      setSelected(null)
      showToast('Đã đánh dấu hoàn thành đơn hàng')
    } catch (e) {
      alert('Lỗi xác nhận hoàn thành: ' + e.message)
    }
  }

  return {
    orders,
    loading,
    search,
    setSearch,
    statusF,
    setStatusF,
    selected,
    setSelected,
    toast,
    filtered,
    handleMarkDone,
    showToast,
    fetchOrders,
  }
}
