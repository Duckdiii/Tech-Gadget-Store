import { useState, useEffect, useRef, useCallback } from 'react'
import { useNav } from '../../../hooks/useNav'
import { useLowStockProducts } from '../../../hooks/useLowStockProducts'
import { useAuth } from '../../../context/useAuth'
import { useManagerDashboard } from '../hooks/useManagerDashboard'
import { useHeaderNotifications } from '../hooks/useHeaderNotifications'
import RevenueChart from '../components/RevenueChart'
import axiosClient from '../../../config/axiosClient'
import { managerUsersService } from '../../manager-users/services/managerUsersService'
import { managerOrderService } from '../../manager-orders/services/managerOrderService'

/* ── Static presentation data (icons/colors — not business data) ── */
const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-500',   text: 'text-blue-600'   },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-600' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-500',  text: 'text-green-600'  },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-500',    text: 'text-red-600'    },
}

const KPI_ICONS = {
  revenueToday: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  revenueMonth: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  ordersToday: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  newCustomers: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  lowStock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
}

const STATUS_META = {
  AWAITING_CONFIRMATION: { label: 'Chờ xác nhận',   className: 'bg-amber-100 text-amber-700' },
  PROCESSING:            { label: 'Đang xử lý',      className: 'bg-blue-100 text-blue-700'   },
  SHIPPING:              { label: 'Đang giao',       className: 'bg-orange-50 text-[#C4350A]' },
  COMPLETED:             { label: 'Đã hoàn thành',   className: 'bg-green-100 text-green-700' },
  CANCELLED:             { label: 'Đã hủy',          className: 'bg-red-100 text-red-600'     },
  REFUNDED:              { label: 'Đã hoàn tiền',    className: 'bg-red-50 text-red-500'      },
}

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
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-500',   hover: 'hover:bg-blue-100',   text: 'text-blue-700'   },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', hover: 'hover:bg-purple-100', text: 'text-purple-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-500',  hover: 'hover:bg-amber-100',  text: 'text-amber-700'  },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-500',  hover: 'hover:bg-green-100',  text: 'text-green-700'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-500',    hover: 'hover:bg-red-100',    text: 'text-red-700'    },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', hover: 'hover:bg-indigo-100', text: 'text-indigo-700' },
}

const PERIOD_LABEL = { week: 'Tuần này', month: 'Tháng này', year: `Năm ${new Date().getFullYear()}` }
const PERIOD_TITLE = { week: 'Doanh thu theo tuần', month: 'Doanh thu theo tháng', year: 'Doanh thu theo năm' }
const PERIOD_METRIC_NOUN = { week: 'tuần', month: 'tháng', year: 'năm', custom: 'khoảng tùy chỉnh' }

function fmtDateVN(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + ' tỷ'
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1) + ' tr'
  return num.toLocaleString('vi-VN') + ' đ'
}

/** Splits a money amount into {value, unit} so KPI cards can style the unit smaller/greyer than the number. */
function fmtSplit(n) {
  const num = Number(n) || 0
  if (num >= 1_000_000_000) return { value: (num / 1_000_000_000).toFixed(2), unit: 'tỷ' }
  if (num >= 1_000_000)     return { value: (num / 1_000_000).toFixed(1), unit: 'tr' }
  return { value: num.toLocaleString('vi-VN'), unit: 'đ' }
}

/** null = no baseline to compare against (previous period was 0) — shown as "Mới" rather than a misleading +∞%. */
function fmtPct(growth) {
  if (growth === null || growth === undefined) return 'Mới'
  const rounded = Math.round(growth * 10) / 10
  return `${rounded >= 0 ? '+' : ''}${rounded}%`
}

function fmtDelta(n) {
  const v = Number(n) || 0
  return `${v >= 0 ? '+' : ''}${v.toLocaleString('vi-VN')}`
}

function initialsOf(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return 'QL'
  return trimmed.split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase()
}

function Skeleton({ className = '', style }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
}

/** Deterministic pseudo-random bar heights (%) for the chart skeleton — varied but stable across re-renders. */
const CHART_SKELETON_HEIGHTS = [45, 70, 55, 85, 40, 65, 90, 50, 75, 60, 80, 48]

export default function ManagerDashboardPage() {
  const onNavigate = useNav()
  const { user } = useAuth()
  const { items: lowStockItems, totalCount: lowStockCount, threshold: lowStockThreshold, loading: lowStockLoading, refetch: refetchLowStock } = useLowStockProducts(5)
  const {
    kpis,
    chartPeriod, setChartPeriod,
    customRange, setCustomRange, chartFilterReady,
    trend, topProducts, chartLoading,
    recentOrders, ordersLoading,
    ordersLoadingMore, ordersHasNext, loadMoreOrders,
    pendingOrdersCount,
    handleExport, exporting,
    reload,
    lastUpdated,
  } = useManagerDashboard()
  const { notifications, unreadCount, loading: notifLoading, markAllRead, markRead } = useHeaderNotifications()

  const [searchTerm, setSearchTerm] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [cmdSearch, setCmdSearch] = useState('')
  const [chartMetric, setChartMetric] = useState('revenue')
  const [searchResults, setSearchResults] = useState({ products: [], customers: [], navs: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const commandInputRef = useRef(null)

  const [refreshing, setRefreshing] = useState(false)

  const handleRefreshAll = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.allSettled([
        reload(),
        refetchLowStock()
      ])
    } finally {
      setRefreshing(false)
    }
  }, [reload, refetchLowStock])

  const handleKpiClick = useCallback((key) => {
    switch (key) {
      case 'revenueToday':
        onNavigate('revenueReport', { state: { filter: { period: 'DAILY' } } })
        break
      case 'revenueMonth':
        onNavigate('revenueReport', { state: { filter: { period: 'MONTHLY' } } })
        break
      case 'ordersToday':
        onNavigate('orderHistory')
        break
      case 'newCustomers':
        onNavigate('customerManagement')
        break
      case 'lowStock':
        onNavigate('inventory')
        break
      default:
        break
    }
  }, [onNavigate])

  const handleUpdateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await managerOrderService.updateOrderStatus(orderId, newStatus)
      await handleRefreshAll()
    } catch (e) {
      alert('Không thể cập nhật trạng thái đơn hàng: ' + e.message)
    }
  }, [handleRefreshAll])

  // Auto-refresh every 60 seconds — silent so the charts/tables don't blank out mid-view
  useEffect(() => {
    const interval = setInterval(() => {
      reload({ silent: true })
      refetchLowStock()
    }, 60000)
    return () => clearInterval(interval)
  }, [reload, refetchLowStock])

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandMenuOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus command palette input when opened
  useEffect(() => {
    if (commandMenuOpen && commandInputRef.current) {
      setTimeout(() => {
        commandInputRef.current.focus()
      }, 50)
    } else {
      setCmdSearch('')
      setSearchResults({ products: [], customers: [], navs: [] })
    }
  }, [commandMenuOpen])

  // Debounced global search
  useEffect(() => {
    if (!cmdSearch.trim()) {
      setSearchResults({ products: [], customers: [], navs: [] })
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const q = cmdSearch.trim()
        
        // 1. Filter local nav links
        const matchedNavs = QUICK_ACTIONS.filter(act => 
          act.label.toLowerCase().includes(q.toLowerCase()) || 
          act.desc.toLowerCase().includes(q.toLowerCase())
        )

        // 2. Fetch products and customers in parallel
        const [prodRes, custRes] = await Promise.allSettled([
          axiosClient.get('/api/products/filter', { params: { keyword: q, size: 5 } }),
          managerUsersService.getCustomers({ search: q, size: 5 })
        ])

        const products = prodRes.status === 'fulfilled' ? (prodRes.value.items || []) : []
        const customers = custRes.status === 'fulfilled' ? (custRes.value.items || []) : []

        setSearchResults({
          navs: matchedNavs,
          products,
          customers
        })
      } catch (err) {
        console.error('Failed to search globally:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [cmdSearch])

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const periodLabel = chartPeriod === 'custom'
    ? (customRange.startDate && customRange.endDate
        ? `${fmtDateVN(customRange.startDate)} - ${fmtDateVN(customRange.endDate)}`
        : 'Chọn khoảng ngày')
    : PERIOD_LABEL[chartPeriod]
  const periodTitle = chartPeriod === 'custom' ? 'Doanh thu theo khoảng tùy chỉnh' : PERIOD_TITLE[chartPeriod]

  const kpiCards = [
    {
      key: 'revenueToday',
      label: 'Doanh thu hôm nay',
      ...fmtSplit(kpis?.revenueToday ?? 0),
      change: kpis ? fmtPct(kpis.revenueTodayGrowth) : '…',
      up: kpis ? (kpis.revenueTodayGrowth ?? 0) >= 0 : true,
      caption: 'So với hôm qua',
      color: 'blue',
      isLoading: !kpis,
    },
    {
      key: 'revenueMonth',
      label: 'Doanh thu tháng này',
      ...fmtSplit(kpis?.revenueMonth ?? 0),
      change: kpis ? fmtPct(kpis.revenueMonthGrowth) : '…',
      up: kpis ? (kpis.revenueMonthGrowth ?? 0) >= 0 : true,
      caption: 'So với cùng kỳ tháng trước',
      color: 'indigo',
      isLoading: !kpis,
    },
    {
      key: 'ordersToday',
      label: 'Đơn hàng mới hôm nay',
      value: kpis ? kpis.ordersToday.toLocaleString('vi-VN') : '…',
      unit: '',
      change: kpis ? fmtDelta(kpis.ordersTodayDelta) : '…',
      up: kpis ? kpis.ordersTodayDelta >= 0 : true,
      caption: 'So với hôm qua',
      color: 'green',
      isLoading: !kpis,
    },
    {
      key: 'newCustomers',
      label: 'Khách hàng mới hôm nay',
      value: kpis ? kpis.newCustomersToday.toLocaleString('vi-VN') : '…',
      unit: '',
      change: kpis ? fmtDelta(kpis.newCustomersDelta) : '…',
      up: kpis ? kpis.newCustomersDelta >= 0 : true,
      caption: 'So với hôm qua',
      color: 'purple',
      isLoading: !kpis,
    },
    {
      key: 'lowStock',
      label: 'Cảnh báo tồn kho',
      value: lowStockLoading ? '…' : lowStockCount,
      unit: 'SKU',
      isLowStockCard: true,
      caption: `Ngưỡng cảnh báo: ${lowStockThreshold}`,
      color: 'red',
      isLoading: lowStockLoading,
    },
  ]

  const filteredOrders = searchTerm.trim()
    ? recentOrders.filter((o) => {
        const q = searchTerm.trim().toLowerCase()
        return o.id.toLowerCase().includes(q) || (o.customerName || '').toLowerCase().includes(q)
      })
    : recentOrders

  const maxTopRevenue = Math.max(...topProducts.map((p) => Number(p.revenue) || 0), 0)

  const closeMenus = () => { setNotifOpen(false); setAvatarOpen(false) }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <button
            onClick={() => setCommandMenuOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-gray-100 border-0 rounded text-sm text-gray-400 hover:bg-gray-200/50 transition-all text-left cursor-pointer focus:outline-none"
          >
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 truncate">Tìm kiếm nhanh hoặc điều hướng...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded shadow-sm">
              Ctrl K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative z-20">
            <button
              onClick={() => { setNotifOpen((o) => !o); setAvatarOpen(false) }}
              className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-20 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-800">
                    Thông báo{unreadCount > 0 ? ` (${unreadCount})` : ''}
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer">
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-50">
                  {notifLoading ? (
                    <p className="text-xs text-gray-400 text-center py-6">Đang tải...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">Không có thông báo nào.</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.readAt ? 'bg-orange-50/40' : ''}`}
                      >
                        <p className={`text-xs ${!n.readAt ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{n.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative z-20">
            <button
              onClick={() => { setAvatarOpen((o) => !o); setNotifOpen(false) }}
              className="w-8 h-8 rounded-full bg-[#E8420A] text-white text-xs font-bold flex items-center justify-center cursor-pointer"
            >
              {initialsOf(user?.name)}
            </button>
            {avatarOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Quản lý'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

        {(notifOpen || avatarOpen) && (
          <div className="fixed inset-0 z-10" onClick={closeMenus} />
        )}
      </header>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-7 space-y-6">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.name || 'Quản lý'} 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng quan hoạt động hôm nay — {now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdated && (
              <span className="text-xs text-gray-400 mr-1">
                Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-3.5 rounded text-sm transition-all cursor-pointer"
              title="Làm mới dữ liệu tức thì"
            >
              <svg className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
              </svg>
              {refreshing ? 'Đang làm mới...' : 'Làm mới'}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !chartFilterReady}
              className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-4 rounded text-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? 'Đang xuất...' : `Xuất báo cáo (${periodLabel})`}
            </button>
          </div>
        </div>

        {/* Pending confirmation alert */}
        {pendingOrdersCount > 0 && (
          <button
            onClick={() => onNavigate('orderHistory', { state: { filter: 'AWAITING_CONFIRMATION' } })}
            className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded px-4 py-3 text-left cursor-pointer transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center shrink-0 font-bold text-sm">
              {pendingOrdersCount}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {pendingOrdersCount} đơn hàng đang chờ xác nhận
              </p>
              <p className="text-xs text-amber-600">Bấm để xem và xử lý ngay</p>
            </div>
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpiCards.map((card) => {
            const c = COLOR_MAP[card.color]
            if (card.isLoading) {
              return (
                <div key={card.key} className="bg-white rounded border border-gray-200 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-9 h-9" />
                    <Skeleton className="w-10 h-4 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-16 h-6" />
                  </div>
                  <Skeleton className="w-28 h-3" />
                </div>
              )
            }
            return (
              <button
                key={card.key}
                onClick={() => handleKpiClick(card.key)}
                className="bg-white rounded border border-gray-200 p-5 flex flex-col gap-3 text-left cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`w-9 h-9 rounded flex items-center justify-center text-white shrink-0 ${c.icon}`}>
                    {KPI_ICONS[card.key]}
                  </span>
                  {!card.isLowStockCard && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {card.change}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>
                    {card.value}<span className="text-base font-medium text-gray-400 ml-1">{card.unit}</span>
                  </p>
                </div>
                <p className="text-[11px] text-gray-400">{card.caption}</p>
              </button>
            )
          })}
        </div>

        {/* Chart + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Revenue Chart */}
          <div className="bg-white rounded border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  {chartMetric === 'revenue' ? periodTitle : `Đơn hàng theo ${PERIOD_METRIC_NOUN[chartPeriod]}`}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{periodLabel} · di chuột để xem chi tiết</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Metric Selector */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded border border-gray-200/50">
                  <button
                    onClick={() => setChartMetric('revenue')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${chartMetric === 'revenue' ? 'bg-white text-[#E8420A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Doanh thu
                  </button>
                  <button
                    onClick={() => setChartMetric('orders')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${chartMetric === 'orders' ? 'bg-white text-[#E8420A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Số đơn hàng
                  </button>
                </div>
                {/* Period Selector */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded">
                  {['week', 'month', 'year', 'custom'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${chartPeriod === p ? 'bg-white text-[#E8420A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : p === 'year' ? 'Năm' : 'Tuỳ chỉnh'}
                    </button>
                  ))}
                </div>
                {chartPeriod === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customRange.startDate}
                      onChange={(e) => setCustomRange((r) => ({ ...r, startDate: e.target.value }))}
                      className="border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700"
                    />
                    <span className="text-xs text-gray-400">đến</span>
                    <input
                      type="date"
                      value={customRange.endDate}
                      onChange={(e) => setCustomRange((r) => ({ ...r, endDate: e.target.value }))}
                      className="border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>
            {chartPeriod === 'custom' && !chartFilterReady ? (
              <div className="w-full h-[180px] flex items-center justify-center text-sm text-gray-400">Chọn khoảng ngày để xem biểu đồ</div>
            ) : chartLoading ? (
              <div className="w-full h-[180px] flex items-end gap-2">
                {CHART_SKELETON_HEIGHTS.map((h, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <RevenueChart data={trend} metric={chartMetric} />
            )}
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Recent Orders */}
          <div className="bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
              <h2 className="text-base font-semibold text-gray-800 shrink-0">Đơn hàng gần đây</h2>
              <div className="flex-1 max-w-xs relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Lọc theo mã hoặc khách hàng..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E8420A] focus:border-[#E8420A]"
                />
              </div>
              <button
                onClick={() => onNavigate('orderHistory')}
                className="text-sm text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer shrink-0"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="w-32 h-3" />
                      <Skeleton className="w-48 h-3.5" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <Skeleton className="w-16 h-3.5" />
                      <Skeleton className="w-14 h-4 rounded-full" />
                    </div>
                  </div>
                ))
              ) : filteredOrders.length === 0 ? (
                <p className="px-6 py-8 text-xs text-gray-400 text-center">
                  {searchTerm ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                </p>
              ) : (
                filteredOrders.map((order) => {
                  const meta = STATUS_META[order.orderStatus] || STATUS_META.AWAITING_CONFIRMATION
                  const productSummary = (order.items || [])
                    .map((it) => `${it.productName}${it.quantity > 1 ? ` x${it.quantity}` : ''}`)
                    .join(', ') || '—'
                  const time = order.orderDate
                    ? new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : ''
                  return (
                    <div key={order.id} className="group relative flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-gray-400">{order.id.substring(0, 10).toUpperCase()}</span>
                          <span className="text-xs text-gray-400">{time}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{productSummary}</p>
                        <p className="text-xs text-gray-400 truncate">{order.customerName}</p>
                      </div>
                      <div className="shrink-0 text-right flex flex-col items-end justify-center min-h-[44px]">
                        <p className="text-sm font-semibold text-gray-800">{fmt(order.total)}</p>
                        <div className="relative mt-1">
                          {order.orderStatus === 'AWAITING_CONFIRMATION' ? (
                            <>
                              <div className="hidden group-hover:flex items-center gap-1.5 bg-transparent pl-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (window.confirm(`Xác nhận duyệt đơn hàng ${order.id.substring(0, 10).toUpperCase()}?`)) {
                                      handleUpdateOrderStatus(order.id, 'PROCESSING')
                                    }
                                  }}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer border border-transparent hover:border-green-200"
                                  title="Xác nhận đơn hàng"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${order.id.substring(0, 10).toUpperCase()}?`)) {
                                      handleUpdateOrderStatus(order.id, 'CANCELLED')
                                    }
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                  title="Hủy đơn hàng"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <span className="inline-block group-hover:hidden text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 animate-pulse">
                                Chờ xác nhận
                              </span>
                            </>
                          ) : (
                            <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
                              {meta.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {!searchTerm.trim() && ordersHasNext && (
              <div className="px-6 py-3 border-t border-gray-50">
                <button
                  onClick={loadMoreOrders}
                  disabled={ordersLoadingMore}
                  className="w-full text-center text-sm text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed py-1"
                >
                  {ordersLoadingMore ? 'Đang tải thêm...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Top Products */}
            <div className="bg-white rounded border border-gray-200 p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">Sản phẩm bán chạy</h2>
                <span className="text-xs text-gray-400">{periodLabel}</span>
              </div>
              <div className="space-y-3">
                {chartLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <Skeleton className="w-24 h-3" />
                        <Skeleton className="w-14 h-3" />
                      </div>
                      <Skeleton className="w-full h-1.5 rounded-full" />
                    </div>
                  ))
                ) : topProducts.length === 0 ? (
                  <p className="text-xs text-gray-400">Chưa có dữ liệu bán hàng trong khoảng thời gian này.</p>
                ) : (
                  topProducts.map((p) => {
                    const pct = maxTopRevenue > 0 ? Math.round((Number(p.revenue) / maxTopRevenue) * 100) : 0
                    return (
                      <div key={p.productId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 truncate pr-2 max-w-[160px]">{p.productName}</span>
                          <span className="text-xs text-gray-500 shrink-0">{p.quantitySold} đã bán</span>
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
                {lowStockLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-0.5">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="flex-1 h-3" />
                      <Skeleton className="w-8 h-3" />
                    </div>
                  ))
                ) : lowStockItems.length === 0 ? (
                  <p className="text-xs text-gray-400">Không có sản phẩm nào sắp hết hàng.</p>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.id} className="group flex items-center gap-2.5 py-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.stock === 0 ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <span className="text-xs text-gray-700 flex-1 truncate" title={item.name}>{item.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold transition-all group-hover:hidden ${item.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {item.stock === 0 ? 'Hết hàng' : item.stock}
                        </span>
                        <button
                          onClick={() => onNavigate('importStock', { state: { prefilledProductName: item.name } })}
                          className="hidden group-hover:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-white bg-[#E8420A] hover:bg-[#C4350A] rounded cursor-pointer transition-colors shadow-sm"
                          title="Tạo phiếu nhập hàng nhanh"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Nhập hàng
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Command Menu Dialog */}
      {commandMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10%] px-4"
          onClick={() => setCommandMenuOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={commandInputRef}
                type="text"
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                placeholder="Tìm sản phẩm, khách hàng, chức năng..."
                className="flex-1 bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400 text-sm focus:ring-0 focus:outline-none"
              />
              <button
                onClick={() => setCommandMenuOpen(false)}
                className="text-[10px] font-bold text-gray-400 hover:text-gray-600 bg-white border border-gray-200 shadow-sm px-2 py-0.5 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Scrollable Results */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {searchLoading && (
                <div className="flex items-center justify-center py-8 text-xs text-gray-400 gap-2">
                  <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-[#E8420A]"></div>
                  Đang tìm kiếm...
                </div>
              )}

              {!searchLoading && !cmdSearch.trim() && (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trang chức năng</p>
                  {QUICK_ACTIONS.map((act) => {
                    const c = QA_COLOR[act.color]
                    return (
                      <button
                        key={act.id}
                        onClick={() => {
                          onNavigate(act.id)
                          setCommandMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-orange-50 hover:text-[#C4350A] rounded text-left text-xs font-semibold text-slate-700 transition-colors cursor-pointer group"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 flex items-center justify-center rounded text-white group-hover:${c.icon} transition-colors bg-slate-300`}>
                            {act.icon}
                          </span>
                          <span>{act.label}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal group-hover:text-orange-600/80">{act.desc}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {!searchLoading && cmdSearch.trim() && (
                <>
                  {/* Matching Page Actions */}
                  {searchResults.navs.length > 0 && (
                    <div className="space-y-0.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trang chức năng</p>
                      {searchResults.navs.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => {
                            onNavigate(act.id)
                            setCommandMenuOpen(false)
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-orange-50 hover:text-[#C4350A] rounded text-left text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="w-4 h-4 text-gray-400 shrink-0">{act.icon}</span>
                            <span>{act.label}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">{act.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Products */}
                  {searchResults.products.length > 0 && (
                    <div className="space-y-0.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sản phẩm</p>
                      {searchResults.products.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => {
                            onNavigate('productManagement', { state: { searchKey: prod.name } })
                            setCommandMenuOpen(false)
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-orange-50 hover:text-[#C4350A] rounded text-left text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt="" className="w-5 h-5 object-contain shrink-0 rounded bg-gray-50 border border-gray-100" />
                            ) : (
                              <span className="w-5 h-5 bg-gray-100 border border-gray-200 rounded shrink-0 flex items-center justify-center text-[8px] text-gray-400">sp</span>
                            )}
                            <span className="truncate font-semibold">{prod.name}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {prod.brandName || 'Store'} · {prod.minPrice ? `${prod.minPrice.toLocaleString('vi-VN')} đ` : 'Nghiệp vụ'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Customers */}
                  {searchResults.customers.length > 0 && (
                    <div className="space-y-0.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khách hàng</p>
                      {searchResults.customers.map((cust) => (
                        <button
                          key={cust.id}
                          onClick={() => {
                            onNavigate('customerDetail', { search: `?id=${cust.id}` })
                            setCommandMenuOpen(false)
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-orange-50 hover:text-[#C4350A] rounded text-left text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {cust.fullName ? cust.fullName.charAt(0).toUpperCase() : '?'}
                            </span>
                            <span className="truncate font-semibold">{cust.fullName || 'Ẩn danh'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{cust.phone || cust.id.substring(0, 8)}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Empty Results */}
                  {searchResults.navs.length === 0 && searchResults.products.length === 0 && searchResults.customers.length === 0 && (
                    <div className="text-center py-10 text-xs text-gray-400">
                      Không tìm thấy kết quả cho "{cmdSearch}"
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
              <span>Mẹo: Tìm tên sản phẩm (vd: iPhone) hoặc khách hàng (vd: Test)</span>
              <span>Đóng bằng phím ESC</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
