import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'

const STATUS_CONFIG = {
  completed:  { label: 'Đã hoàn thành', dotColor: '#22C55E', bg: 'rgba(34,197,94,0.08)',  text: '#15803d',  border: 'rgba(34,197,94,0.25)'  },
  shipping:   { label: 'Đang giao hàng', dotColor: '#3B82F6', bg: 'rgba(59,130,246,0.08)', text: '#1d4ed8',  border: 'rgba(59,130,246,0.25)'  },
  processing: { label: 'Đang xử lý',    dotColor: 'var(--accent)', bg: 'rgba(232,66,10,0.08)', text: '#c2410c', border: 'rgba(232,66,10,0.25)' },
  pending:    { label: 'Chờ xác nhận',  dotColor: '#F59E0B', bg: 'rgba(245,158,11,0.08)', text: '#b45309',  border: 'rgba(245,158,11,0.25)'  },
  cancelled:  { label: 'Đã hủy',        dotColor: '#EF4444', bg: 'rgba(239,68,68,0.08)',  text: '#dc2626',  border: 'rgba(239,68,68,0.25)'   },
  refunded:   { label: 'Đã hoàn tiền',  dotColor: '#A855F7', bg: 'rgba(168,85,247,0.08)', text: '#7e22ce',  border: 'rgba(168,85,247,0.25)'  },
}

const mapStatus = (backendStatus) => {
  switch (backendStatus) {
    case 'COMPLETED': return 'completed'
    case 'SHIPPING': return 'shipping'
    case 'PROCESSING': return 'processing'
    case 'AWAITING_CONFIRMATION': return 'pending'
    case 'CANCELLED': return 'cancelled'
    case 'REFUNDED': return 'refunded'
    default: return 'pending'
  }
}

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dotColor }} />
      {c.label}
    </span>
  )
}

function OrderCard({ order, onNavigate, onCancel }) {
  const [expanded, setExpanded] = useState(false)
  const mappedStatus = mapStatus(order.orderStatus)
  const items = order.items || []

  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: 'var(--card)',
        border: '1.5px solid var(--cb)',
        borderRadius: '16px',
        borderLeft: mappedStatus === 'shipping' || mappedStatus === 'processing' ? '4.5px solid var(--accent)' : '1.5px solid var(--cb)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{order.id.substring(0, 13).toUpperCase()}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ct3)' }}>{order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : 'N/A'}</p>
          </div>
          <StatusBadge status={mappedStatus} />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-base font-bold" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(order.total)}</p>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 transition-colors border-none bg-transparent"
            style={{ borderRadius: '3px', color: 'var(--ct3)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--page)'; e.currentTarget.style.color = 'var(--ct1)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--ct3)' }}
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 pb-4" style={{ borderTop: '1px solid var(--cb)' }}>
        <p className="text-xs mt-3 mb-2" style={{ color: 'var(--ct3)' }}>{items.length} sản phẩm</p>
        <div className={`space-y-1.5 overflow-hidden transition-all ${expanded ? '' : 'max-h-[60px]'}`}>
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--page)', border: '1px solid var(--cb)', borderRadius: '8px' }}>
                  <svg className="w-3.5 h-3.5" style={{ color: 'var(--ct3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-left max-w-xs truncate" style={{ color: 'var(--ct1)' }}>{item.productName}</span>
                <span className="text-xs" style={{ color: 'var(--ct3)' }}>x{item.quantity}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--ct2)' }}>{fmt(item.totalPrice)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 px-5 py-3" style={{ borderTop: '1px solid var(--cb)', backgroundColor: 'var(--page)' }}>
        {mappedStatus === 'pending' && (
          <button onClick={() => onCancel(order.id)} className="text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
            style={{ color: 'var(--err)', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'}
          >Hủy đơn</button>
        )}
        <button onClick={() => onNavigate('invoice', { search: `?orderId=${order.id}` })}
          className="text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
          style={{ color: 'var(--ct2)', border: '1px solid var(--cb)', backgroundColor: 'var(--card)', borderRadius: '8px' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8d0e4'; e.currentTarget.style.color = 'var(--ct1)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct2)' }}
        >Xem chi tiết</button>
      </div>
    </div>
  )
}

export default function CustomerOrdersPage() {
  const onNavigate = useNav()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/api/customer/orders')
      setOrders(data || [])
    } catch (e) {
      console.error("Lỗi tải lịch sử đơn hàng:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return
    try {
      await apiFetch(`/api/customer/orders/${orderId}/cancel`, {
        method: 'POST'
      })
      await fetchOrders()
    } catch (e) {
      alert("Hủy đơn hàng thất bại: " + e.message)
    }
  }

  const filtered = orders.filter(o => {
    const mapped = mapStatus(o.orderStatus)
    const matchTab = activeTab === 'all' || mapped === activeTab
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  // Group filter tab config
  const getTabCount = (tabId) => {
    if (tabId === 'all') return orders.length
    return orders.filter(o => mapStatus(o.orderStatus) === tabId).length
  }

  const filterTabs = [
    { id: 'all',        label: 'Tất cả' },
    { id: 'pending',    label: 'Chờ xác nhận' },
    { id: 'processing', label: 'Đang xử lý' },
    { id: 'shipping',   label: 'Đang giao' },
    { id: 'completed',  label: 'Đã hoàn thành' },
    { id: 'cancelled',  label: 'Đã hủy' },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* Dark header */}
      <div style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }} className="py-5">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: 'var(--accent)' }}>Tài khoản</p>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Đơn hàng của tôi</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 text-gray-800">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--ct3)' }}>
          <span onClick={() => onNavigate('home')} className="cursor-pointer transition-colors"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ct1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct3)'}
          >Trang chủ</span>
          <span>›</span>
          <span onClick={() => onNavigate('userProfile')} className="cursor-pointer transition-colors"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ct1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct3)'}
          >Tài khoản</span>
          <span>›</span>
          <span style={{ color: 'var(--ct1)', fontWeight: 500 }}>Đơn hàng của tôi</span>
        </nav>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--ct3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hàng..."
            className="field-light w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer border-none bg-transparent"
              style={activeTab === tab.id
                ? { backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }
                : { backgroundColor: 'var(--card)', color: 'var(--ct2)', border: '1.5px solid var(--cb)', borderRadius: '8px' }
              }
            >
              {tab.label}
              <span className="text-[11px] font-bold px-2 py-0.5"
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--page)',
                  color: activeTab === tab.id ? 'white' : 'var(--ct3)',
                  borderRadius: '20px',
                }}
              >{getTabCount(tab.id)}</span>
            </button>
          ))}
        </div>

        {/* Order list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(order => <OrderCard key={order.id} order={order} onNavigate={onNavigate} onCancel={handleCancelOrder} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--card)', border: '1.5px solid var(--cb)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--ct3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-bold" style={{ color: 'var(--ct2)' }}>Không có đơn hàng nào</p>
            <p className="text-sm mt-1" style={{ color: 'var(--ct3)' }}>Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
            <button onClick={() => onNavigate('list')}
              className="mt-5 text-white text-sm font-bold px-5 py-2.5 transition-all duration-200 cursor-pointer border-none"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }}
            >Mua sắm ngay</button>
          </div>
        )}
      </div>
    </div>
  )
}
