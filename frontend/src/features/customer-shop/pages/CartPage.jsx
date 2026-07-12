import StoreNavbar from '../../../components/StoreNavbar'
import { useCart } from '../hooks/useCart'
import CartItem from '../components/CartItem'
import OrderSummary from '../components/OrderSummary'
import RecommendationSection from '../components/RecommendationSection'
import { useCartRecommendations } from '../hooks/useRecommendations'

export default function CartPage() { // hiển thị trang giỏ hàng
  const {
    items,
    loading,
    allChecked,
    someChecked,
    checkedItems,
    totalQty,
    serviceFee,
    grandTotal,
    toggleAll,
    toggleItem,
    toggleBundle,
    changeQty,
    removeItem,
    removeCheckedItems,
    onNavigate,
  } = useCart()

  const cartProductIds = [...new Set(items.map(i => i.rawItem?.productId).filter(Boolean))]
  const { products: cartRecommendations, loading: cartRecommendationsLoading } = useCartRecommendations(cartProductIds)

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      <div className="max-w-screen-2xl mx-auto w-full px-8 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Giỏ hàng của bạn</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Kiểm tra lại sản phẩm trước khi thanh toán</p>
          </div>
          <button
            onClick={() => onNavigate('list')}
            className="flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer hover:text-slate-950 border-none bg-transparent"
            style={{ color: 'var(--t3)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            Tiếp tục mua sắm
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <svg className="w-20 h-20 mb-4" style={{ color: 'var(--b1)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-base font-bold" style={{ color: 'var(--t2)' }}>Giỏ hàng của bạn đang trống</p>
            <button onClick={() => onNavigate('list')}
              className="mt-4 text-white px-6 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer border-none"
              style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }}
            >Khám phá sản phẩm</button>
          </div>
        ) : (
          <div className="flex gap-7 items-start">
            <div className="flex-1 min-w-0">
              {/* Select all bar */}
              <div className="flex items-center gap-3 px-5 py-4 mb-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-5 h-5 cursor-pointer accent-[var(--accent)]" />
                <span className="text-sm font-bold" style={{ color: 'var(--t1)' }}>Chọn tất cả ({items.length} sản phẩm)</span>
                {someChecked && (
                  <button onClick={removeCheckedItems}
                    className="ml-auto text-[12.5px] font-bold transition-colors cursor-pointer border-none bg-transparent"
                    style={{ color: 'var(--err)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >Xoá đã chọn</button>
                )}
              </div>
              <div className="space-y-4">
                {items.map(item => (
                  <CartItem key={item.id} item={item} onToggleItem={toggleItem} onToggleBundle={toggleBundle} onQtyChange={changeQty} onRemove={removeItem} />
                ))}
              </div>
            </div>

            <div className="w-[360px] shrink-0">
              <OrderSummary items={items} />
            </div>
          </div>
        )}

        {!loading && items.length > 0 && (
          <RecommendationSection
            title="Khách hàng cũng mua"
            products={cartRecommendations}
            loading={cartRecommendationsLoading}
            onNavigate={onNavigate}
          />
        )}
      </div>

      {/* Sticky checkout bar (dark) */}
      {!loading && totalQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: 'var(--ink)', borderTop: '1px solid var(--b1)', boxShadow: '0 -4px 24px rgba(0,0,0,0.2)' }}>
          <div className="max-w-screen-2xl mx-auto px-8 py-4.5 flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[11px]" style={{ color: 'var(--t3)' }}>{totalQty} sản phẩm được chọn</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>Tổng thanh toán:</span>
                  <span className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{grandTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
              {serviceFee > 0 && (
                <div className="hidden md:block text-[11px] font-bold pl-6" style={{ borderLeft: '1px solid var(--b2)', color: 'var(--t3)' }}>
                  Bao gồm {serviceFee.toLocaleString('vi-VN')} đ dịch vụ
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate('checkout', { state: { cartItemIds: checkedItems.map(i => i.id) } })}
              className="flex items-center gap-2 text-white font-extrabold text-[14px] px-10 py-3.5 transition-all duration-200 cursor-pointer border-none"
              style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }}
            >
              Đặt hàng ngay
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
