import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useManagerOrders } from '../hooks/useManagerOrders'
import { managerOrderService } from '../services/managerOrderService'
import PayIcon from './PayIcon'
import OrderDetailModal from './OrderDetailModal'

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + ' đ'
}

const ORDER_FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'AWAITING_CONFIRMATION', label: 'Chờ xác nhận' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'COMPLETED', label: 'Đã hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
]

export default function OrderListTab() {
  const location = useLocation()
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const {
    orders,
    loading,
    loadingMore,
    hasNext,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    paymentMethodFilter,
    setPaymentMethodFilter,
    stats,
    handleUpdateStatus,
    fetchOrders,
  } = useManagerOrders(location.state?.filter)

  const [selectedIds, setSelectedIds] = useState([])

  // Clear selections when filters update
  useEffect(() => {
    setSelectedIds([])
  }, [activeFilter, search, dateFilter, customStartDate, customEndDate, paymentMethodFilter])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (orderId) => {
    setSelectedIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleBulkConfirm = async () => {
    if (selectedIds.length === 0) return
    const countToConfirm = orders.filter(o => selectedIds.includes(o.id) && o.orderStatus === 'AWAITING_CONFIRMATION').length
    if (countToConfirm === 0) {
      alert("Không có đơn hàng nào được chọn ở trạng thái 'Chờ xác nhận' để duyệt.")
      return
    }

    if (!window.confirm(`Bạn có chắc muốn duyệt hàng loạt ${countToConfirm} đơn hàng chờ xác nhận đã chọn?`)) return
    
    try {
      const res = await managerOrderService.bulkConfirmOrders(selectedIds)
      alert(`Đã duyệt thành công ${res.updatedCount} đơn hàng chờ xác nhận!`)
      fetchOrders(true)
      setSelectedIds([])
    } catch (err) {
      alert("Duyệt hàng loạt thất bại: " + err.message)
    }
  }

  const handleBulkExport = async () => {
    if (selectedIds.length === 0) return
    try {
      const blob = await managerOrderService.exportOrders(selectedIds)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `van-don-${new Date().getTime()}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setSelectedIds([])
    } catch (err) {
      alert("Xuất vận đơn thất bại: " + err.message)
    }
  }

  return (
    <>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7 text-gray-800 animate-fade-in">
        {/* Đơn chờ xác nhận */}
        <div
          onClick={() => setActiveFilter('AWAITING_CONFIRMATION')}
          className={`bg-white p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between ${
            activeFilter === 'AWAITING_CONFIRMATION'
              ? 'border-[#E8420A] ring-1 ring-[#E8420A]/50 bg-amber-50/5'
              : 'border-gray-200'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đơn chờ xác nhận</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats?.pendingCount ?? 0}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
            ⌛
          </div>
        </div>

        {/* Đang giao hàng */}
        <div
          onClick={() => setActiveFilter('SHIPPING')}
          className={`bg-white p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between ${
            activeFilter === 'SHIPPING'
              ? 'border-[#E8420A] ring-1 ring-[#E8420A]/50 bg-amber-50/5'
              : 'border-gray-200'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đang giao hàng</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats?.shippingCount ?? 0}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            🚚
          </div>
        </div>

        {/* Doanh thu hôm nay */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Doanh thu hôm nay</p>
            <p className="text-lg font-black text-green-600 mt-1.5">{fmt(stats?.todayRevenue ?? 0)}</p>
          </div>
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold">
            💰
          </div>
        </div>

        {/* Tỷ lệ hủy đơn */}
        <div
          onClick={() => setActiveFilter('CANCELLED')}
          className={`bg-white p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between ${
            activeFilter === 'CANCELLED'
              ? 'border-[#E8420A] ring-1 ring-[#E8420A]/50 bg-amber-50/5'
              : 'border-gray-200'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tỷ lệ hủy tháng này</p>
            <p className="text-2xl font-black text-red-600 mt-1">{(stats?.cancellationRate ?? 0).toFixed(1)}%</p>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold">
            ✕
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-5 text-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
            <p className="text-xs text-gray-500 mt-1">
              Hiển thị {orders.length} đơn hàng trong bộ lọc này
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, tên khách hàng..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white"
            />
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date range filter */}
          <div className="relative min-w-[160px]">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full appearance-none border border-gray-300 rounded px-3 py-2 pr-9 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="custom">Khoảng tùy chỉnh</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Custom Date inputs */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white cursor-pointer"
              />
              <span className="text-gray-400 text-sm">đến</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white cursor-pointer"
              />
            </div>
          )}

          {/* Payment Method filter */}
          <div className="relative min-w-[180px]">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full appearance-none border border-gray-300 rounded px-3 py-2 pr-9 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
            >
              <option value="all">Mọi phương thức thanh toán</option>
              <option value="COD">Tiền mặt (COD)</option>
              <option value="VNPAY">Ví điện tử VNPAY</option>
              <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {ORDER_FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border ${
              activeFilter === tab.id
                ? 'bg-[#E8420A] text-white border-[#E8420A]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden text-gray-800">
          <div className="overflow-x-auto">
            <div className="min-w-[950px]">
              <div className="grid grid-cols-[50px_140px_110px_120px_1fr_120px_150px_80px] px-6 py-3.5 border-b border-gray-100 bg-gray-50 items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#E8420A] focus:ring-[#E8420A] border-gray-300 rounded cursor-pointer"
                  />
                </div>
                {['MÃ ĐƠN', 'NGÀY ĐẶT', 'KHÁCH HÀNG', 'THANH TOÁN', 'TỔNG TIỀN', 'TRẠNG THÁI', 'ACT'].map((h, i) => (
                  <span key={i} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i === 6 ? 'text-right' : ''}`}>
                    {h}
                  </span>
                ))}
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Không tìm thấy đơn hàng nào</div>
              ) : (
                orders.map((order, i) => {
                  const isCancelled = order.orderStatus === 'CANCELLED'
                  return (
                    <div
                      key={order.id}
                      className={`grid grid-cols-[50px_140px_110px_120px_1fr_120px_150px_80px] px-6 py-4 items-center ${
                        i < orders.length - 1 ? 'border-b border-gray-50' : ''
                      } hover:bg-gray-50/50 ${selectedIds.includes(order.id) ? 'bg-amber-50/20' : ''}`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => handleSelectRow(order.id)}
                          className="w-4 h-4 text-[#E8420A] focus:ring-[#E8420A] border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      <span className={`text-sm font-mono font-semibold ${isCancelled ? 'text-gray-400' : 'text-gray-800'}`}>
                        {order.id.substring(0, 10).toUpperCase()}
                      </span>
                      <div className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                        <p className="text-sm">
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.orderDate ? new Date(order.orderDate).toLocaleTimeString('vi-VN') : ''}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-700'}`}>
                        {order.customerName}
                      </span>
                      <div className={`flex items-center gap-2 text-sm ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                        <PayIcon type={order.paymentMethod} />
                        <span className="truncate max-w-[120px]">{order.paymentMethod || 'N/A'}</span>
                      </div>
                      <span className={`text-sm font-bold ${isCancelled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {fmt(order.total)}
                      </span>
                      <div>
                         <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={isCancelled || order.orderStatus === 'COMPLETED'}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 cursor-pointer focus:outline-none"
                        >
                          <option value="AWAITING_CONFIRMATION">Chờ xác nhận</option>
                          <option value="PROCESSING">Đang xử lý</option>
                          <option value="SHIPPING">Đang giao</option>
                          <option value="COMPLETED">Đã hoàn thành</option>
                          <option value="CANCELLED">Đã hủy</option>
                          <option value="REFUNDED">Đã hoàn tiền</option>
                        </select>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="text-sm font-medium cursor-pointer text-[#E8420A] hover:underline bg-transparent border-none"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
              {hasNext && (
                <div className="flex justify-center py-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => fetchOrders(false)}
                    disabled={loadingMore}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded cursor-pointer disabled:opacity-60 transition-colors"
                  >
                    {loadingMore ? 'Đang tải thêm...' : 'Xem thêm đơn hàng'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl border border-gray-800 flex items-center gap-6 z-40 transition-all duration-300">
          <div className="text-sm font-semibold border-r border-gray-700 pr-6">
            Đã chọn: <span className="text-[#E8420A] text-base font-bold">{selectedIds.length}</span> đơn hàng
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkConfirm}
              className="bg-[#E8420A] hover:bg-[#C4350A] text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Duyệt đơn hàng loạt
            </button>
            
            <button
              onClick={handleBulkExport}
              className="border border-gray-700 hover:bg-gray-800 text-gray-200 px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất vận đơn (Excel)
            </button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="text-gray-400 hover:text-white transition-colors pl-4 border-l border-gray-700 cursor-pointer"
            title="Bỏ chọn tất cả"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
