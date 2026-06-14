import { useState } from 'react'
import { useNav } from '../hooks/useNav'

/* ── Revenue Chart ── */
const CW = 700, CH = 180, CPAD_B = 36

const REVENUE_DATA = [
  { label: 'T1', v: 0.45 },
  { label: 'T2', v: 0.38 },
  { label: 'T3', v: 0.60 },
  { label: 'T4', v: 0.52 },
  { label: 'T5', v: 0.72 },
  { label: 'T6', v: 0.65 },
  { label: 'T7', v: 0.88 },
  { label: 'T8', v: 0.76 },
  { label: 'T9', v: 0.55 },
  { label: 'T10', v: 0.82 },
  { label: 'T11', v: 0.94 },
  { label: 'T12', v: 0.70 },
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

function RevenueChart() {
  const pts = REVENUE_DATA.map((d, i) => ({
    x: (i / (REVENUE_DATA.length - 1)) * CW,
    y: 8 + CH * (1 - d.v),
    label: d.label,
    v: d.v,
  }))
  const linePath = catmullPath(pts)
  const areaPath = `${linePath} L ${CW} ${CH + 8} L 0 ${CH + 8} Z`
  const gridYs = [CH * 0.25 + 8, CH * 0.5 + 8, CH * 0.75 + 8]

  return (
    <svg viewBox={`0 0 ${CW} ${CH + CPAD_B}`} className="w-full h-auto">
      <defs>
        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8420A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E8420A" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {gridYs.map((y, i) => (
        <line key={i} x1="0" y1={y} x2={CW} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
      ))}

      <path d={areaPath} fill="url(#dashGrad)" />
      <path d={linePath} fill="none" stroke="#E8420A" strokeWidth="2.5" strokeLinejoin="round" />

      {pts.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="5" fill="#E8420A" />
          <circle cx={pt.x} cy={pt.y} r="2.5" fill="white" />
        </g>
      ))}

      {pts.map((pt, i) => (
        <text key={i} x={pt.x} y={CH + CPAD_B - 4} textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="system-ui,sans-serif">
          {pt.label}
        </text>
      ))}
    </svg>
  )
}

/* ── Data ── */
const KPI_CARDS = [
  {
    label: 'Doanh thu hôm nay',
    value: '48.5',
    unit: 'tr',
    change: '+12%',
    up: true,
    color: 'blue',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Doanh thu tháng',
    value: '1.24',
    unit: 'tỷ',
    change: '+8%',
    up: true,
    color: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Đơn hàng mới',
    value: '137',
    unit: '',
    change: '+23',
    up: true,
    color: 'green',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: 'Khách hàng mới',
    value: '84',
    unit: '',
    change: '+31',
    up: true,
    color: 'purple',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    label: 'Cảnh báo tồn kho',
    value: '9',
    unit: 'SKU',
    change: '-2',
    up: false,
    color: 'red',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
]

const COLOR_MAP = {
  blue:   { bg: 'bg-orange-50',   icon: 'bg-[#E8420A]',   text: 'text-[#E8420A]'   },
  indigo: { bg: 'bg-orange-50', icon: 'bg-[#0D0F14]', text: 'text-[#E8420A]' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-500',  text: 'text-green-600'  },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-500',    text: 'text-red-600'    },
}

const RECENT_ORDERS = [
  { id: 'TG-240601', customer: 'Nguyễn Văn A', product: 'iPhone 15 Pro Max 256GB', total: 32990000, status: 'Hoàn thành', time: '08:12' },
  { id: 'TG-240602', customer: 'Trần Thị B',   product: 'Samsung Galaxy S24 Ultra', total: 27500000, status: 'Đang giao',  time: '09:05' },
  { id: 'TG-240603', customer: 'Lê Hoàng C',   product: 'AirPods Pro 2nd Gen',       total: 5990000,  status: 'Chờ xác nhận', time: '09:47' },
  { id: 'TG-240604', customer: 'Phạm Văn D',   product: 'MacBook Air M3 8GB',        total: 28990000, status: 'Hoàn thành', time: '10:23' },
  { id: 'TG-240605', customer: 'Hoàng Thị E',  product: 'iPad Pro 11" M4',           total: 21990000, status: 'Đã hủy',    time: '11:00' },
]

const STATUS_STYLE = {
  'Hoàn thành':    'bg-green-100 text-green-700',
  'Đang giao':     'bg-orange-50 text-[#C4350A]',
  'Chờ xác nhận': 'bg-amber-100 text-amber-700',
  'Đã hủy':       'bg-red-100 text-red-600',
}

const TOP_PRODUCTS = [
  { name: 'iPhone 15 Pro Max 256GB', sold: 142, revenue: 4678580000, pct: 92 },
  { name: 'Samsung Galaxy S24 Ultra', sold: 98, revenue: 2695000000, pct: 64 },
  { name: 'MacBook Air M3 8GB',      sold: 77, revenue: 2232230000, pct: 50 },
  { name: 'AirPods Pro 2nd Gen',     sold: 205, revenue: 1227950000, pct: 100 },
  { name: 'iPad Pro 11" M4',         sold: 55, revenue: 1209450000, pct: 36 },
]

const LOW_STOCK = [
  { name: 'iPad Mini 6 WiFi 64GB',  stock: 2,  min: 10, color: 'red' },
  { name: 'Apple Watch S9 45mm',    stock: 4,  min: 10, color: 'red' },
  { name: 'Xiaomi 14 Ultra',        stock: 7,  min: 10, color: 'amber' },
  { name: 'Sony WH-1000XM5',        stock: 5,  min: 10, color: 'red' },
  { name: 'DJI Mini 4 Pro',         stock: 8,  min: 10, color: 'amber' },
]

const QUICK_ACTIONS = [
  {
    id: 'revenueReport',
    label: 'Báo cáo doanh thu',
    desc: 'Xem biểu đồ & thống kê chi tiết',
    color: 'blue',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'customerManagement',
    label: 'Quản lý khách hàng',
    desc: 'Danh sách & phân hạng thành viên',
    color: 'purple',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Tồn kho',
    desc: 'Theo dõi & kiểm soát hàng hoá',
    color: 'amber',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'orderHistory',
    label: 'Lịch sử đơn hàng',
    desc: 'Tra cứu & xử lý đơn hàng',
    color: 'green',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'promotionSettings',
    label: 'Khuyến mãi',
    desc: 'Cài đặt mã giảm giá & ưu đãi',
    color: 'red',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    id: 'importStock',
    label: 'Nhập hàng',
    desc: 'Tạo & duyệt phiếu nhập kho',
    color: 'indigo',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
]

const QA_COLOR = {
  blue:   { bg: 'bg-orange-50',   icon: 'bg-[#E8420A]',   hover: 'hover:bg-orange-50',   text: 'text-[#C4350A]'   },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', hover: 'hover:bg-purple-100', text: 'text-purple-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-500',  hover: 'hover:bg-amber-100',  text: 'text-amber-700'  },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-500',  hover: 'hover:bg-green-100',  text: 'text-green-700'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-500',    hover: 'hover:bg-red-100',    text: 'text-red-700'    },
  indigo: { bg: 'bg-orange-50', icon: 'bg-[#0D0F14]', hover: 'hover:bg-orange-50', text: 'text-[#C4350A]' },
}

function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' tỷ'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr'
  return n.toLocaleString('vi-VN') + ' đ'
}

export default function ManagerDashboardPage() {
  const onNavigate = useNav()
  const [chartPeriod, setChartPeriod] = useState('year')

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <img
            src="https://placehold.co/34x34/f9a8d4/9d174d?text=AD"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-7 space-y-6">

        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}, Admin 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng quan hoạt động hôm nay — {now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất báo cáo
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          {KPI_CARDS.map((card, i) => {
            const c = COLOR_MAP[card.color]
            return (
              <div key={i} className="bg-white rounded border border-gray-200 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`w-9 h-9 rounded flex items-center justify-center text-white shrink-0 ${c.icon}`}>
                    {card.icon}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {card.change}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>
                    {card.value}<span className="text-base font-medium text-gray-400 ml-1">{card.unit}</span>
                  </p>
                </div>
                <p className="text-[11px] text-gray-400">So với hôm qua</p>
              </div>
            )
          })}
        </div>

        {/* Chart + Quick Actions */}
        <div className="grid grid-cols-[1fr_280px] gap-5">
          {/* Revenue Chart */}
          <div className="bg-white rounded border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Doanh thu theo tháng</h2>
                <p className="text-xs text-gray-400 mt-0.5">Năm 2024 · tỷ đồng</p>
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded">
                {['week', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${chartPeriod === p ? 'bg-white text-[#E8420A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                  </button>
                ))}
              </div>
            </div>
            <RevenueChart />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Truy cập nhanh</h2>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((qa) => {
                const c = QA_COLOR[qa.color]
                return (
                  <button
                    key={qa.id}
                    onClick={() => onNavigate(qa.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded transition-colors cursor-pointer text-center ${c.bg} ${c.hover}`}
                  >
                    <span className={`w-10 h-10 rounded flex items-center justify-center text-white ${c.icon}`}>
                      {qa.icon}
                    </span>
                    <span className={`text-[11px] font-semibold leading-tight ${c.text}`}>{qa.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders + Top Products + Low Stock */}
        <div className="grid grid-cols-[1fr_320px] gap-5">
          {/* Recent Orders */}
          <div className="bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Đơn hàng gần đây</h2>
              <button
                onClick={() => onNavigate('orderHistory')}
                className="text-sm text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {RECENT_ORDERS.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-gray-400">{order.id}</span>
                      <span className="text-xs text-gray-400">{order.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{order.product}</p>
                    <p className="text-xs text-gray-400 truncate">{order.customer}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-800">{fmt(order.total)}</p>
                    <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Top Products */}
            <div className="bg-white rounded border border-gray-200 p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">Sản phẩm bán chạy</h2>
                <span className="text-xs text-gray-400">Tháng này</span>
              </div>
              <div className="space-y-3">
                {TOP_PRODUCTS.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 truncate pr-2 max-w-[160px]">{p.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">{p.sold} đã bán</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E8420A] to-[#C4350A] rounded-full"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">Cảnh báo tồn kho</h2>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer"
                >
                  Xem kho →
                </button>
              </div>
              <div className="space-y-2.5">
                {LOW_STOCK.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.color === 'red' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <span className="text-xs text-gray-700 flex-1 truncate">{item.name}</span>
                    <span className={`text-xs font-bold ${item.color === 'red' ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
