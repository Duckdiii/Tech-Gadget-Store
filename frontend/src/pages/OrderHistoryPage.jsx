import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'

/* ── shared ── */
function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

const STATUS_CFG = {
  COMPLETED:             { label: 'Đã hoàn thành', dot: 'bg-green-500',  bg: 'bg-green-100',  text: 'text-green-700'  },
  SHIPPING:              { label: 'Đang giao',     dot: 'bg-blue-500',   bg: 'bg-blue-50',    text: 'text-blue-700'   },
  PROCESSING:            { label: 'Đang xử lý',    dot: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' },
  AWAITING_CONFIRMATION: { label: 'Chờ xác nhận',  dot: 'bg-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  CANCELLED:             { label: 'Đã hủy',        dot: 'bg-red-500',    bg: 'bg-red-100',    text: 'text-red-700'    },
  REFUNDED:              { label: 'Đã hoàn tiền',  dot: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' },
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.AWAITING_CONFIRMATION
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

function PayIcon({ type, cls = 'w-4 h-4' }) {
  const t = (type || '').toLowerCase()
  if (t.includes('card') || t.includes('visa') || t.includes('master')) return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
  if (t.includes('momo')) return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  if (t.includes('zalo')) return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
  if (t.includes('bank') || t.includes(' chuyển khoản')) return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
  return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
}

/* ══════════════════════════════════════
   ORDER LIST TAB
   ══════════════════════════════════════ */
const ORDER_FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'AWAITING_CONFIRMATION', label: 'Chờ xác nhận' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'COMPLETED', label: 'Đã hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
]

function OrderListTab() {
  const onNavigate = useNav()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const url = activeFilter === 'all'
        ? '/api/manager/orders'
        : `/api/manager/orders?status=${activeFilter}`
      const data = await apiFetch(url)
      setOrders(data || [])
    } catch (e) {
      console.error("Lỗi tải đơn hàng manager:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [activeFilter])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(`/api/manager/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      await fetchOrders()
    } catch (e) {
      alert("Cập nhật trạng thái thất bại: " + e.message)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5 text-gray-800">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {ORDER_FILTER_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border ${activeFilter === tab.id ? 'bg-[#E8420A] text-white border-[#E8420A]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
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
          <div className="grid grid-cols-[150px_120px_130px_1fr_130px_160px_100px] px-6 py-3.5 border-b border-gray-100 bg-gray-50">
            {['MÃ ĐƠN','NGÀY ĐẶT','KHÁCH HÀNG','THANH TOÁN','TỔNG TIỀN','TRẠNG THÁI','ACT'].map((h, i) => (
              <span key={i} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i === 6 ? 'text-right' : ''}`}>{h}</span>
            ))}
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Không tìm thấy đơn hàng nào</div>
          ) : (
            orders.map((order, i) => {
              const isCancelled = order.orderStatus === 'CANCELLED'
              return (
                <div key={order.id} className={`grid grid-cols-[150px_120px_130px_1fr_130px_160px_100px] px-6 py-4 items-center ${i < orders.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50`}>
                  <span className={`text-sm font-mono font-semibold ${isCancelled ? 'text-gray-400' : 'text-gray-800'}`}>{order.id.substring(0,10).toUpperCase()}</span>
                  <div className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                    <p className="text-sm">{order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                    <p className="text-xs text-gray-400">{order.orderDate ? new Date(order.orderDate).toLocaleTimeString('vi-VN') : ''}</p>
                  </div>
                  <span className={`text-sm font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-700'}`}>{order.customerName}</span>
                  <div className={`flex items-center gap-2 text-sm ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                    <PayIcon type={order.paymentMethod} />
                    <span className="truncate max-w-[120px]">{order.paymentMethod || 'N/A'}</span>
                  </div>
                  <span className={`text-sm font-bold ${isCancelled ? 'text-gray-400' : 'text-gray-900'}`}>{fmt(order.total)}</span>
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
                    <button onClick={() => onNavigate('invoice', { search: `?orderId=${order.id}` })} className="text-sm font-medium cursor-pointer text-[#E8420A] hover:underline bg-transparent border-none">
                      Chi tiết
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </>
  )
}

/* ─── Payment Log Tab ─── */
const PAY_STATUS = {
  SUCCESS:  { label: 'Thành công', bg: 'bg-green-100',  text: 'text-green-700',  icon: '✓' },
  FAILED:   { label: 'Thất bại',   bg: 'bg-red-100',    text: 'text-red-600',    icon: '✕' },
  REFUNDED: { label: 'Hoàn tiền',  bg: 'bg-purple-100', text: 'text-purple-700', icon: '↩' },
  PENDING:  { label: 'Chờ xử lý',  bg: 'bg-amber-100',  text: 'text-amber-700',  icon: '…' },
}

const METHOD_COLOR = {
  MOMO:    { bg: 'bg-pink-50',   icon: 'text-pink-600'   },
  VNPAY:   { bg: 'bg-blue-50',   icon: 'text-blue-600'   },
  COD:     { bg: 'bg-amber-50',  icon: 'text-amber-600'  },
  DEFAULT: { bg: 'bg-gray-50',   icon: 'text-gray-600'   },
}

function TxnDetailModal({ txn, onClose }) {
  const ps = PAY_STATUS[txn.status] || PAY_STATUS.PENDING
  const pmType = (txn.paymentMethodType || 'DEFAULT').toUpperCase()
  const mc = METHOD_COLOR[pmType] || METHOD_COLOR.DEFAULT

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 text-gray-800">
        <div className="bg-white rounded shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
          {/* Status header banner */}
          <div className={`px-6 pt-6 pb-5 ${txn.status === 'SUCCESS' ? 'bg-green-50' : txn.status === 'FAILED' ? 'bg-red-50' : txn.status === 'REFUNDED' ? 'bg-purple-50' : 'bg-amber-50'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold ${txn.status === 'SUCCESS' ? 'bg-green-500 text-white' : txn.status === 'FAILED' ? 'bg-red-500 text-white' : txn.status === 'REFUNDED' ? 'bg-purple-500 text-white' : 'bg-amber-400 text-white'}`}>
                  {ps.icon}
                </div>
                <div>
                  <p className={`text-base font-bold ${ps.text}`}>{ps.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{txn.timestamp ? new Date(txn.timestamp).toLocaleString('vi-VN') : ''}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded cursor-pointer border-none bg-transparent">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-gray-900">{fmt(txn.amount)}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {txn.id}</p>
            </div>
            {txn.failureReason && (
              <div className="mt-3 bg-red-100 border border-red-200 rounded px-3 py-2 text-xs text-red-600 font-medium">
                ⚠ Lý do lỗi: {txn.failureReason}
              </div>
            )}
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Customer metadata */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Khách hàng</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Họ và tên</span><span className="font-semibold text-gray-800">{txn.customerName || 'Vãng lai'}</span></div>
                {txn.customerPhone && <div className="flex justify-between text-sm"><span className="text-gray-500">Số điện thoại</span><span className="font-semibold text-gray-800">{txn.customerPhone}</span></div>}
                {txn.customerEmail && <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-semibold text-gray-800">{txn.customerEmail}</span></div>}
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Payment logs details */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Phương thức thanh toán</p>
              <div className={`flex items-center gap-3 p-3 rounded mb-3 ${mc.bg}`}>
                <span className={mc.icon}><PayIcon type={txn.paymentMethodType} cls="w-5 h-5" /></span>
                <span className="text-sm font-semibold text-gray-800">{txn.paymentMethod}</span>
              </div>
              {txn.metadata && (
                <div className="space-y-2.5 bg-gray-50 p-3 rounded">
                  {Object.entries(txn.metadata).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs font-mono">
                      <span className="text-gray-400">{key}</span>
                      <span className="text-gray-700 truncate max-w-[260px]">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

function PaymentLogTab() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/api/manager/payment-logs')
      setOrders(data || []) // wait, setLogs(data) !
      setLogs(data || [])
    } catch (e) {
      console.error("Lỗi tải payment logs manager:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    return (
      !q ||
      l.id.toLowerCase().includes(q) ||
      (l.orderId && l.orderId.toLowerCase().includes(q)) ||
      (l.customerName && l.customerName.toLowerCase().includes(q))
    )
  })

  return (
    <>
      <div className="flex items-center justify-between mb-5 text-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký thanh toán</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tìm thấy {filtered.length} giao dịch thanh toán trực tuyến và COD
          </p>
        </div>
      </div>

      {/* Search filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã GD, mã đơn, khách hàng..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-800" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden text-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Mã giao dịch','Ngày thanh toán','Khách hàng','Phương thức','Mã đơn hàng','Số tiền','Trạng thái','Chi tiết'].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy giao dịch nào</td></tr>
              ) : filtered.map(log => {
                const ps = PAY_STATUS[log.status] || PAY_STATUS.PENDING
                const pmType = (log.paymentMethodType || 'DEFAULT').toUpperCase()
                const mc = METHOD_COLOR[pmType] || METHOD_COLOR.DEFAULT
                return (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-700">{log.id.substring(0, 10).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-4 text-left">
                      <p className="text-gray-800 font-medium">{log.timestamp ? new Date(log.timestamp).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      <p className="text-xs text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('vi-VN') : ''}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{log.customerName || 'Vãng lai'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded ${mc.bg}`}>
                        <span className={mc.icon}><PayIcon type={log.paymentMethodType} cls="w-3.5 h-3.5" /></span>
                        <span className="text-xs font-semibold text-gray-700">{log.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono font-semibold text-[#E8420A]">{log.orderId ? log.orderId.substring(0,10).toUpperCase() : 'N/A'}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-gray-800">{fmt(log.amount)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${ps.bg} ${ps.text}`}>{ps.label}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => setSelected(log)} className="transition-opacity text-xs font-semibold text-[#E8420A] hover:text-[#C4350A] px-3 py-1.5 rounded hover:bg-orange-50 cursor-pointer whitespace-nowrap border-none bg-transparent">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && <TxnDetailModal txn={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

/* ══════════════════════════════════════
   ROOT PAGE
   ══════════════════════════════════════ */
const MAIN_TABS = [
  { id: 'orders', label: 'Đơn hàng', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { id: 'payments', label: 'Nhật ký thanh toán', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
]

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <StoreNavbar />

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex items-center gap-1">
          {MAIN_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} bg-transparent`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 py-7">
        {activeTab === 'orders'   && <OrderListTab />}
        {activeTab === 'payments' && <PaymentLogTab />}
      </div>
    </div>
  )
}
