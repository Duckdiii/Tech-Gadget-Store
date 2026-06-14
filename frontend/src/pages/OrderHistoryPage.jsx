import { useState } from 'react'
import { useNav } from '../hooks/useNav'

/* ── shared ── */
function fmt(n) { return n.toLocaleString('vi-VN') + ' đ' }

const STATUS_CFG = {
  completed:  { label: 'Đã hoàn thành', dot: 'bg-green-500',  bg: 'bg-green-100',  text: 'text-green-700'  },
  shipping:   { label: 'Đang giao',     dot: 'bg-[#E8420A]',   bg: 'bg-orange-50',   text: 'text-[#C4350A]'   },
  processing: { label: 'Đang xử lý',   dot: 'bg-orange-400', bg: 'bg-orange-100', text: 'text-orange-600' },
  pending:    { label: 'Chờ xác nhận', dot: 'bg-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cancelled:  { label: 'Đã hủy',       dot: 'bg-red-400',    bg: 'bg-red-100',    text: 'text-red-600'    },
  refunded:   { label: 'Đã hoàn tiền', dot: 'bg-purple-400', bg: 'bg-purple-100', text: 'text-purple-700' },
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

function PayIcon({ type, cls = 'w-4 h-4' }) {
  if (type === 'card') return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
  if (type === 'momo') return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  if (type === 'zalopay') return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
  if (type === 'banking') return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
  return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
}

/* ══════════════════════════════════════
   ORDER LIST TAB
══════════════════════════════════════ */
const ORDER_FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'completed', label: 'Đã hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
  { id: 'refunded', label: 'Đã hoàn tiền' },
]

const ORDERS = [
  { id: '#ORD-2024-061301', date: '13/06/2024', time: '10:32', customer: 'Nguyễn Văn A',    total: 32990000, payment: { icon: 'card',    label: 'Thẻ Visa *4242' },          status: 'completed'  },
  { id: '#ORD-2024-061302', date: '13/06/2024', time: '09:15', customer: 'Trần Thị B',      total: 12200000, payment: { icon: 'momo',    label: 'Ví MoMo' },                  status: 'shipping'   },
  { id: '#ORD-2024-061201', date: '12/06/2024', time: '14:22', customer: 'Lê Hoàng C',      total: 5400000,  payment: { icon: 'banking', label: 'Chuyển khoản NH' },          status: 'processing' },
  { id: '#ORD-2024-061101', date: '11/06/2024', time: '11:30', customer: 'Hoàng Thị E',     total: 1250000,  payment: { icon: 'cod',     label: 'COD' },                      status: 'pending'    },
  { id: '#ORD-2024-060501', date: '05/06/2024', time: '16:05', customer: 'Phạm Văn D',      total: 8900000,  payment: { icon: 'card',    label: 'Thẻ Mastercard *1234' },     status: 'cancelled'  },
  { id: '#ORD-2024-061001', date: '10/06/2024', time: '08:55', customer: 'Nguyễn Văn A',    total: 24500000, payment: { icon: 'zalopay', label: 'ZaloPay' },                  status: 'refunded'   },
]

function OrderListTab() {
  const onNavigate = useNav()
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage]   = useState(1)

  const filtered = activeFilter === 'all' ? ORDERS : ORDERS.filter(o => o.status === activeFilter)

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded text-sm cursor-pointer">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            01/06/2024 — 13/06/2024
          </button>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Xuất Excel
          </button>
        </div>
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

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[160px_120px_140px_1fr_140px_120px_100px] px-6 py-3.5 border-b border-gray-100 bg-gray-50">
          {['MÃ ĐƠN','NGÀY ĐẶT','KHÁCH HÀNG','THANH TOÁN','TỔNG TIỀN','TRẠNG THÁI',''].map((h, i) => (
            <span key={i} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i === 6 ? 'text-right' : ''}`}>{h}</span>
          ))}
        </div>
        {filtered.map((order, i) => {
          const isCancelled = order.status === 'cancelled'
          return (
            <div key={order.id} className={`grid grid-cols-[160px_120px_140px_1fr_140px_120px_100px] px-6 py-4 items-center ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50`}>
              <span className={`text-sm font-mono font-semibold ${isCancelled ? 'text-gray-400' : 'text-gray-800'}`}>{order.id}</span>
              <div className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                <p className="text-sm">{order.date}</p>
                <p className="text-xs text-gray-400">{order.time}</p>
              </div>
              <span className={`text-sm font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-700'}`}>{order.customer}</span>
              <div className={`flex items-center gap-2 text-sm ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                <PayIcon type={order.payment.icon} />
                <span>{order.payment.label}</span>
              </div>
              <span className={`text-sm font-bold ${isCancelled ? 'text-gray-400' : 'text-gray-900'}`}>{fmt(order.total)}</span>
              <StatusBadge status={order.status} />
              <div className="text-right">
                <button onClick={() => !isCancelled && onNavigate('invoice')} className={`text-sm font-medium cursor-pointer ${isCancelled ? 'text-gray-300' : 'text-[#E8420A] hover:underline'}`}>
                  Chi tiết →
                </button>
              </div>
            </div>
          )
        })}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-sm text-gray-400">Hiển thị {filtered.length} / 24 đơn hàng</span>
          <div className="flex items-center gap-1">
            {[1,2,3].map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded text-sm font-medium cursor-pointer ${currentPage===p ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
            ))}
            <span className="px-1 text-gray-300">…</span>
            <button onClick={() => setCurrentPage(5)} className={`w-8 h-8 rounded text-sm font-medium cursor-pointer ${currentPage===5 ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>5</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════
   PAYMENT LOG TAB
══════════════════════════════════════ */
const PAY_STATUS = {
  success:  { label: 'Thành công', bg: 'bg-green-100',  text: 'text-green-700',  icon: '✓' },
  failed:   { label: 'Thất bại',   bg: 'bg-red-100',    text: 'text-red-600',    icon: '✕' },
  refunded: { label: 'Hoàn tiền',  bg: 'bg-purple-100', text: 'text-purple-700', icon: '↩' },
  pending:  { label: 'Chờ xử lý', bg: 'bg-amber-100',  text: 'text-amber-700',  icon: '…' },
}

const METHOD_COLOR = {
  card:    { bg: 'bg-orange-50',   icon: 'text-[#E8420A]'   },
  momo:    { bg: 'bg-pink-50',   icon: 'text-pink-600'   },
  zalopay: { bg: 'bg-cyan-50',   icon: 'text-cyan-600'   },
  banking: { bg: 'bg-green-50',  icon: 'text-green-600'  },
  cod:     { bg: 'bg-amber-50',  icon: 'text-amber-600'  },
}

const PAYMENT_LOGS = [
  { id: 'TXN-240613-001', orderId: '#ORD-2024-061301', date: '13/06/2024', time: '10:32:15', customer: { name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901 234 567' }, method: 'card',    methodLabel: 'Thẻ Visa *4242',            bank: 'Vietcombank', gateway: 'VNPay',   gatewayRef: 'VCB240613-8921', amount: 32990000, fee: 0,      status: 'success',  note: '' },
  { id: 'TXN-240613-002', orderId: '#ORD-2024-061302', date: '13/06/2024', time: '09:15:44', customer: { name: 'Trần Thị B',   email: 'tranthib@gmail.com',      phone: '0912 345 678' }, method: 'momo',    methodLabel: 'Ví MoMo',                   bank: '—',            gateway: 'MoMo',    gatewayRef: 'MM240613-2234',  amount: 12200000, fee: 0,      status: 'success',  note: '' },
  { id: 'TXN-240612-001', orderId: '#ORD-2024-061201', date: '12/06/2024', time: '14:22:05', customer: { name: 'Lê Hoàng C',   email: 'lehoangc@company.vn',     phone: '0923 456 789' }, method: 'banking', methodLabel: 'Chuyển khoản — Techcombank',  bank: 'Techcombank',  gateway: 'VNPay',   gatewayRef: 'TCB240612-5531', amount: 5400000,  fee: 0,      status: 'failed',   failReason: 'Tài khoản không đủ số dư', note: '' },
  { id: 'TXN-240612-002', orderId: '#ORD-2024-060501', date: '12/06/2024', time: '16:05:30', customer: { name: 'Phạm Văn D',   email: 'phamvand99@gmail.com',    phone: '0934 567 890' }, method: 'card',    methodLabel: 'Thẻ Mastercard *1234',       bank: 'BIDV',         gateway: 'VNPay',   gatewayRef: 'BIDV240612-7782',amount: 8900000,  fee: 0,      status: 'refunded', refundDate: '13/06/2024 09:00', note: 'Khách huỷ đơn' },
  { id: 'TXN-240611-001', orderId: '#ORD-2024-061101', date: '11/06/2024', time: '11:30:00', customer: { name: 'Hoàng Thị E',  email: 'hoang.e@gmail.com',       phone: '0945 678 901' }, method: 'cod',     methodLabel: 'Thanh toán khi nhận hàng',   bank: '—',            gateway: 'COD',     gatewayRef: '—',              amount: 1250000,  fee: 0,      status: 'pending',  note: 'Chờ giao hàng' },
  { id: 'TXN-240610-001', orderId: '#ORD-2024-061001', date: '10/06/2024', time: '08:55:20', customer: { name: 'Nguyễn Văn A', email: 'nguyenvana@example.com',  phone: '0901 234 567' }, method: 'zalopay', methodLabel: 'ZaloPay',                    bank: '—',            gateway: 'ZaloPay', gatewayRef: 'ZLP240610-3321', amount: 24500000, fee: 0,      status: 'success',  note: '' },
  { id: 'TXN-240608-001', orderId: '#ORD-2024-060801', date: '08/06/2024', time: '17:10:44', customer: { name: 'Trần Thị B',   email: 'tranthib@gmail.com',      phone: '0912 345 678' }, method: 'momo',    methodLabel: 'Ví MoMo',                   bank: '—',            gateway: 'MoMo',    gatewayRef: 'MM240608-9911',  amount: 5990000,  fee: 0,      status: 'failed',   failReason: 'Hết thời gian giao dịch (timeout)', note: '' },
]

function TxnDetailModal({ txn, onClose }) {
  const ps = PAY_STATUS[txn.status]
  const mc = METHOD_COLOR[txn.method]

  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [refunded, setRefunded]                   = useState(false)

  function doRefund() {
    setRefunded(true)
    setShowRefundConfirm(false)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
          {/* Status hero */}
          <div className={`px-6 pt-6 pb-5 ${txn.status === 'success' ? 'bg-green-50' : txn.status === 'failed' ? 'bg-red-50' : txn.status === 'refunded' ? 'bg-purple-50' : 'bg-amber-50'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold ${txn.status === 'success' ? 'bg-green-500 text-white' : txn.status === 'failed' ? 'bg-red-500 text-white' : txn.status === 'refunded' ? 'bg-purple-500 text-white' : 'bg-amber-400 text-white'}`}>
                  {ps.icon}
                </div>
                <div>
                  <p className={`text-base font-bold ${ps.text}`}>{ps.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{txn.date} · {txn.time}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded cursor-pointer">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-gray-900">{fmt(txn.amount)}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{txn.id}</p>
            </div>
            {txn.failReason && (
              <div className="mt-3 bg-red-100 border border-red-200 rounded px-3 py-2 text-xs text-red-600 font-medium">
                ⚠ Lý do thất bại: {txn.failReason}
              </div>
            )}
            {(txn.status === 'refunded' || refunded) && (
              <div className="mt-3 bg-purple-100 border border-purple-200 rounded px-3 py-2 text-xs text-purple-700 font-medium">
                ↩ Đã hoàn tiền{txn.refundDate ? ` ngày ${txn.refundDate}` : ''}{refunded && ' (vừa xử lý)'}
              </div>
            )}
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Order info */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Thông tin đơn hàng</p>
              <div className="space-y-2.5">
                <Row label="Mã đơn hàng"  value={<span className="font-mono font-semibold text-[#E8420A]">{txn.orderId}</span>} />
                <Row label="Khách hàng"    value={txn.customer.name} />
                <Row label="Email"         value={txn.customer.email} />
                <Row label="Số điện thoại" value={txn.customer.phone} />
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Payment method */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Phương thức thanh toán</p>
              <div className={`flex items-center gap-3 p-3 rounded mb-3 ${mc.bg}`}>
                <span className={mc.icon}><PayIcon type={txn.method} cls="w-5 h-5" /></span>
                <span className="text-sm font-semibold text-gray-800">{txn.methodLabel}</span>
              </div>
              <div className="space-y-2.5">
                {txn.bank !== '—' && <Row label="Ngân hàng"      value={txn.bank} />}
                <Row label="Cổng thanh toán" value={txn.gateway} />
                <Row label="Mã GD cổng"      value={<span className="font-mono text-xs text-gray-600">{txn.gatewayRef}</span>} />
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Amount */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Chi tiết số tiền</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tổng đơn hàng</span><span className="font-medium text-gray-800">{fmt(txn.amount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Phí giao dịch</span><span className="font-medium text-gray-800">0 đ</span></div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-1">
                  <span className="font-bold text-gray-800">Thực thu</span>
                  <span className="font-black text-green-700">{fmt(txn.amount)}</span>
                </div>
              </div>
            </section>

            {txn.note && (
              <div className="bg-gray-50 rounded px-4 py-3">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Ghi chú</p>
                <p className="text-sm text-gray-700">{txn.note}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            {txn.status === 'success' && !refunded && (
              <button onClick={() => setShowRefundConfirm(true)} className="flex-1 py-2.5 border border-purple-200 text-purple-700 hover:bg-purple-50 rounded text-sm font-semibold cursor-pointer transition-colors">
                ↩ Hoàn tiền
              </button>
            )}
            {txn.status === 'failed' && (
              <button className="flex-1 py-2.5 border border-orange-200 text-[#C4350A] hover:bg-orange-50 rounded text-sm font-semibold cursor-pointer transition-colors">
                ↻ Thử lại
              </button>
            )}
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm font-semibold cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Xuất biên lai
            </button>
          </div>

          {/* Refund confirm */}
          {showRefundConfirm && (
            <>
              <div className="fixed inset-0 bg-black/50 z-[60]" />
              <div className="fixed inset-0 flex items-center justify-center z-[60]">
                <div className="bg-white rounded shadow-2xl w-[360px] p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 text-center">Xác nhận hoàn tiền?</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">Hoàn lại <span className="font-semibold text-gray-800">{fmt(txn.amount)}</span> cho <span className="font-semibold text-gray-800">{txn.customer.name}</span>?</p>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setShowRefundConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Huỷ</button>
                    <button onClick={doRefund} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold cursor-pointer">Xác nhận</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
    </div>
  )
}

function PaymentLogTab() {
  const [search, setSearch]         = useState('')
  const [methodFilter, setMethod]   = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [selected, setSelected]     = useState(null)

  const filtered = PAYMENT_LOGS.filter(l => {
    const q = search.toLowerCase()
    return (
      (!q || l.id.toLowerCase().includes(q) || l.orderId.toLowerCase().includes(q) || l.customer.name.toLowerCase().includes(q)) &&
      (!methodFilter || l.method === methodFilter) &&
      (!statusFilter || l.status === statusFilter)
    )
  })

  const totalSuccess  = filtered.filter(l => l.status === 'success').reduce((s, l) => s + l.amount, 0)
  const countFailed   = filtered.filter(l => l.status === 'failed').length
  const countRefunded = filtered.filter(l => l.status === 'refunded').length

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký thanh toán</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} giao dịch · Thu thành công: <span className="text-green-600 font-semibold">{fmt(totalSuccess)}</span>
            {countFailed > 0 && <> · <span className="text-red-500 font-semibold">{countFailed} thất bại</span></>}
            {countRefunded > 0 && <> · <span className="text-purple-600 font-semibold">{countRefunded} hoàn tiền</span></>}
          </p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Xuất Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã GD, mã đơn, khách hàng..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
        </div>
        <select value={methodFilter} onChange={e => setMethod(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Tất cả phương thức</option>
          <option value="card">Thẻ tín dụng/ghi nợ</option>
          <option value="momo">Ví MoMo</option>
          <option value="zalopay">ZaloPay</option>
          <option value="banking">Chuyển khoản NH</option>
          <option value="cod">COD</option>
        </select>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer">
          <option value="">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Hoàn tiền</option>
          <option value="pending">Chờ xử lý</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Mã giao dịch','Ngày / Giờ','Khách hàng','Phương thức','Mã đơn hàng','Số tiền','Trạng thái','Chi tiết'].map((h, i) => (
                <th key={i} className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy giao dịch nào</td></tr>
            ) : filtered.map(log => {
              const ps = PAY_STATUS[log.status]
              const mc = METHOD_COLOR[log.method]
              return (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs font-semibold text-gray-700">{log.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-800 font-medium">{log.date}</p>
                    <p className="text-xs text-gray-400">{log.time}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">{log.customer.name}</p>
                    <p className="text-xs text-gray-400">{log.customer.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded ${mc.bg}`}>
                      <span className={mc.icon}><PayIcon type={log.method} cls="w-3.5 h-3.5" /></span>
                      <span className="text-xs font-semibold text-gray-700">{log.methodLabel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-mono font-semibold text-[#E8420A]">{log.orderId}</span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-800">{fmt(log.amount)}</td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${ps.bg} ${ps.text}`}>{ps.label}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => setSelected(log)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-[#E8420A] hover:text-[#C4350A] px-3 py-1.5 rounded hover:bg-orange-50 cursor-pointer whitespace-nowrap">
                      Xem →
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

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
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Tìm kiếm đơn hàng..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <img src="https://placehold.co/34x34/f9a8d4/9d174d?text=AD" alt="avatar" className="w-8 h-8 rounded-full object-cover cursor-pointer" />
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex items-center gap-1">
          {MAIN_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
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
