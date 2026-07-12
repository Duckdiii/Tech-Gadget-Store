
const MANAGER_STATUS_CONFIG = {
  COMPLETED:             { label: 'Đã hoàn thành', dot: 'bg-green-500',  bg: 'bg-green-100',  text: 'text-green-700'  },
  SHIPPING:              { label: 'Đang giao',     dot: 'bg-blue-500',   bg: 'bg-blue-50',    text: 'text-blue-700'   },
  PROCESSING:            { label: 'Đang xử lý',    dot: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' },
  AWAITING_CONFIRMATION: { label: 'Chờ xác nhận',  dot: 'bg-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  CANCELLED:             { label: 'Đã hủy',        dot: 'bg-red-500',    bg: 'bg-red-100',    text: 'text-red-700'    },
  REFUNDED:              { label: 'Đã hoàn tiền',  dot: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' },
}

export default function StatusBadge({ status }) {
  const c = MANAGER_STATUS_CONFIG[status] || MANAGER_STATUS_CONFIG.AWAITING_CONFIRMATION
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
