import { useState } from 'react'
import StatusBadge from './StatusBadge'

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + ' đ'
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

export default function OrderCard({ order, onNavigate, onCancel }) {
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
            <p className="text-sm font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {order.id.substring(0, 13).toUpperCase()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ct3)' }}>
              {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : 'N/A'}
            </p>
          </div>
          <StatusBadge status={mappedStatus} type="customer" />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-base font-bold" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {fmt(order.total)}
          </p>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 transition-colors border-none bg-transparent cursor-pointer"
            style={{ borderRadius: '3px', color: 'var(--ct3)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--page)'
              e.currentTarget.style.color = 'var(--ct1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--ct3)'
            }}
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
                <span className="text-sm font-semibold text-left max-w-xs truncate" style={{ color: 'var(--ct1)' }}>
                  {item.productName}
                </span>
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
          <button
            onClick={() => onCancel(order.id)}
            className="text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
            style={{
              color: 'var(--err)',
              border: '1px solid rgba(239,68,68,0.3)',
              backgroundColor: 'rgba(239,68,68,0.05)',
              borderRadius: '8px',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'}
          >
            Hủy đơn
          </button>
        )}
        <button
          onClick={() => onNavigate('invoice', { search: `?orderId=${order.id}` })}
          className="text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
          style={{ color: 'var(--ct2)', border: '1px solid var(--cb)', backgroundColor: 'var(--card)', borderRadius: '8px' }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#c8d0e4'
            e.currentTarget.style.color = 'var(--ct1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--cb)'
            e.currentTarget.style.color = 'var(--ct2)'
          }}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  )
}
