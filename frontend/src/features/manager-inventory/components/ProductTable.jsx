import Pagination from '../../../components/Pagination'
import { formatCurrency } from '../../../utils/formatters'

function StockBadge({ product }) {
  const n = product.availableCount
  if (!product.hasVariants) {
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">—</span>
  }
  if (n === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Hết hàng
      </span>
    )
  }
  if (n <= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Sắp hết ({n})
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      Còn {n}
    </span>
  )
}

function VariantBadge({ product }) {
  if (product.variantCount === 0) {
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Chưa có</span>
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
      product.variantCount === 1
        ? 'bg-orange-100 text-orange-700'
        : 'bg-emerald-100 text-emerald-700'
    }`}>
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
      {product.variantCount} phiên bản
    </span>
  )
}

export default function ProductTable({
  products, loading, error, activeTab,
  onEdit, onDiscontinue, onReactivate,
  page, totalPages, onPageChange, totalItems, rangeStart, rangeEnd,
}) {
  if (loading) {
    return <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
  }
  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded px-5 py-4 text-red-600 text-sm">{error}</div>
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[950px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Ảnh', 'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Giá từ', 'Tồn kho', 'Phiên bản', 'Thao tác'].map((h) => (
                <th key={h} className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0
              ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy sản phẩm nào</td></tr>
              : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-4 py-3">
                    {p.imageUrl ? (
                      <div className="relative group/img w-fit">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover border border-gray-100 cursor-zoom-in"
                        />
                        {/* Hover preview tooltip */}
                        <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-50
                                        opacity-0 group-hover/img:opacity-100 transition-opacity duration-150
                                        bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-[150px] h-[150px] object-contain rounded-lg"
                          />
                          <p className="text-[10px] text-gray-400 text-center mt-1.5 max-w-[150px] truncate">{p.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">N/A</div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-800">{p.name || '—'}</td>
                  <td className="px-4 py-4 text-gray-600">{p.brandName || '—'}</td>
                  <td className="px-4 py-4 text-gray-600">{p.categoryName || '—'}</td>
                  <td className="px-4 py-4 text-gray-600">{formatCurrency(p.minPrice)}</td>
                  <td className="px-4 py-4"><StockBadge product={p} /></td>
                  <td className="px-4 py-4"><VariantBadge product={p} /></td>
                  <td className="px-4 py-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                      <button aria-label="Thao tác" type="button" onClick={() => onEdit(p)} className="text-xs text-[#E8420A] hover:text-[#C4350A] font-medium cursor-pointer px-2 py-1 rounded hover:bg-orange-50">
                        Sửa →
                      </button>
                      {activeTab === 'active' ? (
                        <button aria-label="Thao tác" type="button" onClick={() => onDiscontinue(p.id)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer px-2 py-1 rounded hover:bg-red-50">
                          Ngừng kinh doanh
                        </button>
                      ) : (
                        <button aria-label="Thao tác" type="button" onClick={() => onReactivate(p.id)} className="text-xs text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer px-2 py-1 rounded hover:bg-emerald-50">
                          Kích hoạt lại
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 bg-white">
        <span className="text-sm text-gray-500">
          {totalItems === 0 ? 'Không có sản phẩm nào' : `Hiển thị ${rangeStart} - ${rangeEnd} trên ${totalItems.toLocaleString('vi-VN')}`}
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
