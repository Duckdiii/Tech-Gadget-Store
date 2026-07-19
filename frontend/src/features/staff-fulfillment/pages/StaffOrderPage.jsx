import { useStaffOrders } from '../hooks/useStaffOrders'
import OrderDetailDrawer from '../components/OrderDetailDrawer'
import { ORDER_STATUS, PAY_METHOD } from '../utils/orderConstants'

const fmt = n => (n || 0).toLocaleString('vi-VN')

/* ── Root Page ── */
export default function StaffOrderPage() {
  const {
    orders,
    loading,
    search,
    setSearch,
    statusF,
    setStatusF,
    selected,
    setSelected,
    toast,
    filtered,
    handleMarkDone,
  } = useStaffOrders()

  const selectedOrder = selected ? orders.find(o => o.id === selected) : null

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 text-gray-800">
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
