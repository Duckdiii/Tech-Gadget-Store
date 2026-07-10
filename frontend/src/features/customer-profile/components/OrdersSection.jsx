import React, { useState } from 'react'

const ORDER_FILTER_TABS = [
  { id: 'all',        label: 'Tất cả' },
  { id: 'pending',    label: 'Chờ xác nhận' },
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'shipping',   label: 'Đang vận chuyển' },
  { id: 'completed',  label: 'Đã nhận hàng' },
  { id: 'cancelled',  label: 'Đã huỷ' },
]

const ORDER_STATUS = {
  completed:  { label: 'Đã nhận hàng',   dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50 border-green-200'  },
  shipping:   { label: 'Đang vận chuyển', dot: 'bg-[#E8420A]',  text: 'text-[#E8420A]',  bg: 'bg-orange-50 border-orange-200' },
  processing: { label: 'Đang xử lý',      dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200'},
  pending:    { label: 'Chờ xác nhận',    dot: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200'},
  cancelled:  { label: 'Đã huỷ',          dot: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50 border-red-200'      },
}

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + 'đ'
}

export default function OrdersSection({ orders = [], onNavigate }) {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = orders.filter(o => {
    const statusLower = o.orderStatus ? o.orderStatus.toLowerCase() : 'pending'
    const matchTab = activeTab === 'all' || statusLower === activeTab
    const firstItemName = o.items && o.items.length > 0 ? o.items[0].productName : ''
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || firstItemName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
      {/* Filter tabs */}
      <div className="flex items-center border-b border-gray-200 overflow-x-auto">
        {ORDER_FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors border-none bg-transparent cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#E8420A] text-[#E8420A]'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
            style={{ borderBottomWidth: '2px', borderBottomColor: activeTab === tab.id ? '#E8420A' : 'transparent' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & date bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/60 text-gray-800">
        <span className="text-sm font-semibold text-gray-700 shrink-0">Lịch sử mua hàng</span>
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Order list */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-gray-100 text-gray-850">
          {filtered.map(order => {
            const statusLower = order.orderStatus ? order.orderStatus.toLowerCase() : 'pending'
            const st = ORDER_STATUS[statusLower] || ORDER_STATUS.pending
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null
            const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '—'
            const productText = firstItem ? `${firstItem.productName} (${firstItem.variantName})` : 'Sản phẩm'
            const priceVal = firstItem ? firstItem.unitPrice : 0
            const extraText = order.items && order.items.length > 1 ? `Cùng ${order.items.length - 1} sản phẩm khác` : null
            const imgLabel = firstItem ? firstItem.productName.slice(0, 4) : 'SP'

            return (
              <div key={order.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                {/* Order header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-gray-900">#{order.id.slice(0, 10)}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">{dateStr}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${st.text} ${st.bg}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${st.dot} mr-1.5 align-middle`} />
                    {st.label}
                  </span>
                </div>

                {/* Product row */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500 border border-gray-200">
                    {imgLabel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{productText}</p>
                    <p className="text-sm text-gray-500 mt-1">{fmt(priceVal)}</p>
                    {extraText && <p className="text-xs text-gray-400 mt-1">{extraText}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500 mb-1">Tổng thanh toán</p>
                    <p className="text-xl font-black text-[#E8420A]">{fmt(order.total)}</p>
                    <button
                      onClick={() => onNavigate('invoice', { search: `?orderId=${order.id}` })}
                      className="mt-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] px-4 py-1.5 rounded transition-colors flex items-center gap-1 ml-auto border-none cursor-pointer"
                    >
                      Xem chi tiết
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-600">Không có đơn hàng nào</p>
          <p className="text-sm text-gray-400 mt-1">Hãy mua sắm ngay để xem lịch sử đơn hàng</p>
          <button onClick={() => onNavigate('list')} className="mt-5 bg-[#E8420A] hover:bg-[#c93808] text-white text-sm font-bold px-6 py-2.5 rounded transition-colors border-none cursor-pointer">
            Mua sắm ngay
          </button>
        </div>
      )}
    </div>
  )
}
