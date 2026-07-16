import { useWishlistSection } from '../hooks/useWishlistSection'

const CATEGORY_STYLE = {
  'Laptop':         { bg: 'from-slate-600 to-slate-800' },
  'Điện thoại':     { bg: 'from-slate-600 to-slate-800' },
  'Tai nghe':       { bg: 'from-purple-500 to-violet-600' },
  'Màn hình':       { bg: 'from-teal-500 to-cyan-600' },
  'Máy tính bảng':  { bg: 'from-orange-400 to-amber-500' },
}

function ProductThumb({ category }) {
  const bg = CATEGORY_STYLE[category]?.bg || 'from-gray-400 to-gray-600'
  const icons = {
    'Laptop': <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4M9 3a2 2 0 000 4h6a2 2 0 000-4M9 3h6M3 19h18" />,
    'Điện thoại': <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    'Tai nghe': <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />,
    'Màn hình': <><rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" /></>,
    'Máy tính bảng': <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br ${bg} flex items-center justify-center`}>
      <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        {icons[category] || <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />}
      </svg>
    </div>
  )
}

function StockBadge({ stock }) {
  const map = {
    in_stock: ['bg-green-500', 'text-green-600', 'Còn hàng'],
    low: ['bg-orange-400', 'text-orange-600', 'Sắp hết'],
    out: ['bg-red-400', 'text-red-600', 'Hết hàng']
  }
  const [dot, text, label] = map[stock] || map.in_stock
  return (
    <span className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className={`text-[11px] font-medium ${text}`}>{label}</span>
    </span>
  )
}

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + 'đ'
}

export default function WishlistSection() {
  const {
    items,
    loading,
    sort,
    setSort,
    view,
    setView,
    toast,
    removing,
    removeItem,
    sorted,
    getDiscount,
  } = useWishlistSection()

  if (loading) {
    return <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải danh sách yêu thích...</div>
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-3 rounded shadow-2xl">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {toast}
        </div>
      )}

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden text-gray-800">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sản phẩm yêu thích</h2>
            <p className="text-sm text-gray-400 mt-0.5">{items.length} sản phẩm đang theo dõi</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded overflow-hidden">
              {[['grid', <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>],
                ['list', <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>]
              ].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-2 transition-colors border-none cursor-pointer ${view === v ? 'bg-[var(--accent)] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                </button>
              ))}
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 cursor-pointer">
              <option value="newest">Mới thêm</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
              <option value="discount">Giảm nhiều nhất</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {items.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-bold text-lg">Chưa có sản phẩm yêu thích</p>
                <p className="text-gray-400 text-sm mt-1 max-w-xs">Thêm sản phẩm vào danh sách để dễ dàng theo dõi giá và mua sau</p>
              </div>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {sorted.map(item => {
                const disc = getDiscount(item)
                return (
                  <div key={item.id}
                    className={`border border-gray-100 rounded overflow-hidden hover:border-[#E8420A]/30 hover:shadow-md transition-all duration-300 ${removing === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    {/* Thumb */}
                    <div className="relative aspect-[4/3]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ProductThumb category={item.category} />
                      )}
                      {disc > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">-{disc}%</span>
                      )}
                      <button onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center shadow transition-colors border-none cursor-pointer group">
                        <svg className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    {/* Info */}
                    <div className="p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-bold text-[var(--accent)] bg-orange-50 px-1.5 py-0.5 rounded">{item.brand}</span>
                        <span className="text-[10px] text-gray-400">{item.category}</span>
                      </div>
                      <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[36px]">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-yellow-400 text-xs leading-none">{'★'.repeat(Math.floor(item.rating))}</span>
                        <span className="text-[10px] text-gray-400">({item.reviews})</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-[15px] font-bold text-[var(--accent)]">{fmt(item.price)}</p>
                        {item.original && <p className="text-[11px] text-gray-400 line-through">{fmt(item.original)}</p>}
                      </div>
                      <div className="mt-1.5"><StockBadge stock={item.stock} /></div>
                      <button disabled={item.stock === 'out'}
                        className={`mt-3 w-full py-2 text-[12px] font-semibold rounded transition-colors border-none cursor-pointer ${item.stock === 'out' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[var(--accent)] hover:bg-[var(--accent-d)] text-white'}`}>
                        {item.stock === 'out' ? 'Hết hàng' : 'Yêu thích'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map(item => {
                const disc = getDiscount(item)
                return (
                  <div key={item.id}
                    className={`flex gap-4 border border-gray-100 rounded p-4 hover:border-[#E8420A]/30 hover:shadow-sm transition-all duration-300 ${removing === item.id ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
                    {/* Thumb */}
                    <div className="w-24 h-24 rounded overflow-hidden shrink-0 relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ProductThumb category={item.category} />
                      )}
                      {disc > 0 && <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">-{disc}%</span>}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-[var(--accent)] bg-orange-50 px-1.5 py-0.5 rounded">{item.brand}</span>
                            <span className="text-[10px] text-gray-400">{item.category}</span>
                          </div>
                          <p className="text-[14px] font-semibold text-gray-800 leading-snug line-clamp-2">{item.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-400 text-xs">{'★'.repeat(Math.floor(item.rating))}</span>
                            <span className="text-[11px] text-gray-400">({item.reviews})</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors border-none cursor-pointer group bg-transparent">
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <p className="text-[16px] font-bold text-[var(--accent)]">{fmt(item.price)}</p>
                          {item.original && <p className="text-[11px] text-gray-400 line-through">{fmt(item.original)}</p>}
                          <div className="mt-1"><StockBadge stock={item.stock} /></div>
                        </div>
                        <button disabled={item.stock === 'out'}
                          className={`px-4 py-2 text-[12px] font-semibold rounded transition-colors border-none cursor-pointer ${item.stock === 'out' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[var(--accent)] hover:bg-[var(--accent-d)] text-white'}`}>
                          {item.stock === 'out' ? 'Hết hàng' : 'Yêu thích'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
