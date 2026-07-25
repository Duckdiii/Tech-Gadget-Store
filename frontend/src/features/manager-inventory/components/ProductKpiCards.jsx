const CARDS = [
  {
    key: null,
    label: 'ĐANG KINH DOANH',
    statKey: 'totalActive',
    sub: 'Tổng sản phẩm active',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
      </svg>
    ),
    color: 'blue',
  },
  {
    key: 'outOfStock',
    label: 'HẾT HÀNG',
    statKey: 'outOfStock',
    sub: 'Có variant, tồn kho = 0',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    color: 'red',
  },
  {
    key: 'noVariants',
    label: 'CHƯA CÓ PHIÊN BẢN',
    statKey: 'noVariants',
    sub: 'Cần thêm RAM/bộ nhớ/màu',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: 'amber',
  },
  {
    key: 'noImages',
    label: 'CHƯA CÓ HÌNH ẢNH',
    statKey: 'noImages',
    sub: 'Cần thêm ảnh sản phẩm',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'violet',
  },
]

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   val: 'text-blue-700',   ring: 'ring-blue-400'   },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',    val: 'text-red-700',    ring: 'ring-red-400'    },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600', val: 'text-amber-700',  ring: 'ring-amber-400'  },
  violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', val: 'text-violet-700', ring: 'ring-violet-400' },
}

export default function ProductKpiCards({ stats, activeKpi, onSelect }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card) => {
        const value = stats?.[card.statKey] ?? '—'
        const isActive = activeKpi === card.key
        const c = COLOR_MAP[card.color]
        return (
          <button aria-label="Thao tác" key={card.label}
            type="button"
            onClick={() => onSelect(card.key)}
            className={`text-left w-full bg-white rounded-xl border-2 px-5 py-4 flex items-start gap-4 transition-colors cursor-pointer ${
              isActive
                ? `border-transparent ring-2 ${c.ring} shadow-md`
                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.icon}`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{card.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${c.val}`}>{value?.toLocaleString?.('vi-VN') ?? value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{card.sub}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
