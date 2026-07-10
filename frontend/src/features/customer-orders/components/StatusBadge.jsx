import React from 'react'

const CUSTOMER_STATUS_CONFIG = {
  completed:  { label: 'Đã hoàn thành', dotColor: '#22C55E', bg: 'rgba(34,197,94,0.08)',  text: '#15803d',  border: 'rgba(34,197,94,0.25)'  },
  shipping:   { label: 'Đang giao hàng', dotColor: '#3B82F6', bg: 'rgba(59,130,246,0.08)', text: '#1d4ed8',  border: 'rgba(59,130,246,0.25)'  },
  processing: { label: 'Đang xử lý',    dotColor: 'var(--accent)', bg: 'rgba(232,66,10,0.08)', text: '#c2410c', border: 'rgba(232,66,10,0.25)' },
  pending:    { label: 'Chờ xác nhận',  dotColor: '#F59E0B', bg: 'rgba(245,158,11,0.08)', text: '#b45309',  border: 'rgba(245,158,11,0.25)'  },
  cancelled:  { label: 'Đã hủy',        dotColor: '#EF4444', bg: 'rgba(239,68,68,0.08)',  text: '#dc2626',  border: 'rgba(239,68,68,0.25)'   },
  refunded:   { label: 'Đã hoàn tiền',  dotColor: '#A855F7', bg: 'rgba(168,85,247,0.08)', text: '#7e22ce',  border: 'rgba(168,85,247,0.25)'  },
}

const MANAGER_STATUS_CONFIG = {
  COMPLETED:             { label: 'Đã hoàn thành', dot: 'bg-green-500',  bg: 'bg-green-100',  text: 'text-green-700'  },
  SHIPPING:              { label: 'Đang giao',     dot: 'bg-blue-500',   bg: 'bg-blue-50',    text: 'text-blue-700'   },
  PROCESSING:            { label: 'Đang xử lý',    dot: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' },
  AWAITING_CONFIRMATION: { label: 'Chờ xác nhận',  dot: 'bg-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  CANCELLED:             { label: 'Đã hủy',        dot: 'bg-red-500',    bg: 'bg-red-100',    text: 'text-red-700'    },
  REFUNDED:              { label: 'Đã hoàn tiền',  dot: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' },
}

export default function StatusBadge({ status, type = 'customer' }) {
  if (type === 'manager') {
    const c = MANAGER_STATUS_CONFIG[status] || MANAGER_STATUS_CONFIG.AWAITING_CONFIRMATION
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    )
  }

  // Default to customer layout
  const c = CUSTOMER_STATUS_CONFIG[status] || CUSTOMER_STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dotColor }} />
      {c.label}
    </span>
  )
}
