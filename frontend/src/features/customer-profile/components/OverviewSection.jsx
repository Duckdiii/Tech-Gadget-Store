
const OVERVIEW_ORDERS = [
  {
    id: '#ORD-2603001988', date: '28/03/2026', status: 'Đã nhận hàng', statusClass: 'text-green-700',
    statusBg: 'bg-green-50 border-green-200',
    total: 24500000, product: 'MacBook Pro 14" M3 Pro 512GB Space Black', extra: 'Cùng 1 sản phẩm khác', img: 'Mac',
  },
  {
    id: '#ORD-2507001033', date: '15/07/2025', status: 'Đang giao hàng', statusClass: 'text-[#E8420A]',
    statusBg: 'bg-orange-50 border-orange-200',
    total: 29490000, product: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', extra: 'Cùng 2 sản phẩm khác', img: 'iOS',
  },
  {
    id: '#ORD-2506000871', date: '02/06/2025', status: 'Đang xử lý', statusClass: 'text-orange-700',
    statusBg: 'bg-orange-50 border-orange-200',
    total: 6490000, product: 'AirPods Pro 2nd Generation USB-C', extra: null, img: 'APods',
  },
]

const WISHLIST = [
  { name: 'Laptop Acer Gaming Aspire 7 A715', price: 21490000, original: 23990000 },
  { name: 'Xiaomi Redmi Note 14 6GB 128GB',   price: 4690000,  original: 4990000  },
  { name: 'Laptop ASUS Vivobook S14 S3407VA', price: 19990000, original: 22990000 },
  { name: 'Màn hình Gaming LG UltraGear 27"', price: 2690000,  original: 3990000  },
  { name: 'Xiaomi Pad 7 Pro 8GB 256GB',       price: 13740000, original: null      },
  { name: 'RAM Laptop Transcend DDR5 4800MHz',price: 6490000,  original: 9990000  },
]

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + 'đ'
}

export default function OverviewSection({ banners, onDismiss, onNavigate }) {
  return (
    <div className="space-y-5">
      {/* Banners */}
      {banners.map(b => (
        <div key={b.id} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 transition-all duration-200"
          style={{ boxShadow: '0 4px 12px rgba(232,66,10,0.05)' }}>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#E8420A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-800">{b.text}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <button
              onClick={() => b.action && onNavigate(b.action)}
              className="text-xs font-black text-white px-4 py-2 transition-all cursor-pointer border-none"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(232,66,10,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              {b.cta}
            </button>
            <button onClick={() => onDismiss(b.id)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Recent orders */}
      <div className="bg-white overflow-hidden"
        style={{ border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Đơn hàng gần đây</h2>
          <button onClick={() => onNavigate('orders')} className="text-sm text-[#E8420A] hover:text-[#c93808] font-bold transition-all cursor-pointer flex items-center gap-1 border-none bg-transparent">
            Xem tất cả
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {OVERVIEW_ORDERS.map(order => (
            <div key={order.id} className="px-6 py-5 flex items-center gap-5 hover:bg-gray-50/50 transition-colors">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shrink-0 text-xs font-extrabold text-gray-500 border border-gray-200 shadow-sm">
                {order.img}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-black text-gray-800">{order.id}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs font-semibold text-gray-500">{order.date}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug truncate">{order.product}</p>
                {order.extra && <p className="text-xs text-gray-400 mt-1">{order.extra}</p>}
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full border"
                  style={{ backgroundColor: order.status === 'Đã nhận hàng' ? 'rgba(34,197,94,0.06)' : 'rgba(232,66,10,0.06)', color: order.status === 'Đã nhận hàng' ? '#15803d' : '#E8420A', borderColor: order.status === 'Đã nhận hàng' ? '#bbf7d0' : '#fed7aa' }}>
                  {order.status}
                </span>
                <p className="text-base font-black text-[#E8420A]">{fmt(order.total)}</p>
                <button onClick={() => onNavigate('orders')} className="text-xs text-gray-500 hover:text-[#E8420A] font-bold transition-all cursor-pointer flex items-center gap-0.5 ml-auto border-none bg-transparent">
                  Chi tiết <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wishlist */}
      <div className="bg-white overflow-hidden"
        style={{ border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Sản phẩm yêu thích</h2>
          <button onClick={() => onNavigate('wishlist')} className="text-sm text-[#E8420A] hover:text-[#c93808] font-bold transition-all cursor-pointer flex items-center gap-1 border-none bg-transparent">
            Xem tất cả <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-px bg-gray-100">
          {WISHLIST.map((item, i) => (
            <div key={i} className="bg-white px-4 py-4 hover:bg-orange-50/30 cursor-pointer transition-colors group">
              <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center text-xs text-gray-400 font-extrabold border border-gray-200 shadow-sm group-hover:border-orange-200 transition-colors">IMG</div>
              <p className="text-xs text-gray-800 font-bold leading-snug line-clamp-2 min-h-[2.5rem]">{item.name}</p>
              <p className="text-sm font-black text-[#E8420A] mt-2">{fmt(item.price)}</p>
              {item.original && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-gray-400 line-through">{fmt(item.original)}</p>
                  <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                    -{Math.round((1 - item.price / item.original) * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
