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

  useEffect(() => {
    const loadInvoice = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await shopService.getInvoiceByOrderId(orderId)
        setInvoice(data)
        setVisible(true)
      } catch (e) {
        console.error('Lỗi tải hóa đơn:', e)
      } finally {
        setLoading(false)
      }
    }
    loadInvoice()
  }, [orderId])

  return {
    orderId,
    invoice,
    loading,
    showInvoice,
    setShowInvoice,
    visible,
    setVisible,
    onNavigate,
    success,
  }
}
