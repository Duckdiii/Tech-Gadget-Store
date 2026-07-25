import { useState, useEffect } from 'react'
import { profileService } from '../services/profileService'
import Skeleton from './Skeleton'

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + 'đ'
}

const STATUS_LABELS = {
  completed: { label: 'Đã nhận hàng', color: 'var(--ok)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' },
  shipping: { label: 'Đang vận chuyển', color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'rgba(232,66,10,0.25)' },
  processing: { label: 'Đang xử lý', color: 'var(--warn)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  pending: { label: 'Chờ xác nhận', color: 'var(--warn)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  cancelled: { label: 'Đã huỷ', color: 'var(--err)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
}

export default function OverviewSection({ profile, orders = [], ordersLoading = false, onNavigate }) {
  const [wishlistPreview, setWishlistPreview] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState(true)

  useEffect(() => {
    profileService.getFavorites()
      .then(data => setWishlistPreview((data.items ?? []).slice(0, 3)))
      .catch(() => setWishlistPreview([]))
      .finally(() => setWishlistLoading(false))
  }, [])

  const recentOrders = orders.toSorted((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 3)

  // Banner chỉ hiện khi điều kiện thật sự đúng (chưa có địa chỉ / chưa chọn thanh toán ưu tiên)
  // — không phải quảng cáo cố định luôn hiện như trước.
  const banners = []
  if (profile && (!profile.addressesIds || profile.addressesIds.length === 0)) {
    banners.push({ id: 'address', text: 'Thêm địa chỉ để đặt đơn hàng nhanh hơn.', cta: 'Thêm địa chỉ', action: 'address' })
  }
  if (profile && !profile.preferredPaymentType) {
    banners.push({ id: 'payment', text: 'Chọn phương thức thanh toán ưu tiên để thanh toán nhanh hơn.', cta: 'Thiết lập ngay', action: 'payment' })
  }

  return (
    <div className="space-y-5">
      {/* Banners theo điều kiện thật */}
      {banners.map(b => (
        <div
          key={b.id}
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid rgba(232,66,10,0.2)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(232,66,10,0.05)' }}
        >
          <div className="flex items-center gap-3 text-sm min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(232,66,10,0.12)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold truncate" style={{ color: 'var(--t1)' }}>{b.text}</span>
          </div>
          <button aria-label="Thao tác" type="button"
            onClick={() => onNavigate(b.action)}
            className="shrink-0 text-xs font-black text-white px-4 py-2 transition-colors cursor-pointer border-none"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(232,66,10,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            {b.cta}
          </button>
        </div>
      ))}

      {/* Recent orders */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }} className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--b1)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--t1)' }}>Đơn hàng gần đây</h2>
          <button aria-label="Thao tác" type="button" onClick={() => onNavigate('orders')} className="text-sm font-bold transition-colors cursor-pointer flex items-center gap-1 border-none bg-transparent" style={{ color: 'var(--accent)' }}>
            Xem tất cả
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {ordersLoading ? (
          <div className="divide-y" style={{ borderColor: 'var(--b1)' }}>
            {[...Array(3)].map((_, i) => (
              <div key={_?.id ?? _?.code ?? _?.name ?? i} className="px-6 py-5 flex items-center gap-5">
                <Skeleton className="w-16 h-16 shrink-0 rounded-xl" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="shrink-0 space-y-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <p className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>Bạn chưa có đơn hàng nào</p>
            <button aria-label="Thao tác" type="button" onClick={() => onNavigate('list')} className="mt-4 text-sm font-bold text-white px-5 py-2.5 rounded transition-colors border-none cursor-pointer" style={{ backgroundColor: 'var(--accent)' }}>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--b1)' }}>
            {recentOrders.map(order => {
              const statusLower = (order.orderStatus || 'pending').toLowerCase()
              const st = STATUS_LABELS[statusLower] || STATUS_LABELS.pending
              const firstItem = order.items && order.items.length > 0 ? order.items[0] : null
              const extra = order.items && order.items.length > 1 ? `Cùng ${order.items.length - 1} sản phẩm khác` : null
              const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '—'

              return (
                <div
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết đơn hàng #${order.id.substring(0, 8).toUpperCase()}`}
                  onClick={() => onNavigate('invoice', { search: `?orderId=${order.id}` })}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('invoice', { search: `?orderId=${order.id}` }) }}
                  className="px-6 py-5 flex items-center gap-5 transition-colors cursor-pointer"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)' }}>
                    {firstItem?.imageUrl ? (
                      <img src={firstItem.imageUrl} alt="" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <svg className="w-6 h-6" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-black" style={{ color: 'var(--t1)' }}>#{order.id.slice(0, 10)}</span>
                      <span style={{ color: 'var(--b2)' }}>·</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--t3)' }}>{dateStr}</span>
                    </div>
                    <p className="text-sm font-bold leading-snug truncate" style={{ color: 'var(--t1)' }}>
                      {firstItem ? `${firstItem.productName} (${firstItem.variantName})` : 'Sản phẩm'}
                    </p>
                    {extra && <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>{extra}</p>}
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full border" style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}>
                      {st.label}
                    </span>
                    <p className="text-base font-black" style={{ color: 'var(--accent)' }}>{fmt(order.total)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Wishlist preview */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }} className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--b1)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--t1)' }}>Sản phẩm yêu thích</h2>
          <button aria-label="Thao tác" type="button" onClick={() => onNavigate('wishlist')} className="text-sm font-bold transition-colors cursor-pointer flex items-center gap-1 border-none bg-transparent" style={{ color: 'var(--accent)' }}>
            Xem tất cả <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        {wishlistLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ backgroundColor: 'var(--b1)' }}>
            {[...Array(3)].map((_, i) => (
              <div key={_?.id ?? _?.code ?? _?.name ?? i} className="p-4 animate-pulse" style={{ backgroundColor: 'var(--card)' }}>
                <div className="w-full h-28 rounded-xl mb-3" style={{ backgroundColor: 'var(--s2)' }} />
                <div className="h-3 w-3/4 rounded mb-2" style={{ backgroundColor: 'var(--s2)' }} />
                <div className="h-3 w-1/2 rounded" style={{ backgroundColor: 'var(--s2)' }} />
              </div>
            ))}
          </div>
        ) : wishlistPreview.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <p className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>Bạn chưa yêu thích sản phẩm nào</p>
            <button aria-label="Khám phá sản phẩm" type="button" onClick={() => onNavigate('list')} className="mt-4 text-sm font-bold text-white px-5 py-2.5 rounded transition-colors border-none cursor-pointer" style={{ backgroundColor: 'var(--accent)' }}>
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ backgroundColor: 'var(--b1)' }}>
            {wishlistPreview.map(item => (
              <div
                key={item.productId}
                role="button"
                tabIndex={0}
                aria-label={`Xem sản phẩm ${item.name || item.productId}`}
                onClick={() => onNavigate('detail', { search: `?id=${item.productId}` })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('detail', { search: `?id=${item.productId}` }) }}
                className="px-4 py-4 cursor-pointer transition-colors group"
                style={{ backgroundColor: 'var(--card)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
              >
                <div className="w-full h-28 rounded-xl mb-3 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-2" />
                  ) : (
                    <svg className="w-6 h-6" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs font-bold leading-snug line-clamp-2 min-h-[2.5rem]" style={{ color: 'var(--t1)' }}>{item.productName}</p>
                <p className="text-sm font-black mt-2" style={{ color: 'var(--accent)' }}>{fmt(item.price)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
