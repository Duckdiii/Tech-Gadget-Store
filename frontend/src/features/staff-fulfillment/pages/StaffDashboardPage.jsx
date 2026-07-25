import { useCallback, useEffect, useRef, useState } from 'react'
import { useNav } from '../../../hooks/useNav'
import { useLowStockProducts } from '../../../hooks/useLowStockProducts'
import { useAuth } from '../../../context/useAuth'
import { apiFetch } from '../../../services/api'
import StatCard from '../components/StatCard'

const fmt = n => Number(n).toLocaleString('vi-VN')

/** Interval auto-refresh (ms) */
const REFRESH_INTERVAL_MS = 60_000 // 60 giây

const ORDER_STATUS = {
  PROCESSING:            { bg: 'bg-orange-50',  text: 'text-[#E8420A]',  label: 'Đang xử lý'   },
  AWAITING_CONFIRMATION: { bg: 'bg-amber-100',  text: 'text-amber-600',  label: 'Chờ xác nhận' },
  SHIPPING:              { bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'Đang giao'     },
  processing:            { bg: 'bg-orange-50',  text: 'text-[#E8420A]',  label: 'Đang xử lý'   },
  pending:               { bg: 'bg-amber-100',  text: 'text-amber-600',  label: 'Chờ xác nhận' },
  overdue:               { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Quá hạn'       },
}

/** Tính khoảng thời gian dạng "2 giờ trước" */
function timeAgo(dateVal) {
  if (!dateVal) return ''
  const d = Array.isArray(dateVal)
    ? new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] ?? 0, dateVal[4] ?? 0, dateVal[5] ?? 0)
    : new Date(dateVal)
  const diffMs = Date.now() - d.getTime()
  const diffM  = Math.floor(diffMs / 60000)
  if (diffM < 1)   return 'Vừa xong'
  if (diffM < 60)  return `${diffM} phút trước`
  const diffH = Math.floor(diffM / 60)
  if (diffH < 24)  return `${diffH} giờ trước`
  return `${Math.floor(diffH / 24)} ngày trước`
}

/** Nhóm raw log items thành phiếu theo logId, lấy tối đa limit phiếu gần nhất */
function groupLogsToRecent(logs, limit = 4) {
  const groups = {}
  logs.forEach(item => {
    if (!groups[item.logId]) {
      const dt = Array.isArray(item.createdTime)
        ? new Date(item.createdTime[0], item.createdTime[1] - 1, item.createdTime[2],
            item.createdTime[3] ?? 0, item.createdTime[4] ?? 0)
        : new Date(item.createdTime)
      groups[item.logId] = {
        id:     item.logId,
        type:   item.type,
        party:  item.noteOrReason?.split(';')[0] || (item.type === 'IMPORT' ? 'Nhà cung cấp' : 'Khách hàng'),
        time:   dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        items:  0,
        total:  0,
        sortTs: dt.getTime(),
      }
    }
    groups[item.logId].items += 1
    groups[item.logId].total += (item.quantity ?? 0) * (Number(item.price) || 0)
  })
  return Object.values(groups)
    .sort((a, b) => b.sortTs - a.sortTs)
    .slice(0, limit)
}

export default function StaffDashboardPage() {
  const onNavigate = useNav()
  const { user }   = useAuth()
  const today      = new Date()
  const dateStr    = today.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const todayIso   = today.toISOString().slice(0, 10)

  const { items: lowStockItems, totalCount: lowStockCount, threshold: lowStockThreshold, loading: lowStockLoading, refetch: refetchLowStock } = useLowStockProducts(5)

  // ── KPI states ─────────────────────────────────────────────────────────────
  const [importCount,  setImportCount]  = useState(null)
  const [exportCount,  setExportCount]  = useState(null)
  const [pendingCount, setPendingCount] = useState(null)

  // ── Table states ────────────────────────────────────────────────────────────
  const [pendingOrders,  setPendingOrders]  = useState([])
  const [recentReceipts, setRecentReceipts] = useState([])
  const [loadingOrders,  setLoadingOrders]  = useState(true)
  const [loadingRecent,  setLoadingRecent]  = useState(true)

  // ── Progress tracker states ─────────────────────────────────────────────────
  const [progressStats, setProgressStats] = useState(null) // null = loading

  // ── Real-time meta ──────────────────────────────────────────────────────────
  const [lastUpdated,  setLastUpdated]  = useState(null)   // Date object
  const [isRefreshing, setIsRefreshing] = useState(false)
  const intervalRef = useRef(null)

  // ── Core fetch function (gom toàn bộ API calls vào 1 hàm) ─────────────────
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) {
      setLoadingOrders(true)
      setLoadingRecent(true)
    }
    setIsRefreshing(true)

    const params = `startDate=${todayIso}&endDate=${todayIso}`

    try {
      // Chạy song song tất cả requests
      const [importLogs, exportLogs, pendingData, ordersData, allLogs, orderStats] = await Promise.allSettled([
        apiFetch(`/api/manager/warehouse-logs?type=IMPORT&${params}`),
        apiFetch(`/api/manager/warehouse-logs?type=EXPORT&${params}`),
        apiFetch('/api/manager/orders/pending-count'),
        apiFetch('/api/manager/orders?limit=5'),
        apiFetch('/api/manager/warehouse-logs'),
        apiFetch('/api/manager/orders/stats'),
      ])

      // KPI: import count
      let importCountVal = 0
      if (importLogs.status === 'fulfilled') {
        const logs = importLogs.value ?? []
        importCountVal = new Set(logs.map(l => l.logId)).size
        setImportCount(importCountVal)
      } else {
        setImportCount(prev => prev ?? 0)
      }

      // KPI: export count
      let exportCountVal = 0
      if (exportLogs.status === 'fulfilled') {
        const logs = exportLogs.value ?? []
        exportCountVal = new Set(logs.map(l => l.logId)).size
        setExportCount(exportCountVal)
      } else {
        setExportCount(prev => prev ?? 0)
      }

      // KPI: pending orders count
      let pendingCountVal = 0
      if (pendingData.status === 'fulfilled') {
        pendingCountVal = pendingData.value?.count ?? 0
        setPendingCount(pendingCountVal)
      } else {
        setPendingCount(prev => prev ?? 0)
      }

      // Table: pending orders list
      if (ordersData.status === 'fulfilled') {
        setPendingOrders(ordersData.value?.items ?? [])
      }

      // Table: recent receipts
      if (allLogs.status === 'fulfilled') {
        setRecentReceipts(groupLogsToRecent(allLogs.value ?? [], 4))
      }

      // ── Progress tracker ──────────────────────────────────────────────────
      // Đơn hàng: lấy shippingCount từ stats (đã được xử lý/đang giao) làm "done"
      // Total = done + pending (chờ xử lý)
      let ordersDone  = 0
      let ordersTotal = 0
      if (orderStats.status === 'fulfilled') {
        const stats = orderStats.value ?? {}
        ordersDone  = Number(stats.shippingCount ?? 0)
        ordersTotal = ordersDone + pendingCountVal
      }

      // Phiếu nhập: done = số phiếu nhập hôm nay, target tối thiểu 1
      const importDone  = importCountVal
      const importTotal = Math.max(importDone + (importDone === 0 ? 1 : 0), importDone + 1)

      // Phiếu xuất (đóng gói): done = số phiếu xuất hôm nay
      const exportDone  = exportCountVal
      const exportTotal = Math.max(exportDone + (exportDone === 0 ? 1 : 0), exportDone + 1)

      setProgressStats({
        orders:  { done: ordersDone,  total: Math.max(ordersTotal, 1), label: 'Đơn hàng đã xử lý',   unit: 'đơn',   color: 'teal'   },
        imports: { done: importDone,  total: importTotal,               label: 'Phiếu nhập hôm nay',  unit: 'phiếu', color: 'blue'   },
        exports: { done: exportDone,  total: exportTotal,               label: 'Phiếu xuất hôm nay',  unit: 'phiếu', color: 'violet' },
      })

      setLastUpdated(new Date())
    } finally {
      setIsRefreshing(false)
      setLoadingOrders(false)
      setLoadingRecent(false)
    }
  }, [todayIso])

  // ── Initial fetch + polling setup ──────────────────────────────────────────
  useEffect(() => {
    fetchAll(false) // fetch lần đầu với loading state

    intervalRef.current = setInterval(() => {
      fetchAll(true) // polling sau đó: silent (không reset loading)
      if (refetchLowStock) refetchLowStock()
    }, REFRESH_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchAll, refetchLowStock])

  // ── Manual refresh handler ──────────────────────────────────────────────────
  const handleManualRefresh = () => {
    if (isRefreshing) return
    fetchAll(true)
    if (refetchLowStock) refetchLowStock()
    // Reset interval để đếm lại từ đầu sau lần refresh thủ công
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      fetchAll(true)
      if (refetchLowStock) refetchLowStock()
    }, REFRESH_INTERVAL_MS)
  }

  // ── KPI config ──────────────────────────────────────────────────────────────
  const KPI = [
    {
      label: 'Phiếu nhập hôm nay',
      value: importCount === null ? '—' : importCount,
      sub: 'Nhập kho trong ngày',
      color: 'teal',
      action: 'staffImport',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    },
    {
      label: 'Phiếu xuất hôm nay',
      value: exportCount === null ? '—' : exportCount,
      sub: 'Xuất kho trong ngày',
      color: 'blue',
      action: 'staffExport',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
    },
    {
      label: 'Tồn kho sắp hết',
      value: lowStockLoading ? '—' : lowStockCount,
      sub: 'Cần nhập bổ sung',
      color: 'red',
      action: null,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
    {
      label: 'Đơn cần xử lý',
      value: pendingCount === null ? '—' : pendingCount,
      sub: 'Chờ xác nhận / đóng gói',
      color: 'amber',
      action: 'staffOrders',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    },
  ]

  const hour        = today.getHours()
  const greeting    = hour < 12 ? 'buổi sáng' : hour < 18 ? 'buổi chiều' : 'buổi tối'
  const displayName = user?.fullName || user?.username || 'bạn'

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chào {greeting}, {displayName}! 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{dateStr}</p>
        </div>

        {/* Real-time status + refresh */}
        <div className="flex items-center gap-3">
          {/* Live badge + last updated */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 tracking-wide">LIVE</span>
            </span>
            {lastUpdatedStr && (
              <span className="text-[11px] text-gray-400">
                Cập nhật lúc {lastUpdatedStr}
              </span>
            )}
          </div>

          {/* Manual refresh button */}
          <button aria-label="Tải lại dữ liệu" type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Tải lại dữ liệu"
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-none bg-transparent"
          >
            <svg
              className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button aria-label="Thông báo" type="button" className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer border-none bg-transparent">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          {KPI.map((c) => (
            <StatCard
              key={c.label}
              icon={c.icon}
              label={c.label}
              value={c.value}
              sub={c.sub}
              color={c.color}
              action={c.action}
              onClick={() => c.action && onNavigate(c.action)}
            />
          ))}
        </div>

        {/* ── Daily Progress Tracker ─────────────────────────────────────── */}
        <div className="bg-white rounded border border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <h3 className="text-sm font-bold text-gray-800">Tiến độ hoạt động hôm nay</h3>
            </div>
            <span className="text-[11px] text-gray-400">
              {progressStats
                ? `Ca làm việc: ${today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Đang tính toán...'}
            </span>
          </div>

          {progressStats === null ? (
            // Skeleton
            <div className="space-y-4">
              {[1, 2, 3].map(k => (
                <div key={k} className="animate-pulse space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 rounded w-36" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(progressStats).map((track) => {
                const pct = Math.min(Math.round((track.done / track.total) * 100), 100)
                const isDone = pct >= 100

                // Gradient màu theo loại
                const gradients = {
                  teal:   'from-teal-400 to-teal-600',
                  blue:   'from-blue-400 to-blue-600',
                  violet: 'from-violet-400 to-violet-600',
                }
                const textColors = {
                  teal:   'text-teal-700',
                  blue:   'text-blue-700',
                  violet: 'text-violet-700',
                }
                const bgLights = {
                  teal:   'bg-teal-50',
                  blue:   'bg-blue-50',
                  violet: 'bg-violet-50',
                }

                return (
                  <div key={track.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {isDone && (
                          <span className="text-emerald-500 text-xs">✓</span>
                        )}
                        <span className="text-xs font-semibold text-gray-700">{track.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDone ? 'text-emerald-600' : textColors[track.color]}`}>
                          {track.done}/{track.total} {track.unit}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isDone ? 'bg-emerald-100 text-emerald-700' : `${bgLights[track.color]} ${textColors[track.color]}`
                        }`}>
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${isDone ? 'from-emerald-400 to-emerald-600' : gradients[track.color]} transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-5 gap-5">
          {/* Low stock */}
          <div className="col-span-2 bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <h3 className="text-sm font-bold text-gray-800">Cảnh báo tồn kho</h3>
              </div>
              <button aria-label="Xem tất cả sản phẩm sắp hết hàng" type="button" onClick={() => onNavigate('staffImport')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer border-none bg-transparent">
                Xem tất cả →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStockLoading ? (
                <div className="px-5 py-4 space-y-3">
                  {[1, 2, 3].map(k => (
                    <div key={k} className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded bg-gray-100" />
                      <div className="flex-1 h-3 bg-gray-100 rounded" />
                      <div className="w-12 h-3 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : lowStockItems.length === 0 ? (
                <p className="px-5 py-3.5 text-xs text-gray-400">Không có sản phẩm nào sắp hết hàng.</p>
              ) : (
                lowStockItems.map((p) => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-3 group hover:bg-amber-50/40 transition-colors">
                    <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${p.stock === 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
                      <svg className={`w-4 h-4 ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className={`text-[11px] font-bold mt-0.5 ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock} · Ngưỡng: ${lowStockThreshold}`}
                      </p>
                    </div>
                    {/* Nút nhập hàng nhanh */}
                    <button aria-label={`Nhập hàng cho ${p.name}`} type="button"
                      onClick={() => onNavigate('staffImport', { state: { prefillProductId: p.id, prefillProductName: p.name } })}
                      title={`Nhập hàng cho: ${p.name}`}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Nhập
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-50">
              <button aria-label="Tạo phiếu nhập kho mới" type="button" onClick={() => onNavigate('staffImport')} className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors border-none">
                + Tạo phiếu nhập kho
              </button>
            </div>
          </div>

          {/* Pending orders */}
          <div className="col-span-3 bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-800">Đơn hàng cần xử lý</h3>
                {isRefreshing && (
                  <svg className="w-3 h-3 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
              </div>
              <button aria-label="Xem tất cả đơn hàng cần xử lý" type="button" onClick={() => onNavigate('staffOrders')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer border-none bg-transparent">
                Xem tất cả →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {loadingOrders ? (
                <div className="px-5 py-4 space-y-3">
                  {[1, 2, 3, 4].map(k => (
                    <div key={k} className="flex items-center gap-4 animate-pulse">
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                      </div>
                      <div className="w-20 h-3 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <svg className="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-400">Không có đơn hàng nào cần xử lý.</p>
                </div>
              ) : (
                pendingOrders.map((o) => {
                  const statusKey = o.orderStatus || o.status || ''
                  const sc = ORDER_STATUS[statusKey] || { bg: 'bg-gray-100', text: 'text-gray-600', label: statusKey }
                  const orderItems = o.orderItems ?? o.items ?? []
                  const itemCount  = Array.isArray(orderItems) ? orderItems.length : (orderItems ?? 0)
                  return (
                    <div
                      key={o.id || o.createdAt}
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem chi tiết đơn hàng ${o.id?.slice(0, 13) ?? 'cần xử lý'}`}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('staffOrders') }}
                      onClick={() => onNavigate('staffOrders')}
                      className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/60 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-800 font-mono">#{o.id?.slice(0, 13) ?? '—'}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {o.customerName ?? o.customer ?? 'Khách hàng'} · {itemCount} sản phẩm
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-800">{fmt(o.totalAmount ?? o.total ?? 0)}đ</p>
                        <p className="text-[11px] text-gray-400">{timeAgo(o.createdAt ?? o.orderDate)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent receipts */}
        <div className="bg-white rounded border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800">Phiếu gần đây</h3>
              {isRefreshing && (
                <svg className="w-3 h-3 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
            <button aria-label="Xem lịch sử phiếu nhập xuất" type="button" onClick={() => onNavigate('staffHistory')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer border-none bg-transparent">
              Xem lịch sử →
            </button>
          </div>
          {loadingRecent ? (
            <div className="grid grid-cols-4 divide-x divide-gray-50">
              {[1, 2, 3, 4].map(k => (
                <div key={k} className="p-5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-gray-100" />
                    <div className="flex-1 h-2.5 bg-gray-100 rounded" />
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded" />
                  <div className="h-2 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentReceipts.length === 0 ? (
            <p className="px-5 py-3.5 text-xs text-gray-400">Chưa có phiếu nhập/xuất nào gần đây.</p>
          ) : (
            <div className="grid grid-cols-4 divide-x divide-gray-50">
              {recentReceipts.map((r) => (
                <div
                  key={r.id || r.type}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết phiếu ${r.id}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('staffHistory') }}
                  onClick={() => onNavigate('staffHistory')}
                  className="p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold ${r.type === 'IMPORT' ? 'bg-teal-500' : 'bg-[#E8420A]'}`}>
                      {r.type === 'IMPORT' ? 'NH' : 'XH'}
                    </span>
                    <span className="font-mono text-[11px] text-gray-500 font-semibold truncate">{r.id}</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium truncate">{r.party}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{r.items} SP · {r.time}</p>
                  <p className="text-sm font-bold text-gray-800 mt-1.5">{fmt(r.total)}đ</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
