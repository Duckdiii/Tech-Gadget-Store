import { useState, useEffect } from 'react'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'
import { getToken } from '../context/AuthContext'

function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

/* ── Area Chart ── */
const CW = 560, CH = 190, CPAD_B = 40

function catmullPath(pts) {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
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

function AreaChart({ trend }) {
  const maxRevenue = Math.max(...trend.map(t => t.revenue || 0), 1)
  const pts = trend.map((d, i) => {
    const val = maxRevenue > 0 ? (d.revenue || 0) / maxRevenue : 0
    return {
      x: trend.length > 1 ? (i / (trend.length - 1)) * CW : CW / 2,
      y: 8 + CH * (1 - val),
      label: d.label,
    }
  })

  if (pts.length === 0) {
    return <p className="text-sm text-gray-400 py-10 text-center">Không có dữ liệu xu hướng</p>
  }

  const linePath = catmullPath(pts)
  const areaPath = trend.length > 1 ? `${linePath} L ${CW} ${CH + 8} L 0 ${CH + 8} Z` : ''
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
      {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

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

function DonutChart({ segments }) {
  let angle = -Math.PI / 2
  const paths = segments.map((seg) => {
    const endAngle = angle + (seg.pct || 0) * 2 * Math.PI
    const d = segPath(angle, endAngle - 0.01)
    angle = endAngle
    return { ...seg, d }
  })

  const majorSeg = segments[0] || { label: 'Trống', pct: 0 }

  return (
    <svg viewBox="0 0 180 180" width="170" height="170" className="mx-auto">
      {paths.map((seg, i) => (
        <path key={i} d={seg.d} fill={seg.color} />
      ))}
      <text x={DONUT_CX} y={DONUT_CY - 5} textAnchor="middle" fontSize="21" fontWeight="bold" fill="#111827" fontFamily="system-ui,sans-serif">{Math.round(majorSeg.pct * 100)}%</text>
      <text x={DONUT_CX} y={DONUT_CY + 16} textAnchor="middle" fontSize="10.5" fill="#6b7280" fontFamily="system-ui,sans-serif" className="truncate max-w-[100px]">{majorSeg.label}</text>
    </svg>
  )
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
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/manager/revenue-report')
      setData(res)
    } catch (e) {
      console.error("Lỗi tải báo cáo doanh thu:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleExport = async () => {
    try {
      const token = getToken()
      const res = await fetch('/api/manager/revenue-report/export', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error("Lỗi xuất báo cáo")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `revenue_report.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      alert("Lỗi xuất file báo cáo: " + e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  const report = data || {
    totalRevenue: 0,
    totalOrders: 0,
    trend: [],
    revenueByCategory: [],
    topSellingProducts: []
  }

  const kpis = [
    {
      label: 'TỔNG DOANH THU',
      value: fmt(report.totalRevenue),
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
      value: report.totalOrders.toLocaleString(),
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
      value: report.totalOrders > 0 ? fmt(report.totalRevenue / report.totalOrders) : '0 đ',
      trend: '+3%',
      trendExtra: '',
      trendUp: true,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'SẢN PHẨM ĐÃ BÁN',
      value: report.topSellingProducts.length.toString(),
      trend: '+15%',
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

  // Parse segments for Donut chart
  const totalCatRevenue = report.revenueByCategory.reduce((s, c) => s + (c.revenue || 0), 0)
  const segments = report.revenueByCategory.map((c, i) => {
    const pct = totalCatRevenue > 0 ? (c.revenue || 0) / totalCatRevenue : 0
    return {
      pct: pct,
      color: i === 0 ? '#E8420A' : i === 1 ? '#92400e' : '#d1d5db',
      label: c.categoryName
    }
  })

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <StoreNavbar />

      {/* Page content */}
      <div className="flex-1 px-8 py-7 space-y-6">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo doanh thu</h1>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 bg-[#0D0F14] hover:bg-slate-900 text-white font-semibold py-2 px-5 rounded text-sm transition-colors cursor-pointer border-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất báo cáo CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5">
          {kpis.map((card, i) => (
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
            </div>
            <AreaChart trend={report.trend} />
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded border border-gray-200 px-5 py-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 leading-tight">
                Doanh thu theo danh mục
              </h2>
            </div>

            <div className="flex-1 flex items-center justify-center py-2">
              {segments.length > 0 ? (
                <DonutChart segments={segments} />
              ) : (
                <p className="text-xs text-gray-400">Không có dữ liệu phân mục</p>
              )}
            </div>

            {/* Legend */}
            <div className="space-y-2.5 mt-2">
              {segments.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{Math.round(item.pct * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Sản phẩm bán chạy nhất</h2>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_10rem_12rem] gap-3 px-5 py-3 border-b border-gray-100">
            {['STT', 'TÊN SẢN PHẨM', 'SỐ LƯỢNG ĐÃ BÁN', 'TỔNG DOANH THU'].map((h) => (
              <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left last:text-right">
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {report.topSellingProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Không có dữ liệu sản phẩm</div>
          ) : (
            report.topSellingProducts.map((row, idx) => (
              <div key={row.productId} className="grid grid-cols-[3rem_1fr_10rem_12rem] gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center text-left">
                <span className="text-sm text-gray-500 font-medium">{idx + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">{row.productName}</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">{row.quantitySold}</span>
                <span className="text-sm font-bold text-[#E8420A] text-right">
                  {fmt(row.revenue)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
