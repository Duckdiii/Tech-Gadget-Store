import { useState } from 'react'
import { useNav } from '../../../hooks/useNav'
import { useManagerOrders } from '../hooks/useManagerOrders'
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
  const onNavigate = useNav()
  const [search, setSearch] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const {
    orders,
    loading,
    loadingMore,
    hasNext,
    activeFilter,
    setActiveFilter,
    handleUpdateStatus,
    fetchOrders,
  } = useManagerOrders()

  const filteredOrders = orders.filter((order) => {
    const orderId = (order.id || '').toLowerCase()
    const customerName = (order.customerName || '').toLowerCase()
    const query = search.toLowerCase()
    return orderId.includes(query) || customerName.includes(query)
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 text-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tìm thấy {filteredOrders.length} đơn hàng trong bộ lọc này
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
            placeholder="Tìm mã đơn, tên khách..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white"
          />
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
              <div className="grid grid-cols-[150px_120px_130px_1fr_130px_160px_100px] px-6 py-3.5 border-b border-gray-100 bg-gray-50">
                {['MÃ ĐƠN', 'NGÀY ĐẶT', 'KHÁCH HÀNG', 'THANH TOÁN', 'TỔNG TIỀN', 'TRẠNG THÁI', 'ACT'].map((h, i) => (
                  <span key={i} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i === 6 ? 'text-right' : ''}`}>
                    {h}
                  </span>
                ))}
              </div>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Không tìm thấy đơn hàng nào</div>
              ) : (
                filteredOrders.map((order, i) => {
                  const isCancelled = order.orderStatus === 'CANCELLED'
                  return (
                    <div
                      key={order.id}
                      className={`grid grid-cols-[150px_120px_130px_1fr_130px_160px_100px] px-6 py-4 items-center ${
                        i < filteredOrders.length - 1 ? 'border-b border-gray-50' : ''
                      } hover:bg-gray-50/50`}
                    >
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
    </>
  )
}
