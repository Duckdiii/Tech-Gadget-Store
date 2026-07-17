import { useRevenueReport } from '../hooks/useRevenueReport'

function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

/** null = no baseline to compare against (previous period was 0) — rendered as "Mới" instead of a misleading +∞%. undefined = previous-period data not available yet. */
function pctGrowth(current, previous) {
  if (previous === null || previous === undefined) return undefined
  const c = Number(current) || 0
  const p = Number(previous) || 0
  if (p === 0) return c === 0 ? 0 : null
  return ((c - p) / p) * 100
}

function fmtGrowth(growth) {
  if (growth === undefined) return '…'
  if (growth === null) return 'Mới'
  const rounded = Math.round(growth * 10) / 10
  return `${rounded >= 0 ? '+' : ''}${rounded}%`
}

import { AreaChart, DonutChart, TrendBadge } from '../components/RevenueReportComponents'

const PERIOD_OPTIONS = [
  { value: 'DAILY', label: 'Hôm nay' },
  { value: 'WEEKLY', label: 'Tuần này' },
  { value: 'MONTHLY', label: 'Tháng này' },
  { value: 'CUSTOM', label: 'Tùy chỉnh' },
]

export default function RevenueReportPage() {
  const { data, previousData, loading, filter, setFilter, handleExport } = useRevenueReport()

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  const report = data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalQuantitySold: 0,
    trend: [],
    revenueByCategory: [],
    topSellingProducts: [],
    topProfitProducts: [],
    cancellationRate: 0,
  }

  const handlePeriodChange = (period) => {
    setFilter(period === 'CUSTOM' ? { ...filter, period } : { period })
  }

  const handleCustomDateChange = (key, value) => {
    setFilter((f) => ({ ...f, period: 'CUSTOM', [key]: value }))
  }

  const avgOrderValue = report.totalOrders > 0 ? report.totalRevenue / report.totalOrders : 0
  const prevAvgOrderValue = previousData
    ? (previousData.totalOrders > 0 ? previousData.totalRevenue / previousData.totalOrders : 0)
    : undefined

  const revenueGrowth = pctGrowth(report.totalRevenue, previousData?.totalRevenue)
  const ordersGrowth = pctGrowth(report.totalOrders, previousData?.totalOrders)
  const avgOrderGrowth = pctGrowth(avgOrderValue, prevAvgOrderValue)
  const quantityGrowth = pctGrowth(report.totalQuantitySold, previousData?.totalQuantitySold)

  const kpis = [
    {
      label: 'TỔNG DOANH THU',
      value: fmt(report.totalRevenue),
      trend: fmtGrowth(revenueGrowth),
      trendExtra: ' so với kỳ trước',
      trendUp: (revenueGrowth ?? 0) >= 0,
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
      trend: fmtGrowth(ordersGrowth),
      trendExtra: ' so với kỳ trước',
      trendUp: (ordersGrowth ?? 0) >= 0,
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
      value: fmt(avgOrderValue),
      trend: fmtGrowth(avgOrderGrowth),
      trendExtra: ' so với kỳ trước',
      trendUp: (avgOrderGrowth ?? 0) >= 0,
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
      value: report.totalQuantitySold.toLocaleString('vi-VN'),
      trend: fmtGrowth(quantityGrowth),
      trendExtra: ' so với kỳ trước',
      trendUp: (quantityGrowth ?? 0) >= 0,
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#E8420A]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: 'TỶ LỆ HỦY ĐƠN',
      value: `${(report.cancellationRate || 0).toFixed(1)}%`,
      caption: 'Đơn bị hủy hoặc hoàn tiền',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

        {/* Period selector */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePeriodChange(opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${filter.period === opt.value ? 'bg-white text-[#E8420A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {filter.period === 'CUSTOM' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filter.startDate || ''}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700"
              />
              <span className="text-xs text-gray-400">đến</span>
              <input
                type="date"
                value={filter.endDate || ''}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700"
              />
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-5">
          {kpis.map((card, i) => (
            <div key={i} className="bg-white rounded border border-gray-200 px-5 py-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 tracking-wider">{card.label}</span>
                <span className={`w-9 h-9 flex items-center justify-center rounded ${card.iconBg} ${card.iconColor}`}>
                  {card.icon}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 leading-tight mb-3">{card.value}</p>
              {card.caption ? (
                <p className="text-[11px] text-gray-400">{card.caption}</p>
              ) : (
                <TrendBadge trend={card.trend} trendExtra={card.trendExtra} trendUp={card.trendUp} />
              )}
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

        {/* Top Profit Products */}
        <div className="bg-white rounded border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Sản phẩm lợi nhuận cao nhất</h2>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_10rem_12rem] gap-3 px-5 py-3 border-b border-gray-100">
            {['STT', 'TÊN SẢN PHẨM', 'SỐ LƯỢNG ĐÃ BÁN', 'LỢI NHUẬN'].map((h) => (
              <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left last:text-right">
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {report.topProfitProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Chưa có dữ liệu giá vốn (nhập kho) để tính lợi nhuận
            </div>
          ) : (
            report.topProfitProducts.map((row, idx) => (
              <div key={row.productId} className="grid grid-cols-[3rem_1fr_10rem_12rem] gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center text-left">
                <span className="text-sm text-gray-500 font-medium">{idx + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">{row.productName}</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">{row.quantitySold}</span>
                <span className="text-sm font-bold text-[#E8420A] text-right">
                  {fmt(row.profit)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
