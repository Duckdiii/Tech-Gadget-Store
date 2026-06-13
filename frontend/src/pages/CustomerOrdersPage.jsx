import { useState } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const STATUS_CONFIG = {
  completed:  { label: 'Đã hoàn thành', dot: 'bg-green-500',  bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200'  },
  shipping:   { label: 'Đang giao hàng', dot: 'bg-blue-500',  bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200'   },
  processing: { label: 'Đang xử lý',    dot: 'bg-orange-400', bg: 'bg-orange-50',  text: 'text-orange-600', border: 'border-orange-200' },
  pending:    { label: 'Chờ xác nhận',  dot: 'bg-yellow-400', bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200' },
  cancelled:  { label: 'Đã hủy',        dot: 'bg-red-400',    bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200'    },
  refunded:   { label: 'Đã hoàn tiền',  dot: 'bg-purple-400', bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
}

const FILTER_TABS = [
  { id: 'all',        label: 'Tất cả', count: 6 },
  { id: 'pending',    label: 'Chờ xác nhận', count: 1 },
  { id: 'processing', label: 'Đang xử lý',   count: 1 },
  { id: 'shipping',   label: 'Đang giao',     count: 1 },
  { id: 'completed',  label: 'Đã hoàn thành', count: 2 },
  { id: 'cancelled',  label: 'Đã hủy',        count: 1 },
]

const ORDERS = [
  {
    id: '#ORD-2023-8901',
    date: '28/10/2023',
    total: 24500000,
    status: 'completed',
    items: [
      { name: 'MacBook Pro 14" M3 Pro', qty: 1, price: 49990000 },
      { name: 'Dán màn hình từ tính',   qty: 1, price: 450000 },
    ],
  },
  {
    id: '#ORD-2023-8942',
    date: '30/10/2023',
    total: 12200000,
    status: 'shipping',
    items: [
      { name: 'iPhone 15 Pro Max 256GB', qty: 1, price: 29490000 },
      { name: 'Bảo hành VIP',           qty: 1, price: 1200000 },
    ],
  },
  {
    id: '#ORD-2023-8977',
    date: '31/10/2023',
    total: 5400000,
    status: 'processing',
    items: [
      { name: 'AirPods Pro 2nd Gen', qty: 1, price: 6490000 },
    ],
  },
  {
    id: '#ORD-2023-8990',
    date: '31/10/2023',
    total: 1250000,
    status: 'pending',
    items: [
      { name: 'Cáp USB-C 240W', qty: 2, price: 450000 },
      { name: 'Dán kính cường lực', qty: 1, price: 350000 },
    ],
  },
  {
    id: '#ORD-2023-8750',
    date: '15/10/2023',
    total: 8900000,
    status: 'cancelled',
    items: [
      { name: 'Samsung Galaxy S23 Ultra', qty: 1, price: 25990000 },
    ],
  },
  {
    id: '#ORD-2023-8700',
    date: '10/10/2023',
    total: 3200000,
    status: 'completed',
    items: [
      { name: 'Apple Watch Series 9 41mm', qty: 1, price: 11990000 },
    ],
  },
]

function fmt(n) {
  return n.toLocaleString('vi-VN') + 'đ'
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

function OrderCard({ order, onNavigate }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">{order.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-base font-bold text-gray-900">{fmt(order.total)}</p>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-5 pb-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mt-3 mb-2">{order.items.length} sản phẩm</p>
        <div className={`space-y-1.5 overflow-hidden transition-all ${expanded ? '' : 'max-h-[60px]'}`}>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-xs text-gray-400">x{item.qty}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">{fmt(item.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
        {order.status === 'shipping' && (
          <button className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
            Theo dõi đơn hàng
          </button>
        )}
        {order.status === 'completed' && (
          <button className="text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
            Mua lại
          </button>
        )}
        {order.status === 'pending' && (
          <button className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
            Hủy đơn
          </button>
        )}
        <button
          onClick={() => onNavigate('invoice')}
          className="text-xs font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  )
}

export default function CustomerOrdersPage() {
  const onNavigate = useNav()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ORDERS.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <StoreNavbar />

      <div className="max-w-3xl mx-auto w-full px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <span onClick={() => onNavigate('home')} className="hover:text-blue-600 cursor-pointer">Trang chủ</span>
          <span>›</span>
          <span onClick={() => onNavigate('userProfile')} className="hover:text-blue-600 cursor-pointer">Tài khoản</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">Đơn hàng của tôi</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý tất cả đơn hàng</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hàng..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {tab.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Order list */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Không có đơn hàng nào</p>
            <p className="text-gray-400 text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
            <button
              onClick={() => onNavigate('list')}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Mua sắm ngay
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
