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
    toast,
    handleOrderSubmit,
  } = useCheckout()

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-dvh">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {toast && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2.5 px-5 py-3 text-white text-[13px] font-bold rounded-full shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ backgroundColor: toast.type === 'error' ? 'var(--err)' : 'var(--ok)' }}
        >
          {toast.type === 'error' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {toast.message}
        </div>
      )}

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
