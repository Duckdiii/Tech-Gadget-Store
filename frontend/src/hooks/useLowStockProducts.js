import { useState, useEffect, useCallback } from 'react'
import axiosClient from '../config/axiosClient'

export function useLowStockProducts(limit = 5) {
  const [data, setData] = useState({ items: [], totalCount: 0, threshold: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axiosClient.get('/api/warehouse/low-stock-products', { params: { limit } })
      setData(res)
    } catch (e) {
      console.error('Lỗi tải danh sách sản phẩm sắp hết hàng:', e)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...data, loading }
}
