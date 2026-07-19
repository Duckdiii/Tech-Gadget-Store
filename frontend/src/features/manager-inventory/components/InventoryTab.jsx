import StockBar from './StockBar'

const STATUS_CONFIG = {
  sap_het:  { label: 'Sắp hết',  bg: 'bg-orange-100', text: 'text-orange-600', barColor: 'bg-red-500' },
  con_hang: { label: 'Còn hàng', bg: 'bg-green-100',  text: 'text-green-700',  barColor: 'bg-green-500' },
  het_hang: { label: 'Hết hàng', bg: 'bg-gray-200',   text: 'text-gray-500',   barColor: 'bg-gray-300' },
}

export default function InventoryTab({
  productsList,
  totalItems,
  totalPages,
  page,
  setPage,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  loading,
  pageSize,
  kpiCounts = { total: 0, outOfStock: 0, noVariants: 0, noImages: 0 },
}) {
  const rangeStart = totalItems === 0 ? 0 : page * pageSize + 1
  const rangeEnd   = Math.min((page + 1) * pageSize, totalItems)

  // Tạo danh sách nút trang hiển thị (cửa sổ 5 trang)
  const pageButtons = []
  const windowStart = Math.max(0, Math.min(page - 2, totalPages - 5))
  const windowEnd   = Math.min(totalPages, windowStart + 5)
  for (let p = windowStart; p < windowEnd; p++) pageButtons.push(p)

  return (
    <>
      {/* Title row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tồn kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tổng: <span className="font-semibold text-gray-700">{totalItems.toLocaleString('vi-VN')}</span> sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded text-sm cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Hàng thẻ Thống kê KPI Kho hàng thông minh */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          {
            id: '',
            label: 'Tổng sản phẩm',
            value: kpiCounts.total,
            color: 'from-blue-500 to-indigo-600',
            textColor: 'text-blue-100',
            desc: 'Tổng số mặt hàng trong hệ thống'
          },
          {
            id: 'het_hang',
            label: 'Sản phẩm hết hàng',
            value: kpiCounts.outOfStock,
            color: 'from-red-500 to-rose-600',
            textColor: 'text-red-100',
            desc: 'Không có serial sẵn sàng bán'
          },
          {
            id: 'no_variants',
            label: 'Chưa có biến thể',
            value: kpiCounts.noVariants,
            color: 'from-amber-500 to-orange-600',
            textColor: 'text-amber-100',
            desc: 'Sản phẩm trống thông tin phân loại'
          },
          {
            id: 'no_images',
            label: 'Thiếu hình ảnh',
            value: kpiCounts.noImages,
            color: 'from-slate-500 to-zinc-700',
            textColor: 'text-slate-200',
            desc: 'Mặt hàng chưa cập nhật ảnh đại diện'
          }
        ].map(card => {
          const isSelected = statusFilter === card.id
          return (
            <button
              key={card.label}
              onClick={() => setStatusFilter(card.id)}
              className={`text-left p-5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md transition-all hover:shadow-lg cursor-pointer border-none relative overflow-hidden ${
                isSelected ? 'ring-4 ring-offset-2 ring-orange-500 scale-[1.02]' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider opacity-85">{card.label}</span>
                <span className="text-2xl font-black">{card.value.toLocaleString('vi-VN')}</span>
              </div>
              <p className="text-[10px] mt-2 opacity-75 font-medium leading-relaxed">{card.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
        >
          <option value="">Trạng thái kho</option>
          <option value="con_hang">Còn hàng</option>
          <option value="het_hang">Hết hàng</option>
          <option value="sap_het">Sắp hết</option>
          <option value="no_variants">Chưa có biến thể</option>
          <option value="no_images">Chưa có ảnh</option>
        </select>

        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('') }}
            className="text-xs text-gray-500 hover:text-red-500 font-semibold px-2 py-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
          >
            Xóa bộ lọc
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400 shrink-0">
          {totalItems === 0
            ? 'Không có sản phẩm nào'
            : `Hiển thị ${rangeStart} - ${rangeEnd} trên ${totalItems.toLocaleString('vi-VN')} sản phẩm`}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[3.5rem_1fr_8rem_8rem_12rem_8rem] gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {['ẢNH', 'SẢN PHẨM', 'DANH MỤC', 'GIÁ (VNĐ)', 'MỨC TỒN KHO', 'TRẠNG THÁI'].map((h, i) => (
            <span key={i} className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
        ) : productsList.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Không tìm thấy sản phẩm nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">
              {productsList.map(p => {
                const cfg = STATUS_CONFIG[p.status] || { label: 'N/A', bg: 'bg-gray-100', text: 'text-gray-600', barColor: 'bg-gray-200' }
                return (
                  <div
                    key={p.id}
                    className={`grid grid-cols-[3.5rem_1fr_8rem_8rem_12rem_8rem] gap-2 px-5 py-4 border-b border-gray-50 last:border-0 items-center ${p.faded ? 'opacity-50' : ''}`}
                  >
                    <img src={p.img} alt={p.name} className="w-10 h-10 rounded object-cover" onError={e => { e.target.src = 'https://placehold.co/40x40/e0e7ff/4f46e5?text=TS' }} />
                    <span className="text-sm font-semibold text-gray-800 truncate">{p.name}</span>
                    <span className="text-sm text-gray-600">{p.category}</span>
                    <span className="text-sm font-medium text-gray-800">{p.price.toLocaleString('vi-VN')}</span>
                    <StockBar stock={p.stock} maxStock={p.maxStock} barColor={cfg.barColor} />
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-sm text-gray-400">
              {totalItems === 0 ? '' : `Hiển thị ${rangeStart}–${rangeEnd} trên ${totalItems.toLocaleString('vi-VN')} sản phẩm`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >‹</button>

              {pageButtons.map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent ${
                    page === p ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >{p + 1}</button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >›</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
