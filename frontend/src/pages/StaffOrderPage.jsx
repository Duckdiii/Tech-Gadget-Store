import { useState, useEffect } from 'react'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'

const fmt = n => (n || 0).toLocaleString('vi-VN')

const ORDER_STATUS = {
  COMPLETED:             { label: 'Hoàn thành',   bg: 'bg-green-100',  text: 'text-green-700' },
  SHIPPING:              { label: 'Đang giao',    bg: 'bg-purple-100', text: 'text-purple-700'},
  PROCESSING:            { label: 'Đang xử lý',   bg: 'bg-orange-50',  text: 'text-[#C4350A]' },
  AWAITING_CONFIRMATION: { label: 'Chờ xác nhận', bg: 'bg-amber-100',  text: 'text-amber-700' },
  CANCELLED:             { label: 'Đã hủy',       bg: 'bg-red-100',    text: 'text-red-600'   },
  REFUNDED:              { label: 'Đã hoàn tiền', bg: 'bg-purple-100', text: 'text-purple-700' },
}

const PAY_METHOD = {
  CARD:    { label: 'Thẻ Visa / Master', icon: '💳' },
  MOMO:    { label: 'MoMo',             icon: '📱' },
  COD:     { label: 'Tiền mặt (COD)',   icon: '💵' },
  DEFAULT: { label: 'Thanh toán trực tuyến', icon: '🏦' }
}

function OrderDetailDrawer({ order, onClose, onMarkDone }) {
  const items = order.items || []
  const subtotal = order.total || 0
  const ship = 0
  const total = subtotal + ship
  const st = ORDER_STATUS[order.orderStatus] || ORDER_STATUS.AWAITING_CONFIRMATION
  const pmType = (order.paymentMethod || 'DEFAULT').toUpperCase()
  const pm = PAY_METHOD[pmType] || PAY_METHOD.DEFAULT

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col text-gray-800">
        {/* Header */}
        <div className="bg-gray-900 px-6 pt-5 pb-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded cursor-pointer border-none bg-transparent">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <p className="text-sm font-bold opacity-70">Đơn hàng</p>
          <h2 className="text-xl font-black mt-0.5 font-mono">{order.id.substring(0, 13).toUpperCase()}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
            <span className="text-sm opacity-70">{order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : ''}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Customer */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Thông tin khách hàng</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
              <div className="flex gap-2 items-center">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="font-semibold text-gray-800">{order.customerName}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sản phẩm ({items.length})</h3>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded px-4 py-3">
                  <div className="w-10 h-10 bg-white rounded border border-gray-100 flex items-center justify-center text-lg shrink-0">📦</div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.productName}</p>
                    <p className="text-[11px] text-gray-400">{item.variantName} · SL: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 shrink-0">{fmt(item.totalPrice)} đ</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Thanh toán</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Tổng cộng sản phẩm</span><span>{fmt(subtotal)} đ</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-800 text-base"><span>Tổng cộng đơn</span><span className="text-teal-700">{fmt(total)} đ</span></div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-gray-500">
                <span>{pm.icon}</span><span>{pm.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED' && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button onClick={() => onMarkDone(order.id)} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 border-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Xác nhận xử lý xong (Hoàn thành)
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/* ── Root Page ── */
export default function StaffOrderPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/api/manager/orders')
      setOrders(data || [])
    } catch (e) {
      console.error("Lỗi tải đơn hàng staff:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    return (
      (!q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)) &&
      (!statusF || o.orderStatus === statusF)
    )
  })

  async function handleMarkDone(id) {
    try {
      await apiFetch(`/api/manager/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'COMPLETED' })
      })
      await fetchOrders()
      setSelected(null)
      showToast('Đã đánh dấu hoàn thành đơn hàng')
    } catch (e) {
      alert("Lỗi xác nhận hoàn thành: " + e.message)
    }
  }

  const selectedOrder = selected ? orders.find(o => o.id === selected) : null

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <StoreNavbar />

      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hỗ trợ đơn hàng (Nhân viên)</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tra cứu và xác nhận xử lý đơn hàng</p>
        </div>
      </header>

      {toast && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex-1 px-8 py-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã đơn, tên khách..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer bg-white">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} đơn</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
          </div>
        ) : (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Mã đơn','Khách hàng','Ngày đặt','Tổng tiền','Thanh toán','Trạng thái',''].map((h,i) => (
                    <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không tìm thấy đơn hàng nào</td></tr>
                ) : (
                  filtered.map(o => {
                    const st = ORDER_STATUS[o.orderStatus] || ORDER_STATUS.AWAITING_CONFIRMATION
                    const pmType = (o.paymentMethod || 'DEFAULT').toUpperCase()
                    const pm = PAY_METHOD[pmType] || PAY_METHOD.DEFAULT
                    return (
                      <tr key={o.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-4 py-4 font-mono text-xs font-bold text-gray-700">{o.id.substring(0, 13).toUpperCase()}</td>
                        <td className="px-4 py-4">
                          <p className="text-xs font-semibold text-gray-800">{o.customerName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-gray-700">{o.orderDate ? new Date(o.orderDate).toLocaleDateString('vi-VN') : ''}</p>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-800">{fmt(o.total)}</td>
                        <td className="px-4 py-4">
                          <span className="text-xs">{pm.label}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => setSelected(o.id)} className="text-xs font-semibold text-teal-600 hover:text-teal-700 border-none bg-transparent cursor-pointer">
                            Xử lý →
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onMarkDone={handleMarkDone}
        />
      )}
    </div>
  )
}
