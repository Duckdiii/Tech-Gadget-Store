import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import { useRevenueReport } from '../hooks/useRevenueReport'
import { resolveReportFilterRange, previousPeriodOf } from '../utils/dateRanges'

function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

function fmtDateVN(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

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

import { DonutChart, TrendBadge } from '../components/RevenueReportComponents'
import RevenueChart from '../components/RevenueChart'
import Skeleton from '../components/Skeleton'

const PERIOD_OPTIONS = [
  { value: 'DAILY', label: 'Hôm nay' },
  { value: 'WEEKLY', label: 'Tuần này' },
  { value: 'MONTHLY', label: 'Tháng này' },
  { value: 'CUSTOM', label: 'Tùy chỉnh' },
]

/** Deterministic pseudo-random bar heights (%) for the chart skeleton — varied but stable across re-renders. */
const CHART_SKELETON_HEIGHTS = [45, 70, 55, 85, 40, 65, 90, 50, 75, 60, 80, 48]

const DONUT_SEGMENT_COLORS = ['#E8420A', '#92400e', '#0ea5e9', '#8b5cf6', '#d1d5db']

/** Table columns shrink on small screens, then widen back to the original sizing at lg — the same breakpoint pattern used for the responsive fix on the Dashboard page. */
const PRODUCT_TABLE_COLS = 'grid-cols-[2.5rem_1fr_5.5rem_7rem] sm:grid-cols-[3rem_1fr_8rem_10rem] lg:grid-cols-[3rem_1fr_10rem_12rem]'

const BEST_SELLER_HEADERS = [
  { label: 'STT' },
  { label: 'TÊN SẢN PHẨM' },
  { label: 'SỐ LƯỢNG ĐÃ BÁN', sortKey: 'quantitySold' },
  { label: 'TỔNG DOANH THU', sortKey: 'revenue' },
]
const TOP_PROFIT_HEADERS = [
  { label: 'STT' },
  { label: 'TÊN SẢN PHẨM' },
  { label: 'SỐ LƯỢNG ĐÃ BÁN', sortKey: 'quantitySold' },
  { label: 'LỢI NHUẬN', sortKey: 'profit' },
]

function sortRows(rows, key, dir) {
  return rows.toSorted((a, b) => {
    const diff = (Number(a[key]) || 0) - (Number(b[key]) || 0)
    return dir === 'asc' ? diff : -diff
  })
}

function SortHeaderCell({ label, sortKey, activeSort, onSort }) {
  if (!sortKey) {
    return (
      <span className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left last:text-right">
        {label}
      </span>
    )
  }
  const isActive = activeSort.key === sortKey
  return (
    <button aria-label={`Sắp xếp theo ${label}`} type="button"
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-bold text-gray-400 tracking-wider uppercase text-left last:justify-end cursor-pointer hover:text-gray-600 transition-colors bg-transparent border-0 p-0"
    >
      {label}
      <span className={isActive ? 'text-[#E8420A]' : 'text-gray-300'}>
        {isActive && activeSort.dir === 'asc' ? '▲' : '▼'}
      </span>
    </button>
  )
}

function toggleSort(setSort, key) {
  setSort((s) => (s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }))
}

export default function RevenueReportPage() {
  const location = useLocation()
  const onNavigate = useNav()
  const { data, previousData, loading, filter, setFilter, handleExport } = useRevenueReport(location.state?.filter)
  const [chartMetric, setChartMetric] = useState('revenue')
  const [bestSellersSort, setBestSellersSort] = useState({ key: 'revenue', dir: 'desc' })
  const [topProfitSort, setTopProfitSort] = useState({ key: 'profit', dir: 'desc' })

  const handleProductClick = (productName) => {
    onNavigate('productManagement', { state: { searchKey: productName } })
  }

  // Date range the "so với kỳ trước" comparisons are actually measured against — null for an
  // incomplete CUSTOM range (mirrors useRevenueReport's own resolution so the label always
  // matches what previousData was really fetched for).
  const currentRange = resolveReportFilterRange(filter)
  const comparisonRange = currentRange ? previousPeriodOf(currentRange) : null
  const comparisonLabel = comparisonRange
    ? comparisonRange.startDate === comparisonRange.endDate
      ? fmtDateVN(comparisonRange.startDate)
      : `${fmtDateVN(comparisonRange.startDate)} – ${fmtDateVN(comparisonRange.endDate)}`
    : null

  const report = data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalQuantitySold: 0,
    trend: [],
    revenueByCategory: [],
    revenueByBrand: [],
    revenueByPaymentMethod: [],
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
      value: loading ? '...' : fmt(report.totalRevenue),
      trend: loading ? '…' : fmtGrowth(revenueGrowth),
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
      value: loading ? '...' : report.totalOrders.toLocaleString(),
      trend: loading ? '…' : fmtGrowth(ordersGrowth),
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
      value: loading ? '...' : fmt(avgOrderValue),
      trend: loading ? '…' : fmtGrowth(avgOrderGrowth),
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
      value: loading ? '...' : report.totalQuantitySold.toLocaleString('vi-VN'),
      trend: loading ? '…' : fmtGrowth(quantityGrowth),
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
      value: loading ? '...' : `${(report.cancellationRate || 0).toFixed(1)}%`,
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

  // Payment method donut segments
  const totalPaymentRevenue = (report.revenueByPaymentMethod || []).reduce((s, p) => s + (p.revenue || 0), 0)
  const paymentSegments = (report.revenueByPaymentMethod || []).map((p, i) => ({
    pct: totalPaymentRevenue > 0 ? (p.revenue || 0) / totalPaymentRevenue : 0,
    color: DONUT_SEGMENT_COLORS[i] || DONUT_SEGMENT_COLORS[DONUT_SEGMENT_COLORS.length - 1],
    label: p.paymentMethodName,
  }))

  // Brand revenue bars, sorted highest first
  const sortedBrands = (report.revenueByBrand || []).toSorted((a, b) => (b.revenue || 0) - (a.revenue || 0))
  const maxBrandRevenue = Math.max(...sortedBrands.map((b) => Number(b.revenue) || 0), 0)

  const sortedBestSellers = sortRows(report.topSellingProducts, bestSellersSort.key, bestSellersSort.dir)
  const sortedTopProfit = sortRows(report.topProfitProducts, topProfitSort.key, topProfitSort.dir)

  return (
    <div className="flex-1 flex flex-col min-h-dvh bg-gray-50 text-gray-800">
      {/* Page content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo doanh thu</h1>
          <div className="flex items-center gap-3">
            <button aria-label="Xuất báo cáo CSV" type="button" onClick={handleExport} className="flex items-center gap-2 bg-[#0D0F14] hover:bg-slate-900 text-white font-semibold py-2 px-5 rounded text-sm transition-colors cursor-pointer border-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất báo cáo CSV
            </button>
          </div>
        </div>

        {/* Period & Metric selector */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Metric Selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded border border-gray-200/50">
            <button aria-label="Xem theo Doanh thu" type="button"
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${chartMetric === 'revenue' ? 'bg-white text-[#E8420A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Doanh thu
            </button>
            <button aria-label="Xem theo Số đơn hàng" type="button"
              onClick={() => setChartMetric('orders')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${chartMetric === 'orders' ? 'bg-white text-[#E8420A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Số đơn hàng
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded">
            {PERIOD_OPTIONS.map((opt) => (
              <button aria-label={`Lọc theo ${opt.label}`} type="button"
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
                aria-label="Từ ngày"
                className="border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700"
              />
              <span className="text-xs text-gray-400">đến</span>
              <input
                type="date"
                value={filter.endDate || ''}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                aria-label="Đến ngày"
                className="border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700"
              />
            </div>
          )}
        </div>

        {comparisonLabel && (
          <p className="text-xs text-gray-400 -mt-4">
            Các chỉ số "so với kỳ trước" được so sánh với: <span className="font-medium text-gray-500">{comparisonLabel}</span>
          </p>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded border border-gray-200 px-5 py-5">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-9 h-9" />
                </div>
                <Skeleton className="w-24 h-7 mb-3" />
                <Skeleton className="w-28 h-3" />
              </div>
            ))
          ) : (
            kpis.map((card) => (
              <div key={card.label} className="bg-white rounded border border-gray-200 px-5 py-5">
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
            ))
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Area Chart */}
          <div className="bg-white rounded border border-gray-200 px-5 py-5 min-h-[240px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">
                {chartMetric === 'revenue' ? 'Xu hướng doanh thu' : 'Xu hướng đơn hàng'}
              </h2>
            </div>
            {loading ? (
              <div className="flex-1 flex items-end gap-2 h-[190px]">
                {CHART_SKELETON_HEIGHTS.map((h, i) => (
                  // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                  <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <RevenueChart data={report.trend} metric={chartMetric} />
            )}
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded border border-gray-200 px-5 py-5 flex flex-col min-h-[240px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 leading-tight">
                Doanh thu theo danh mục
              </h2>
            </div>

            <div className="flex-1 flex items-center justify-center py-2">
              {loading ? (
                <Skeleton className="w-[170px] h-[170px] rounded-full" />
              ) : segments.length > 0 ? (
                <DonutChart segments={segments} />
              ) : (
                <p className="text-xs text-gray-400">Không có dữ liệu phân mục</p>
              )}
            </div>

            {/* Legend */}
            {loading ? (
              <div className="space-y-2.5 mt-2">
                {/* react-doctor-disable-next-line react-doctor/no-array-index-as-key */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-8 h-3" />
                  </div>
                ))}
              </div>
            ) : segments.length > 0 && (
              <div className="space-y-2.5 mt-2">
                {segments.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{Math.round(item.pct * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand & Payment method breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Revenue by Brand */}
          <div className="bg-white rounded border border-gray-200 px-5 py-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Doanh thu theo thương hiệu</h2>
            <div className="space-y-3">
              {loading ? (
                /* react-doctor-disable-next-line react-doctor/no-array-index-as-key */
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <Skeleton className="w-24 h-3" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                    <Skeleton className="w-full h-1.5 rounded-full" />
                  </div>
                ))
              ) : sortedBrands.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Không có dữ liệu thương hiệu</p>
              ) : (
                sortedBrands.map((b) => {
                  const pct = maxBrandRevenue > 0 ? Math.round((Number(b.revenue) / maxBrandRevenue) * 100) : 0
                  return (
                    <div key={b.brandId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate pr-2">{b.brandName}</span>
                        <span className="text-sm text-gray-500 shrink-0">{fmt(b.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#E8420A] to-[#C4350A] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Revenue by Payment Method */}
          <div className="bg-white rounded border border-gray-200 px-5 py-5 flex flex-col min-h-[240px]">
            <h2 className="text-base font-bold text-gray-800 mb-4 leading-tight">Phương thức thanh toán</h2>

            <div className="flex-1 flex items-center justify-center py-2">
              {loading ? (
                <Skeleton className="w-[170px] h-[170px] rounded-full" />
              ) : paymentSegments.length > 0 ? (
                <DonutChart segments={paymentSegments} />
              ) : (
                <p className="text-xs text-gray-400">Không có dữ liệu thanh toán</p>
              )}
            </div>

            {loading ? (
              <div className="space-y-2.5 mt-2">
                {/* react-doctor-disable-next-line react-doctor/no-array-index-as-key */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-8 h-3" />
                  </div>
                ))}
              </div>
            ) : paymentSegments.length > 0 && (
              <div className="space-y-2.5 mt-2">
                {paymentSegments.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{Math.round(item.pct * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Sản phẩm bán chạy nhất</h2>
          </div>

          {/* Table header */}
          <div className={`grid ${PRODUCT_TABLE_COLS} gap-2 sm:gap-3 px-5 py-3 border-b border-gray-100`}>
            {BEST_SELLER_HEADERS.map((h) => (
              <SortHeaderCell
                key={h.label}
                label={h.label}
                sortKey={h.sortKey}
                activeSort={bestSellersSort}
                onSort={(key) => toggleSort(setBestSellersSort, key)}
              />
            ))}
          </div>

          {/* Table rows */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={_?.id ?? _?.code ?? _?.name ?? i} className={`grid ${PRODUCT_TABLE_COLS} gap-2 sm:gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center`}>
                <Skeleton className="w-5 h-3" />
                <Skeleton className="w-32 h-3" />
                <Skeleton className="w-8 h-3" />
                <Skeleton className="w-16 h-3 ml-auto" />
              </div>
            ))
          ) : sortedBestSellers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Không có dữ liệu sản phẩm</div>
          ) : (
            sortedBestSellers.map((row, idx) => (
              <div
                key={row.productId}
                role="button"
                tabIndex={0}
                aria-label={`Xem sản phẩm ${row.productName}`}
                onClick={() => handleProductClick(row.productName)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleProductClick(row.productName) }}
                className={`grid ${PRODUCT_TABLE_COLS} gap-2 sm:gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center text-left cursor-pointer hover:bg-gray-50 transition-colors`}
              >
                <span className="text-sm text-gray-500 font-medium">{idx + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate hover:text-[#E8420A]">{row.productName}</span>
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
          <div className={`grid ${PRODUCT_TABLE_COLS} gap-2 sm:gap-3 px-5 py-3 border-b border-gray-100`}>
            {TOP_PROFIT_HEADERS.map((h) => (
              <SortHeaderCell
                key={h.label}
                label={h.label}
                sortKey={h.sortKey}
                activeSort={topProfitSort}
                onSort={(key) => toggleSort(setTopProfitSort, key)}
              />
            ))}
          </div>

          {/* Table rows */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={_?.id ?? _?.code ?? _?.name ?? i} className={`grid ${PRODUCT_TABLE_COLS} gap-2 sm:gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center`}>
                <Skeleton className="w-5 h-3" />
                <Skeleton className="w-32 h-3" />
                <Skeleton className="w-8 h-3" />
                <Skeleton className="w-16 h-3 ml-auto" />
              </div>
            ))
          ) : sortedTopProfit.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Chưa có dữ liệu giá vốn (nhập kho) để tính lợi nhuận
            </div>
          ) : (
            sortedTopProfit.map((row, idx) => (
              <div
                key={row.productId}
                role="button"
                tabIndex={0}
                aria-label={`Xem sản phẩm ${row.productName}`}
                onClick={() => handleProductClick(row.productName)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleProductClick(row.productName) }}
                className={`grid ${PRODUCT_TABLE_COLS} gap-2 sm:gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 items-center text-left cursor-pointer hover:bg-gray-50 transition-colors`}
              >
                <span className="text-sm text-gray-500 font-medium">{idx + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate hover:text-[#E8420A]">{row.productName}</span>
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
