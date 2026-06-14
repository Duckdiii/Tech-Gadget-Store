import { useState } from 'react'

const fmt = n => n.toLocaleString('vi-VN')

const ORDER_STATUS = {
  processing: { label:'Đang xử lý',   bg:'bg-orange-50',   text:'text-[#C4350A]'  },
  pending:    { label:'Chờ xác nhận', bg:'bg-amber-100',  text:'text-amber-700' },
  shipping:   { label:'Đang giao',    bg:'bg-purple-100', text:'text-purple-700'},
  overdue:    { label:'Quá hạn',      bg:'bg-red-100',    text:'text-red-600'   },
  completed:  { label:'Hoàn thành',   bg:'bg-green-100',  text:'text-green-700' },
}

const PAY_METHOD = {
  card:    { label:'Thẻ Visa / Master', icon:'💳' },
  momo:    { label:'MoMo',             icon:'📱' },
  banking: { label:'Chuyển khoản',     icon:'🏦' },
  cod:     { label:'Tiền mặt (COD)',   icon:'💵' },
}

const ORDERS = [
  {
    id:'#ORD-240613-001', date:'13/06/2024', time:'09:15',
    customer:{ name:'Nguyễn Văn A', phone:'0901 234 567', email:'nguyenvana@gmail.com', address:'123 Nguyễn Huệ, Q1, TP.HCM' },
    items:[
      { name:'iPhone 15 Pro Max 256GB', sku:'APL-IP15PM', qty:1, price:29990000 },
      { name:'AirPods Pro 2nd Gen',     sku:'APL-APP2',   qty:1, price:5990000  },
    ],
    payMethod:'card', status:'processing', note:'Giao giờ hành chính',
  },
  {
    id:'#ORD-240613-002', date:'13/06/2024', time:'10:40',
    customer:{ name:'Trần Thị B', phone:'0912 345 678', email:'tranthib@gmail.com', address:'45 Lê Lợi, Q3, TP.HCM' },
    items:[{ name:'MacBook Air M3 13"', sku:'APL-MBA-M3', qty:1, price:29990000 }],
    payMethod:'banking', status:'pending', note:'',
  },
  {
    id:'#ORD-240612-008', date:'12/06/2024', time:'14:30',
    customer:{ name:'Lê Văn C', phone:'0923 456 789', email:'levanc@gmail.com', address:'78 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM' },
    items:[
      { name:'Samsung Galaxy S24 Ultra', sku:'SAM-S24U', qty:1, price:27990000 },
      { name:'Samsung 65" QLED TV',      sku:'SAM-TV65', qty:1, price:22990000 },
      { name:'Sony WH-1000XM5',          sku:'SON-WH5',  qty:1, price:7990000  },
    ],
    payMethod:'momo', status:'overdue', note:'Khách yêu cầu giao trước 5pm',
  },
  {
    id:'#ORD-240612-005', date:'12/06/2024', time:'11:00',
    customer:{ name:'Phạm Thị D', phone:'0934 567 890', email:'phamthid@gmail.com', address:'12 Cách Mạng Tháng 8, Q10, TP.HCM' },
    items:[{ name:'Apple Watch Series 9 45mm', sku:'APL-AW9', qty:1, price:10990000 }],
    payMethod:'cod', status:'overdue', note:'',
  },
  {
    id:'#ORD-240613-003', date:'13/06/2024', time:'07:55',
    customer:{ name:'Hoàng Văn E', phone:'0945 678 901', email:'hoangvane@gmail.com', address:'33 Võ Văn Tần, Q3, TP.HCM' },
    items:[
      { name:'iPad Pro 11" M4', sku:'APL-IPD', qty:1, price:23990000 },
      { name:'AirPods Pro 2nd Gen', sku:'APL-APP2', qty:1, price:5990000 },
    ],
    payMethod:'card', status:'shipping', note:'',
  },
  {
    id:'#ORD-240611-010', date:'11/06/2024', time:'16:20',
    customer:{ name:'Vũ Thị F', phone:'0956 789 012', email:'vuthif@gmail.com', address:'9 Nguyễn Đình Chiểu, Q.Phú Nhuận, TP.HCM' },
    items:[{ name:'Sony WH-1000XM5', sku:'SON-WH5', qty:2, price:7990000 }],
    payMethod:'banking', status:'completed', note:'',
  },
]

/* ── Order Detail Drawer ── */
function OrderDetailDrawer({ order, onClose, onMarkDone }) {
  const subtotal = order.items.reduce((s,i) => s + i.qty*i.price, 0)
  const ship = 30000
  const total = subtotal + ship
  const st = ORDER_STATUS[order.status]
  const pm = PAY_METHOD[order.payMethod]

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 px-6 pt-5 pb-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded cursor-pointer">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <p className="text-sm font-bold opacity-70">Đơn hàng</p>
          <h2 className="text-xl font-black mt-0.5 font-mono">{order.id}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
            <span className="text-sm opacity-70">{order.date} · {order.time}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Customer */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Thông tin khách hàng</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
              <div className="flex gap-2 items-center">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="font-semibold text-gray-800">{order.customer.name}</span>
              </div>
              <div className="flex gap-2 items-center">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-gray-600">{order.customer.phone}</span>
              </div>
              <div className="flex gap-2 items-start">
                <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-gray-600 text-xs">{order.customer.address}</span>
              </div>
              {order.note && (
                <div className="flex gap-2 items-start pt-1 border-t border-gray-100">
                  <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="text-amber-700 text-xs font-medium">{order.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sản phẩm ({order.items.length})</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded px-4 py-3">
                  <div className="w-10 h-10 bg-white rounded border border-gray-100 flex items-center justify-center text-lg shrink-0">📦</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                    <p className="text-[11px] text-gray-400">{item.sku} · SL: {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 shrink-0">{fmt(item.qty * item.price)}đ</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Thanh toán</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Tạm tính</span><span>{fmt(subtotal)}đ</span></div>
              <div className="flex justify-between text-gray-500"><span>Phí giao hàng</span><span>{fmt(ship)}đ</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-800 text-base"><span>Tổng cộng</span><span className="text-teal-700">{fmt(total)}đ</span></div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-gray-500">
                <span>{pm.icon}</span><span>{pm.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {(order.status === 'processing' || order.status === 'pending') && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button onClick={() => onMarkDone(order.id)} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-bold cursor-pointer transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Xác nhận xử lý xong
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/* ── Root Page ── */
export default function StaffOrderPage() {
  const [orders, setOrders]   = useState(ORDERS)
  const [search, setSearch]   = useState('')
  const [statusF, setStatusF] = useState('')
  const [selected, setSelected] = useState(null)
  const [toast, setToast]     = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    return (
      (!q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q)) &&
      (!statusF || o.status === statusF)
    )
  })

  function handleMarkDone(id) {
    setOrders(p => p.map(o => o.id === id ? { ...o, status:'completed' } : o))
    setSelected(null)
    showToast('Đã đánh dấu hoàn thành')
  }

  const selectedOrder = selected ? orders.find(o => o.id === selected) : null

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hỗ trợ đơn hàng</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tra cứu và xác nhận xử lý đơn hàng</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">LD</div>
        </div>
      </header>

      <div className="flex-1 px-8 py-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã đơn, tên khách, SĐT..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span className="ml-auto text-xs text-gray-400 shrink-0">{filtered.length} đơn</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Mã đơn','Khách hàng','Ngày đặt','Sản phẩm','Tổng tiền','Thanh toán','Trạng thái',''].map((h,i) => (
                  <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy đơn hàng nào</td></tr>
                : filtered.map(o => {
                  const st = ORDER_STATUS[o.status]
                  const total = o.items.reduce((s,i) => s + i.qty*i.price, 0) + 30000
                  const pm = PAY_METHOD[o.payMethod]
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-4 py-4 font-mono text-xs font-bold text-gray-700">{o.id}</td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-gray-800">{o.customer.name}</p>
                        <p className="text-[11px] text-gray-400">{o.customer.phone}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-700">{o.date}</p>
                        <p className="text-[11px] text-gray-400">{o.time}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600">{o.items.length} SP</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-800">{fmt(total)}đ</td>
                      <td className="px-4 py-4 text-xs text-gray-600">{pm.icon} {pm.label}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => setSelected(o.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-teal-50">
                          Chi tiết →
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onMarkDone={handleMarkDone}
        />
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-[70]">{toast}</div>}
    </div>
  )
}
