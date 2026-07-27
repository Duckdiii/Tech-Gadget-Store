import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import { shopService } from '../services/shopService'
import { profileService } from '../../customer-profile/services/profileService'

export function useCheckout() {
  const onNavigate = useNav()
  const location = useLocation()
  const cartItemIds = location.state?.cartItemIds || []

  const [summary, setSummary] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    const loadData = async () => {
      if (cartItemIds.length === 0) {
        onNavigate('cart')
        return
      }

      try {
        setLoading(true)
        const summaryData = await shopService.getCheckoutSummary(cartItemIds)
        setSummary(summaryData)

        if (summaryData.availablePaymentMethods && summaryData.availablePaymentMethods.length > 0) {
          setPaymentMethodId(summaryData.availablePaymentMethods[0].id)
        }

        const addressData = await profileService.getAddresses()
        setAddresses(addressData)
        if (addressData && addressData.length > 0) {
          setAddressId(addressData[0].id)
        }
      } catch (e) {
        console.error('Lỗi tải thông tin thanh toán:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOrderSubmit = async () => {
    if (!addressId) {
      showToast('Vui lòng chọn địa chỉ giao nhận hàng')
      return
    }
    if (!paymentMethodId) {
      showToast('Vui lòng chọn phương thức thanh toán')
      return
    }

    setSubmitting(true)
    try {
      const confirmData = await shopService.confirmPayment({
        cartItemIds: cartItemIds,
        addressId: addressId,
        paymentMethodId: paymentMethodId,
        orderInfo: 'Thanh toan mua san pham tai TechStore',
        clientIp: '127.0.0.1',
      })

      if (confirmData.redirectUrl) {
        // Online payment gateway redirect
        window.location.href = confirmData.redirectUrl
      } else if (confirmData.status === 'SUCCESS' || (confirmData.status === 'PENDING' && confirmData.orderId)) {
        // PENDING + orderId (no redirectUrl) là đơn COD đã tạo thành công, chờ xác nhận
        onNavigate('invoice', { search: `?orderId=${confirmData.orderId}&success=true` })
      } else {
        showToast(confirmData.message || 'Đặt hàng thất bại')
      }
    } catch (e) {
      console.error('Lỗi xác nhận đơn hàng:', e)
      showToast('Đã xảy ra lỗi khi xử lý đơn hàng: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    cartItemIds,
    summary,
    addresses,
    addressId,
    setAddressId,
    paymentMethodId,
    setPaymentMethodId,
    loading,
    submitting,
    toast,
    handleOrderSubmit,
    onNavigate,
  }
}
