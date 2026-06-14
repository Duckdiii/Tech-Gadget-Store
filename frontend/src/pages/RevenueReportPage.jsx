/* ── Area Chart ── */
const CW = 560, CH = 190, CPAD_B = 40

const REVENUE_DATA = [
  { label: '01/10', v: 0.18 },
  { label: '08/10', v: 0.52 },
  { label: '15/10', v: 0.40 },
  { label: '22/10', v: 0.88 },
  { label: '31/10', v: 0.60 },
]

function catmullPath(pts) {
  const ext = [
    { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
    ...pts,
    { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x, y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y },
  ]
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = ext[i], p1 = ext[i + 1], p2 = ext[i + 2], p3 = ext[i + 3]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

function AreaChart() {
  const pts = REVENUE_DATA.map((d, i) => ({
    x: (i / (REVENUE_DATA.length - 1)) * CW,
    y: 8 + CH * (1 - d.v),
    label: d.label,
  }))

  const linePath = catmullPath(pts)
  const areaPath = `${linePath} L ${CW} ${CH + 8} L 0 ${CH + 8} Z`
  const gridYs = [CH * 0.25 + 8, CH * 0.5 + 8, CH * 0.75 + 8]

  return (
    <svg viewBox={`0 0 ${CW} ${CH + CPAD_B}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#374151" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridYs.map((y, i) => (
        <line key={i} x1="0" y1={y} x2={CW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Dots */}
      {pts.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="5.5" fill="#111827" />
          <circle cx={pt.x} cy={pt.y} r="2.5" fill="white" />
        </g>
      ))}

      {/* X-axis labels */}
      {pts.map((pt, i) => (
        <text key={i} x={pt.x} y={CH + CPAD_B - 6} textAnchor="middle" fontSize="13" fill="#9ca3af" fontFamily="system-ui,sans-serif">
          {pt.label}
        </text>
      ))}
    </svg>
  )
}

/* ── Donut Chart ── */
const DONUT_CX = 90, DONUT_CY = 90, R_OUT = 74, R_IN = 52

const DONUT_SEGS = [
  { pct: 0.60, color: '#E8420A', label: 'Smartphones' },
  { pct: 0.25, color: '#92400e', label: 'Laptops' },
  { pct: 0.15, color: '#d1d5db', label: 'Accessories' },
]

function segPath(start, end) {
  const x1o = DONUT_CX + R_OUT * Math.cos(start)
  const y1o = DONUT_CY + R_OUT * Math.sin(start)
  const x2o = DONUT_CX + R_OUT * Math.cos(end)
  const y2o = DONUT_CY + R_OUT * Math.sin(end)
  const x1i = DONUT_CX + R_IN * Math.cos(start)
  const y1i = DONUT_CY + R_IN * Math.sin(start)
  const x2i = DONUT_CX + R_IN * Math.cos(end)
  const y2i = DONUT_CY + R_IN * Math.sin(end)
  const large = (end - start) > Math.PI ? 1 : 0
  return [
    `M ${x1o.toFixed(2)} ${y1o.toFixed(2)}`,
    `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${x2o.toFixed(2)} ${y2o.toFixed(2)}`,
    `L ${x2i.toFixed(2)} ${y2i.toFixed(2)}`,
    `A ${R_IN} ${R_IN} 0 ${large} 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)}`,
    'Z',
  ].join(' ')
}

function DonutChart() {
  let angle = -Math.PI / 2
  const paths = DONUT_SEGS.map((seg) => {
    const endAngle = angle + seg.pct * 2 * Math.PI
    const d = segPath(angle, endAngle - 0.03)
    angle = endAngle
    return { ...seg, d }
  })

  return (
    <svg viewBox="0 0 180 180" width="170" height="170" className="mx-auto">
      {paths.map((seg, i) => (
        <path key={i} d={seg.d} fill={seg.color} />
      ))}
      <text x={DONUT_CX} y={DONUT_CY - 5} textAnchor="middle" fontSize="21" fontWeight="bold" fill="#111827" fontFamily="system-ui,sans-serif">60%</text>
      <text x={DONUT_CX} y={DONUT_CY + 16} textAnchor="middle" fontSize="11.5" fill="#6b7280" fontFamily="system-ui,sans-serif">Smartphones</text>
    </svg>
  )
}

/* ── KPI Cards ── */
const KPI_CARDS = [
  {
    label: 'TỔNG DOANH THU',
    value: '2,540,000,000 đ',
    trend: '+12%',
    trendExtra: ' so với tháng trước',
    trendUp: true,
    iconBg: 'bg-orange-50',
    iconColor: 'text-[#E8420A]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
  {
    label: 'TỔNG ĐƠN HÀNG',
    value: '1,245',
    trend: '+5%',
    trendExtra: '',
    trendUp: true,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: 'GIÁ TRỊ ĐƠN TB',
    value: '2,040,000 đ',
    trend: '-2%',
    trendExtra: '',
    trendUp: false,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'KHÁCH HÀNG MỚI',
    value: '450',
    trend: '+18%',
    trendExtra: '',
    trendUp: true,
    iconBg: 'bg-orange-50',
    iconColor: 'text-[#E8420A]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
]

/* ── Best Sellers ── */
const BEST_SELLERS = [
  { no: 1, img: 'https://placehold.co/40x40/e0e7ff/4f46e5?text=IP', name: 'iPhone 15 Pro Max', category: 'Smartphones', qty: 120, revenue: 4200000000 },
  { no: 2, img: 'https://placehold.co/40x40/d1fae5/065f46?text=MB', name: 'MacBook Pro M3', category: 'Laptops', qty: 45, revenue: 3825000000 },
  { no: 3, img: 'https://placehold.co/40x40/fef3c7/92400e?text=AW', name: 'Apple Watch Series 9', category: 'Accessories', qty: 89, revenue: 1068000000 },
  { no: 4, img: 'https://placehold.co/40x40/fce7f3/9d174d?text=SS', name: 'Samsung Galaxy S24 Ultra', category: 'Smartphones', qty: 67, revenue: 2278000000 },
]

const CATEGORY_COLOR = {
  Smartphones: 'bg-orange-50 text-[#C4350A]',
  Laptops: 'bg-amber-100 text-amber-700',
  Accessories: 'bg-gray-100 text-gray-600',
}

function TrendBadge({ trend, trendExtra, trendUp }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {trendUp ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      )}
      {trend}{trendExtra}
    </span>
  )
}

export default function RevenueReportPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Bell with red dot */}
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {/* Help */}
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {/* Avatar */}
          <img
            src="https://placehold.co/34x34/374151/ffffff?text=AD"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-7 space-y-6">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo doanh thu</h1>
          <div className="flex items-center gap-3">
            {/* Date range */}
            <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              01/10/2023 - 31/10/2023
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Export */}
            <button className="flex items-center gap-2 bg-[#0D0F14] hover:bg-[#0D0F14] text-white font-semibold py-2 px-5 rounded text-sm transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5">
          {KPI_CARDS.map((card, i) => (
            <div key={i} className="bg-white rounded border border-gray-200 px-5 py-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 tracking-wider">{card.label}</span>
                <span className={`w-9 h-9 flex items-center justify-center rounded ${card.iconBg} ${card.iconColor}`}>
                  {card.icon}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 leading-tight mb-3">{card.value}</p>
              <TrendBadge trend={card.trend} trendExtra={card.trendExtra} trendUp={card.trendUp} />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-[1fr_280px] gap-5">
          {/* Area Chart */}
          <div className="bg-white rounded border border-gray-200 px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Xu hướng doanh thu</h2>
              <button className="p-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
            <AreaChart />
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded border border-gray-200 px-5 py-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 leading-tight">
                Doanh thu theo danh<br />mục
              </h2>
              <button className="p-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center py-2">
              <DonutChart />
            </div>

            {/* Legend */}
            <div className="space-y-2.5 mt-2">
              {[
                { label: 'Smartphones', pct: '60%', color: 'bg-[#E8420A]' },
                { label: 'Laptops', pct: '25%', color: 'bg-amber-800' },
                { label: 'Accessories', pct: '15%', color: 'bg-gray-300' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Sản phẩm bán chạy nhất</h2>
            <button className="text-sm font-semibold text-[#E8420A] hover:text-[#C4350A] cursor-pointer">Xem tất cả</button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_10rem_10rem_12rem] gap-3 px-5 py-3 border-b border-gray-100">
            {['STT', 'TÊN SẢN PHẨM', 'DANH MỤC', 'SỐ LƯỢNG ĐÃ BÁN', 'TỔNG DOANH THU'].map((h) => (
              <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {BEST_SELLERS.map((row) => (
            <div key={row.no} className="grid grid-cols-[3rem_1fr_10rem_10rem_12rem] gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center">
              <span className="text-sm text-gray-500 font-medium">{row.no}</span>
              <div className="flex items-center gap-3">
                <img src={row.img} alt={row.name} className="w-9 h-9 rounded object-cover shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{row.name}</span>
              </div>
              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-semibold w-fit ${CATEGORY_COLOR[row.category] || 'bg-gray-100 text-gray-600'}`}>
                {row.category}
              </span>
              <span className="text-sm text-gray-700 font-medium">{row.qty}</span>
              <span className="text-sm font-bold text-[#E8420A]">
                {row.revenue.toLocaleString('vi-VN')} đ
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
