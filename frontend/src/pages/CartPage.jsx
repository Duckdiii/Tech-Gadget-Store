import { useState } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const initialItems = [
  {
    id: 1, brand: 'Apple', name: 'MacBook Pro 14" M3 Pro 2023', variant: 'Space Black | 18GB RAM | 512GB SSD',
    price: 49990000, originalPrice: 54990000, qty: 1,
    image: 'https://placehold.co/120x100/EEF1F9/96A3BC?text=MacBook', checked: true,
    bundles: [
      { id: 'b1', label: 'Gói Bảo hành Mở rộng (1 năm)', price: 2490000, checked: false },
      { id: 'b2', label: 'Dán màn hình từ tính', price: 450000, checked: true },
    ],
  },
  {
    id: 2, brand: 'Apple', name: 'iPhone 15 Pro Max', variant: 'Titan Tự Nhiên | 256GB',
    price: 29490000, originalPrice: 32990000, qty: 2,
    image: 'https://placehold.co/120x100/EEF1F9/96A3BC?text=iPhone', checked: true,
    bundles: [
      { id: 'b3', label: 'Bảo hành VIP (Lỗi đổi mới)', price: 1200000, checked: true },
      { id: 'b4', label: 'Dán kính cường lực', price: 250000, checked: false },
    ],
  },
]

function fmt(price) { return price.toLocaleString('vi-VN') + ' đ' }

function QuantityControl({ qty, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center" style={{ border: '1px solid var(--cb)', borderRadius: '3px', overflow: 'hidden' }}>
      <button onClick={onDecrease} className="w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors"
        style={{ backgroundColor: 'var(--page)', color: 'var(--ct2)', borderRight: '1px solid var(--cb)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--cb)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--page)'}
      >−</button>
      <span className="w-11 h-9 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--card)', color: 'var(--ct1)' }}>{qty}</span>
      <button onClick={onIncrease} className="w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors"
        style={{ backgroundColor: 'var(--page)', color: 'var(--ct2)', borderLeft: '1px solid var(--cb)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--cb)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--page)'}
      >+</button>
    </div>
  )
}

function CartItem({ item, onToggleItem, onToggleBundle, onQtyChange, onRemove }) {
  const bundleFee = item.bundles.filter(b => b.checked).reduce((s, b) => s + b.price, 0)
  const lineTotal = (item.price + bundleFee) * item.qty
  const lineSavings = item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0

  return (
    <div
      className={`overflow-hidden transition-opacity duration-200 ${!item.checked ? 'opacity-60' : ''}`}
      style={{
        backgroundColor: 'var(--card)',
        borderTop: '1px solid var(--cb)',
        borderRight: '1px solid var(--cb)',
        borderBottom: '1px solid var(--cb)',
        borderLeft: item.checked ? '3px solid var(--accent)' : '1px solid var(--cb)',
        borderRadius: '4px',
      }}
    >
      {/* Main row */}
      <div className="flex gap-4 p-5">
        <div className="flex items-center shrink-0">
          <input type="checkbox" checked={item.checked} onChange={() => onToggleItem(item.id)} className="w-5 h-5 cursor-pointer" />
        </div>
        <div className="w-28 h-24 shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--page)', border: '1px solid var(--cb)', borderRadius: '3px' }}>
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{item.brand}</span>
              <h3 className="text-[15px] font-bold leading-snug mt-0.5" style={{ color: 'var(--ct1)' }}>{item.name}</h3>
              <p className="text-[13px] mt-1" style={{ color: 'var(--ct3)' }}>{item.variant}</p>
            </div>
            <button onClick={() => onRemove(item.id)}
              className="shrink-0 w-8 h-8 flex items-center justify-center transition-colors"
              style={{ color: 'var(--ct3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--err)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderRadius = '3px' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ct3)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmt(item.price)}</span>
                {item.originalPrice && <span className="text-sm line-through" style={{ color: 'var(--ct3)' }}>{fmt(item.originalPrice)}</span>}
              </div>
              {lineSavings > 0 && <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--ok)' }}>Tiết kiệm {fmt(lineSavings)}</p>}
            </div>
            <QuantityControl qty={item.qty} onIncrease={() => onQtyChange(item.id, item.qty + 1)} onDecrease={() => item.qty > 1 && onQtyChange(item.id, item.qty - 1)} />
          </div>
        </div>
      </div>

      {/* Bundles */}
      {item.bundles.length > 0 && (
        <div style={{ borderTop: '1px solid var(--cb)' }}>
          <div className="px-5 py-2 flex items-center gap-1.5" style={{ backgroundColor: 'var(--page)' }}>
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Dịch vụ kèm theo</span>
          </div>
          {item.bundles.slice(0, 2).map(bundle => (
            <label key={bundle.id}
              className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer transition-colors"
              style={{ borderTop: '1px solid var(--cb)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={bundle.checked} onChange={() => onToggleBundle(item.id, bundle.id)} className="w-4 h-4 cursor-pointer shrink-0" />
                <span className="text-[13px] font-medium" style={{ color: bundle.checked ? 'var(--ct1)' : 'var(--ct3)' }}>{bundle.label}</span>
              </div>
              <span className="text-[13px] font-bold shrink-0" style={{ color: bundle.checked ? 'var(--accent)' : 'var(--ct3)' }}>+{fmt(bundle.price)}</span>
            </label>
          ))}
        </div>
      )}

      {/* Line total */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--cb)', backgroundColor: 'var(--page)' }}>
        <span className="text-[13px]" style={{ color: 'var(--ct3)' }}>Thành tiền ({item.qty} sp{bundleFee > 0 ? ' + dịch vụ' : ''})</span>
        <span className="text-[15px] font-extrabold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>{fmt(lineTotal)}</span>
      </div>
    </div>
  )
}

function OrderSummary({ items }) {
  const checkedItems = items.filter(i => i.checked)
  const totalQty = checkedItems.reduce((s, i) => s + i.qty, 0)
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const originalTotal = checkedItems.reduce((s, i) => s + (i.originalPrice ?? i.price) * i.qty, 0)
  const productSavings = originalTotal - subtotal
  const serviceFee = checkedItems.reduce((s, i) => s + i.bundles.filter(b => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const total = subtotal + serviceFee

  return (
    <div className="sticky top-6 overflow-hidden text-white" style={{ backgroundColor: 'var(--ink)', borderRadius: '4px' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--b1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-[2px] h-5" style={{ backgroundColor: 'var(--accent)' }} />
          <h2 className="text-[15px] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Tổng quan đơn hàng</h2>
        </div>
        <p className="text-[12px] mt-1" style={{ color: 'var(--t3)' }}>{totalQty} sản phẩm được chọn</p>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px]" style={{ color: 'var(--t2)' }}>Giá sản phẩm</span>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--t1)' }}>{fmt(subtotal)}</span>
        </div>
        {productSavings > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: 'var(--ok)' }}>Tiết kiệm từ giảm giá</span>
            <span className="text-[13px] font-bold" style={{ color: 'var(--ok)' }}>−{fmt(productSavings)}</span>
          </div>
        )}
        {serviceFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: 'var(--t2)' }}>Dịch vụ kèm theo</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>+{fmt(serviceFee)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[13px]" style={{ color: 'var(--t2)' }}>Phí vận chuyển</span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--ok)' }}>Miễn phí</span>
        </div>

        <div style={{ borderTop: '1px dashed var(--b2)', margin: '4px 0' }} />

        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>Tổng tạm tính</span>
            <span className="text-[11px]" style={{ color: 'var(--t3)' }}>(Chưa áp mã KM)</span>
          </div>
          <p className="text-right text-[26px] font-black" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmt(total)}</p>
          {productSavings > 0 && (
            <p className="text-right text-[12px] font-semibold mt-0.5" style={{ color: 'var(--ok)' }}>Đã tiết kiệm {fmt(productSavings)}</p>
          )}
        </div>
        <p className="text-[11px] text-center pt-1" style={{ color: 'var(--t3)' }}>Mã khuyến mãi sẽ được nhập ở bước tiếp theo</p>
      </div>
    </div>
  )
}

export default function CartPage() {
  const onNavigate = useNav()
  const [items, setItems] = useState(initialItems)

  const allChecked = items.length > 0 && items.every(i => i.checked)
  const someChecked = items.some(i => i.checked)
  const checkedItems = items.filter(i => i.checked)
  const totalQty = checkedItems.reduce((s, i) => s + i.qty, 0)
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const serviceFee = checkedItems.reduce((s, i) => s + i.bundles.filter(b => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const grandTotal = subtotal + serviceFee

  const toggleAll = () => setItems(prev => prev.map(i => ({ ...i, checked: !allChecked })))
  const toggleItem = id => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  const toggleBundle = (itemId, bundleId) => setItems(prev => prev.map(i => i.id === itemId ? { ...i, bundles: i.bundles.map(b => b.id === bundleId ? { ...b, checked: !b.checked } : b) } : i))
  const changeQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const removeItem = id => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      <div className="max-w-screen-2xl mx-auto w-full px-8 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Giỏ hàng của bạn</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--ct3)' }}>Kiểm tra lại sản phẩm trước khi thanh toán</p>
          </div>
          <button
            onClick={() => onNavigate('list')}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: 'var(--ct2)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ct1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct2)'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Tiếp tục mua sắm
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <svg className="w-20 h-20 mb-4" style={{ color: 'var(--cb)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-semibold" style={{ color: 'var(--ct2)' }}>Giỏ hàng của bạn đang trống</p>
            <button onClick={() => onNavigate('list')}
              className="mt-4 text-white px-6 py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >Khám phá sản phẩm</button>
          </div>
        ) : (
          <div className="flex gap-7 items-start">
            <div className="flex-1 min-w-0">
              {/* Select all bar */}
              <div className="flex items-center gap-3 px-5 py-3 mb-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--cb)', borderRadius: '4px' }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-5 h-5 cursor-pointer" />
                <span className="text-sm font-semibold" style={{ color: 'var(--ct1)' }}>Chọn tất cả ({items.length} sản phẩm)</span>
                {someChecked && (
                  <button onClick={() => setItems(prev => prev.filter(i => !i.checked))}
                    className="ml-auto text-[13px] font-medium transition-colors"
                    style={{ color: 'var(--err)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >Xoá đã chọn</button>
                )}
              </div>
              <div className="space-y-3">
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
      </div>

      {/* Sticky checkout bar (dark) */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: 'var(--ink)', borderTop: '1px solid var(--b1)', boxShadow: '0 -4px 24px rgba(0,0,0,0.25)' }}>
          <div className="max-w-screen-2xl mx-auto px-8 py-4 flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[12px]" style={{ color: 'var(--t3)' }}>{totalQty} sản phẩm được chọn</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[13px]" style={{ color: 'var(--t2)' }}>Tổng thanh toán:</span>
                  <span className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{grandTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
              {serviceFee > 0 && (
                <div className="hidden md:block text-[12px] font-medium pl-6" style={{ borderLeft: '1px solid var(--b2)', color: 'var(--t3)' }}>
                  Bao gồm {serviceFee.toLocaleString('vi-VN')} đ dịch vụ
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate('checkout')}
              className="flex items-center gap-2.5 text-white font-bold text-[15px] px-10 py-3.5 transition-colors"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              Đặt hàng ngay
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
