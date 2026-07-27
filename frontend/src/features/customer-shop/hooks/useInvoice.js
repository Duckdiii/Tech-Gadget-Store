import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import { shopService } from '../services/shopService'

export function useInvoice() {
  const onNavigate = useNav()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const success = searchParams.get('success') !== 'false'

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showInvoice, setShowInvoice] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const loadInvoice = async () => {
      if (!orderId) {
        if (active) setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await shopService.getInvoiceByOrderId(orderId)
        if (!active) return
        setInvoice(data)
        setVisible(true)
      } catch (e) {
        console.error('Lỗi tải hóa đơn:', e)
        if (active) setError(e.message || 'Không tìm thấy thông tin đơn hàng này')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadInvoice()
    return () => { active = false }
  }, [orderId])

  return {
    orderId,
    invoice,
    loading,
    error,
    showInvoice,
    setShowInvoice,
    visible,
    setVisible,
    onNavigate,
    success,
  }
}
