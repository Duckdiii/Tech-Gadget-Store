import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'

function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

function QuantityControl({ qty, onIncrease, onDecrease }) { // dùng để tăng giảm số lượng sản phẩm trong giỏ hàng
  return (
    <div className="flex items-center" style={{ border: '1px solid var(--b1)', borderRadius: '8px', overflow: 'hidden' }}>
      <button onClick={onDecrease} className="w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
        style={{ backgroundColor: 'var(--s1)', color: 'var(--t2)', borderRight: '1px solid var(--b1)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--b1)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--s1)'}
      >−</button>
      <span className="w-11 h-9 flex items-center justify-center text-sm font-extrabold" style={{ backgroundColor: 'var(--card)', color: 'var(--t1)' }}>{qty}</span>
      <button onClick={onIncrease} className="w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
        style={{ backgroundColor: 'var(--s1)', color: 'var(--t2)', borderLeft: '1px solid var(--b1)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--b1)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--s1)'}
      >+</button>
    </div>
  )
}

function CartItem({ item, onToggleItem, onToggleBundle, onQtyChange, onRemove }) { // hiển thị thông tin sản phẩm trong giỏ hàng
  const bundleFee = item.bundles.filter(b => b.checked).reduce((s, b) => s + b.price, 0)
  const lineTotal = (item.price + bundleFee) * item.qty
  const lineSavings = item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0

  return (
    <div
      className={`overflow-hidden transition-opacity duration-200 ${!item.checked ? 'opacity-65' : ''}`}
      style={{
        backgroundColor: 'var(--card)',
        borderTop: '1px solid var(--b1)',
        borderRight: '1px solid var(--b1)',
        borderBottom: '1px solid var(--b1)',
        borderLeft: item.checked ? '4.5px solid var(--accent)' : '1px solid var(--b1)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
      }}
    >
      {/* Main row */}
      <div className="flex gap-4 p-5">
        <div className="flex items-center shrink-0">
          <input type="checkbox" checked={item.checked} onChange={() => onToggleItem(item.id)} className="w-5 h-5 cursor-pointer accent-[var(--accent)]" />
        </div>
        <div className="w-28 h-24 shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '10px' }}>
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{item.brand}</span>
              <h3 className="text-[15px] font-bold leading-snug mt-0.5" style={{ color: 'var(--t1)' }}>{item.name}</h3>
              <p className="text-[12.5px] mt-1" style={{ color: 'var(--t3)' }}>{item.variant}</p>
            </div>
            <button onClick={() => onRemove(item.id)}
              className="shrink-0 w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--err)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderRadius = '8px' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(item.price)}</span>
                {item.originalPrice && <span className="text-xs line-through" style={{ color: 'var(--t3)' }}>{fmt(item.originalPrice)}</span>}
              </div>
              {lineSavings > 0 && <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--ok)' }}>Tiết kiệm {fmt(lineSavings)}</p>}
            </div>
            <QuantityControl qty={item.qty} onIncrease={() => onQtyChange(item.id, item.qty + 1)} onDecrease={() => item.qty > 1 && onQtyChange(item.id, item.qty - 1)} />
          </div>
        </div>
      </div>

      {/* Bundles */}
      {item.bundles && item.bundles.length > 0 && (
        <div style={{ borderTop: '1px solid var(--b1)' }}>
          <div className="px-5 py-2 flex items-center gap-1.5" style={{ backgroundColor: 'var(--s1)' }}>
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Dịch vụ kèm theo mua kèm</span>
          </div>
          {item.bundles.map(bundle => (
            <label key={bundle.id}
              className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer transition-colors"
              style={{ borderTop: '1px solid var(--b1)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--s1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={bundle.checked} onChange={() => onToggleBundle(item.id, bundle.id)} className="w-4 h-4 cursor-pointer shrink-0 accent-[var(--accent)]" />
                <span className="text-[12.5px] font-medium" style={{ color: bundle.checked ? 'var(--t1)' : 'var(--t3)' }}>{bundle.label}</span>
              </div>
              <span className="text-[12.5px] font-bold shrink-0" style={{ color: bundle.checked ? 'var(--accent)' : 'var(--t3)' }}>+{fmt(bundle.price)}</span>
            </label>
          ))}
        </div>
      )}

      {/* Line total */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid var(--b1)', backgroundColor: 'var(--s1)' }}>
        <span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>Thành tiền ({item.qty} sp{bundleFee > 0 ? ' + dịch vụ' : ''})</span>
        <span className="text-[15px] font-extrabold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(lineTotal)}</span>
      </div>
    </div>
  )
}

function OrderSummary({ items }) { // hiển thị tổng quan đơn hàng
  const checkedItems = items.filter(i => i.checked)
  const totalQty = checkedItems.reduce((s, i) => s + i.qty, 0)
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const originalTotal = checkedItems.reduce((s, i) => s + (i.originalPrice ?? i.price) * i.qty, 0)
  const productSavings = originalTotal - subtotal
  const serviceFee = checkedItems.reduce((s, i) => s + i.bundles.filter(b => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const total = subtotal + serviceFee

  return (
    <div className="sticky top-6 overflow-hidden text-white" style={{ backgroundColor: 'var(--ink)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div className="px-6 py-4.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-5" style={{ backgroundColor: 'var(--accent)' }} />
          <h2 className="text-[15px] font-extrabold uppercase tracking-wide" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>Tổng quan đơn hàng</h2>
        </div>
        <p className="text-[11px] mt-1" style={{ color: 'var(--t3)' }}>{totalQty} sản phẩm được chọn</p>
      </div>

      <div className="p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>Giá sản phẩm</span>
          <span className="text-[12.5px] font-semibold" style={{ color: 'var(--t1)' }}>{fmt(subtotal)}</span>
        </div>
        {productSavings > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12.5px]" style={{ color: 'var(--ok)' }}>Tiết kiệm từ giảm giá</span>
            <span className="text-[12.5px] font-extrabold" style={{ color: 'var(--ok)' }}>−{fmt(productSavings)}</span>
          </div>
        )}
        {serviceFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>Dịch vụ kèm theo</span>
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>+{fmt(serviceFee)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>Phí vận chuyển</span>
          <span className="text-[12.5px] font-bold" style={{ color: 'var(--ok)' }}>Miễn phí</span>
        </div>

        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.12)', margin: '6px 0' }} />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>Tổng tạm tính</span>
            <span className="text-[11px]" style={{ color: 'var(--t3)' }}>(Chưa áp mã KM)</span>
          </div>
          <p className="text-right text-[26px] font-black" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(total)}</p>
          {productSavings > 0 && (
            <p className="text-right text-[11px] font-bold mt-0.5" style={{ color: 'var(--ok)' }}>Đã tiết kiệm {fmt(productSavings)}</p>
          )}
        </div>
        <p className="text-[11px] text-center pt-2" style={{ color: 'var(--t3)' }}>Mã khuyến mãi sẽ được nhập ở bước tiếp theo</p>
      </div>
    </div>
  )
}

export default function CartPage() { // hiển thị trang giỏ hàng
  const onNavigate = useNav()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const cartData = await apiFetch('/api/customer/cart')
      if (cartData && cartData.items) {
        const itemsWithBundles = await Promise.all(cartData.items.map(async (item) => {
          let availableBundles = []
          try {
            availableBundles = await apiFetch(`/api/customer/cart/items/${item.cartItemId}/bundle-services`)
          } catch (e) {
            console.warn(`Lỗi tải dịch vụ cho item ${item.cartItemId}:`, e)
          }

          const selectedBundleIds = new Set((item.bundleServices || []).map(b => b.id))
          const bundles = (availableBundles || []).map(b => ({
            id: b.id,
            label: b.name,
            price: b.price,
            checked: selectedBundleIds.has(b.id)
          }))

          return {
            id: item.cartItemId,
            brand: 'TechStore',
            name: item.productName,
            variant: item.variantName,
            price: item.unitPrice,
            originalPrice: item.unitPrice * 1.12,
            qty: item.quantity,
            image: `https://placehold.co/120x100/EEF1F9/96A3BC?text=${encodeURIComponent(item.productName || 'Product')}`,
            checked: true,
            bundles: bundles,
            rawItem: item
          }
        }))
        setItems(itemsWithBundles)
      } else {
        setItems([])
      }
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const allChecked = items.length > 0 && items.every(i => i.checked)
  const someChecked = items.some(i => i.checked)
  const checkedItems = items.filter(i => i.checked)
  const totalQty = checkedItems.reduce((s, i) => s + i.qty, 0)
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const serviceFee = checkedItems.reduce((s, i) => s + i.bundles.filter(b => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const grandTotal = subtotal + serviceFee

  const toggleAll = () => setItems(prev => prev.map(i => ({ ...i, checked: !allChecked })))
  const toggleItem = id => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))

  const toggleBundle = async (itemId, bundleId) => {
    // Find the item and update checkbox state locally
    const targetItem = items.find(i => i.id === itemId)
    if (!targetItem) return

    const updatedBundles = targetItem.bundles.map(b => b.id === bundleId ? { ...b, checked: !b.checked } : b)
    const selectedBundleIds = updatedBundles.filter(b => b.checked).map(b => b.id)

    try {
      await apiFetch(`/api/customer/cart/items/${itemId}/bundle-services`, {
        method: 'PUT',
        body: JSON.stringify({ bundleServicesIds: selectedBundleIds })
      })
      await fetchCart() // Reload cart from API to reflect totals
    } catch (e) {
      console.error("Lỗi cập nhật dịch vụ:", e)
    }
  }

  const changeQty = async (id, qty) => { // cập nhật số lượng sản phẩm trong giỏ hàng
    try {
      await apiFetch(`/api/customer/cart/items/${id}/quantity`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: qty })
      })
      await fetchCart()
    } catch (e) {
      console.error("Lỗi cập nhật số lượng:", e)
    }
  }

  const removeItem = async (id) => { // xóa sản phẩm khỏi giỏ hàng
    try {
      await apiFetch(`/api/customer/cart/items/${id}`, {
        method: 'DELETE'
      })
      await fetchCart()
    } catch (e) {
      console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", e)
    }
  }

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
            className="flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer hover:text-slate-950"
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
              className="mt-4 text-white px-6 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }}
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
                  <button onClick={() => {
                    const checkedIds = checkedItems.map(i => i.id)
                    Promise.all(checkedIds.map(id => apiFetch(`/api/customer/cart/items/${id}`, { method: 'DELETE' })))
                      .then(fetchCart)
                      .catch(e => console.error("Lỗi xóa các sản phẩm chọn:", e))
                  }}
                    className="ml-auto text-[12.5px] font-bold transition-colors cursor-pointer"
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
