import { useState, useEffect } from 'react'
import { managerOrderService } from '../services/managerOrderService'

export function useManagerOrders(initialFilter = 'all') {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [hasNext, setHasNext] = useState(false)
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')

  const fetchOrders = async (reset = true) => {
    let sDate = ''
    let eDate = ''
    const todayStr = new Date().toISOString().split('T')[0]
    
    if (dateFilter === 'today') {
      sDate = todayStr
      eDate = todayStr
    } else if (dateFilter === 'week') {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      sDate = d.toISOString().split('T')[0]
      eDate = todayStr
    } else if (dateFilter === 'month') {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      sDate = d.toISOString().split('T')[0]
      eDate = todayStr
    } else if (dateFilter === 'custom') {
      sDate = customStartDate
      eDate = customEndDate
    }

    try {
      if (reset) {
        setLoading(true)
        const data = await managerOrderService.getManagerOrders({
          status: activeFilter,
          cursor: null,
          search,
          startDate: sDate,
          endDate: eDate,
          paymentMethod: paymentMethodFilter
        })
        setOrders(data?.items || [])
        setNextCursor(data?.nextCursor || null)
        setHasNext(!!data?.hasNext)
      } else {
        setLoadingMore(true)
        const data = await managerOrderService.getManagerOrders({
          status: activeFilter,
          cursor: nextCursor,
          search,
          startDate: sDate,
          endDate: eDate,
          paymentMethod: paymentMethodFilter
        })
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
  }, [activeFilter, search, dateFilter, customStartDate, customEndDate, paymentMethodFilter])

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
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    paymentMethodFilter,
    setPaymentMethodFilter,
    handleUpdateStatus,
    fetchOrders,
  }
}
