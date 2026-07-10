import { useCheckout } from '../hooks/useCheckout'
import StoreNavbar from '../../../components/StoreNavbar'

import { ProductsSection, AddressSection, PaymentSection, OrderSummaryCard } from '../components/CheckoutComponents'

export default function CheckoutPage() {
  const {
    summary,
    addresses,
    addressId,
    setAddressId,
    paymentMethodId,
    setPaymentMethodId,
    loading,
    submitting,
    handleOrderSubmit,
  } = useCheckout()

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      <div className="max-w-screen-2xl mx-auto w-full px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-black" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Thanh toán đơn hàng</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Vui lòng hoàn tất thông tin giao nhận hàng</p>
        </div>

        <div className="flex gap-7 items-start">
          <div className="flex-1 space-y-6 min-w-0">
            {summary && <ProductsSection items={summary.items} />}
            <AddressSection addresses={addresses} selected={addressId} onSelect={setAddressId} />
            {summary && (
              <PaymentSection
                methods={summary.availablePaymentMethods}
                selected={paymentMethodId}
                onSelect={setPaymentMethodId}
              />
            )}
          </div>

          <div className="w-[360px] shrink-0">
            <OrderSummaryCard
              summary={summary}
              onOrderSubmit={handleOrderSubmit}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
