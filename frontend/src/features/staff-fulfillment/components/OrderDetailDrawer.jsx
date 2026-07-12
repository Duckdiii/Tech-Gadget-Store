import { ORDER_STATUS, PAY_METHOD } from '../utils/orderConstants'

const fmt = n => (n || 0).toLocaleString('vi-VN')

export default function OrderDetailDrawer({ order, onClose, onMarkDone }) {
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
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col text-gray-800 text-left">
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
