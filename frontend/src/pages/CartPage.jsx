import { useState } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const initialItems = [
  {
    id: 1,
    brand: 'Apple',
    name: 'MacBook Pro 14" M3 Pro 2023',
    variant: 'Space Black | 18GB RAM | 512GB SSD',
    price: 49990000,
    originalPrice: 54990000,
    qty: 1,
    image: 'https://placehold.co/120x100/f1f5f9/374151?text=MacBook',
    checked: true,
    bundles: [
      { id: 'b1', label: 'Gói Bảo hành Mở rộng (1 năm)', price: 2490000, checked: false },
      { id: 'b2', label: 'Dán màn hình từ tính', price: 450000, checked: true },
    ],
  },
  {
    id: 2,
    brand: 'Apple',
    name: 'iPhone 15 Pro Max',
    variant: 'Titan Tự Nhiên | 256GB',
    price: 29490000,
    originalPrice: 32990000,
    qty: 2,
    image: 'https://placehold.co/120x100/f1f5f9/374151?text=iPhone',
    checked: true,
    bundles: [
      { id: 'b3', label: 'Bảo hành VIP (Lỗi đổi mới)', price: 1200000, checked: true },
      { id: 'b4', label: 'Dán kính cường lực', price: 250000, checked: false },
    ],
  },
]

function fmt(price) {
  return price.toLocaleString('vi-VN') + ' đ'
}

function QuantityControl({ qty, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center">
      <button
        onClick={onDecrease}
        className="w-9 h-9 flex items-center justify-center rounded-l-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors border border-gray-200"
      >−</button>
      <span className="w-11 h-9 flex items-center justify-center text-sm font-bold text-gray-900 bg-white border-y border-gray-200">
        {qty}
      </span>
      <button
        onClick={onIncrease}
        className="w-9 h-9 flex items-center justify-center rounded-r-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors border border-gray-200"
      >+</button>
    </div>
  )
}

function CartItem({ item, onToggleItem, onToggleBundle, onQtyChange, onRemove }) {
  const bundleFee = item.bundles.filter(b => b.checked).reduce((s, b) => s + b.price, 0)
  const lineTotal = (item.price + bundleFee) * item.qty
  const lineSavings = item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${item.checked ? 'border-blue-100 shadow-sm' : 'border-gray-100 opacity-55'}`}>

      {/* Main row */}
      <div className="flex gap-4 p-5">
        <div className="flex items-center shrink-0">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => onToggleItem(item.id)}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="w-28 h-24 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center border border-gray-100">
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{item.brand}</span>
              <h3 className="text-[15px] font-bold text-gray-900 leading-snug mt-0.5">{item.name}</h3>
              <p className="text-[13px] text-gray-400 mt-1">{item.variant}</p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-blue-600">{fmt(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">{fmt(item.originalPrice)}</span>
                )}
              </div>
              {lineSavings > 0 && (
                <p className="text-[12px] text-green-600 font-semibold mt-0.5">Tiết kiệm {fmt(lineSavings)}</p>
              )}
            </div>
            <QuantityControl
              qty={item.qty}
              onIncrease={() => onQtyChange(item.id, item.qty + 1)}
              onDecrease={() => item.qty > 1 && onQtyChange(item.id, item.qty - 1)}
            />
          </div>
        </div>
      </div>

      {/* Bundle services – max 2, ngay dưới sản phẩm */}
      {item.bundles.slice(0, 2).length > 0 && (
        <div className="mx-5 mb-4 rounded-xl border border-blue-100 bg-blue-50/50 divide-y divide-blue-100/70">
          <div className="px-4 py-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Dịch vụ kèm theo</span>
          </div>
          {item.bundles.slice(0, 2).map(bundle => (
            <label
              key={bundle.id}
              className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={bundle.checked}
                  onChange={() => onToggleBundle(item.id, bundle.id)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0"
                />
                <div>
                  <span className={`text-[13px] font-medium transition-colors ${bundle.checked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {bundle.label}
                  </span>
                </div>
              </div>
              <span className={`text-[13px] font-bold shrink-0 ${bundle.checked ? 'text-blue-600' : 'text-gray-400'}`}>
                +{fmt(bundle.price)}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Line total footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
        <span className="text-[13px] text-gray-400">
          Thành tiền ({item.qty} sp{bundleFee > 0 ? ' + dịch vụ' : ''})
        </span>
        <span className="text-[15px] font-extrabold text-gray-900">{fmt(lineTotal)}</span>
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
  const serviceFee = checkedItems.reduce((s, i) =>
    s + i.bundles.filter(b => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const total = subtotal + serviceFee

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Tổng quan đơn hàng
        </h2>
        <p className="text-blue-200 text-[12px] mt-0.5">{totalQty} sản phẩm được chọn</p>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500">Giá sản phẩm</span>
          <span className="text-[13px] font-semibold text-gray-700">{fmt(subtotal)}</span>
        </div>
        {productSavings > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-green-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tiết kiệm từ giảm giá
            </span>
            <span className="text-[13px] font-bold text-green-600">−{fmt(productSavings)}</span>
          </div>
        )}
        {serviceFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-500">Dịch vụ kèm theo</span>
            <span className="text-[13px] font-semibold text-orange-500">+{fmt(serviceFee)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
            </svg>
            Phí vận chuyển
          </span>
          <span className="text-[13px] font-bold text-green-600">Miễn phí</span>
        </div>

        <div className="border-t-2 border-dashed border-gray-100 my-1" />

        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-semibold text-gray-600">Tổng tạm tính</span>
            <span className="text-[11px] text-gray-400">(Chưa áp mã KM)</span>
          </div>
          <p className="text-right text-2xl font-black text-blue-700">{fmt(total)}</p>
          {productSavings > 0 && (
            <p className="text-right text-[12px] font-semibold text-green-600 mt-0.5">
              Đã tiết kiệm {fmt(productSavings)}
            </p>
          )}
        </div>

        <p className="text-[11px] text-gray-400 text-center pt-1">
          Mã khuyến mãi sẽ được nhập ở bước tiếp theo
        </p>
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
  const serviceFee = checkedItems.reduce((s, i) =>
    s + i.bundles.filter(b => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const grandTotal = subtotal + serviceFee

  const toggleAll = () => setItems(prev => prev.map(i => ({ ...i, checked: !allChecked })))
  const toggleItem = id => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  const toggleBundle = (itemId, bundleId) =>
    setItems(prev => prev.map(i =>
      i.id === itemId
        ? { ...i, bundles: i.bundles.map(b => b.id === bundleId ? { ...b, checked: !b.checked } : b) }
        : i
    ))
  const changeQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const removeItem = id => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <StoreNavbar />

      <div className="max-w-screen-2xl mx-auto w-full px-8 py-8 pb-32">
        {/* Page header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
            <p className="text-sm text-gray-400 mt-1">Kiểm tra lại sản phẩm trước khi thanh toán</p>
          </div>
          <button
            onClick={() => onNavigate('list')}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tiếp tục mua sắm
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <svg className="w-20 h-20 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-400">Giỏ hàng của bạn đang trống</p>
            <button onClick={() => onNavigate('list')} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="flex gap-7 items-start">
            {/* Left – Cart items */}
            <div className="flex-1 min-w-0">
              {/* Select all bar */}
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-5 py-3 mb-4 shadow-sm">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Chọn tất cả ({items.length} sản phẩm)
                </span>
                {someChecked && (
                  <button
                    onClick={() => setItems(prev => prev.filter(i => !i.checked))}
                    className="ml-auto text-[13px] text-red-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Xoá đã chọn
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {items.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onToggleItem={toggleItem}
                    onToggleBundle={toggleBundle}
                    onQtyChange={changeQty}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Right – Summary */}
            <div className="w-[380px] shrink-0">
              <OrderSummary items={items} />
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom bar ── */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="max-w-screen-2xl mx-auto px-8 py-4 flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[12px] text-gray-400">{totalQty} sản phẩm được chọn</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[13px] text-gray-500">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-blue-700">{(subtotal + serviceFee).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
              {serviceFee > 0 && (
                <div className="hidden md:block text-[12px] text-orange-500 font-medium border-l border-gray-200 pl-6">
                  Bao gồm {(serviceFee).toLocaleString('vi-VN')} đ dịch vụ
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[15px] px-10 py-3.5 rounded-xl transition-all shadow-md shadow-blue-200"
            >
              Đặt hàng ngay
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
