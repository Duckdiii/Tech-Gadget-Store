import { useState, useEffect } from 'react'
import { getProductsForPromotion } from '../services/promotionService'

export default function PromotionProductSelector({ selectedProductIds, onChange }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    setLoading(true)
    getProductsForPromotion()
      .then((res) => setProducts(res?.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(products.map((p) => p.categoryName || 'General'))]

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim()
    const matchesSearch = !q || p.name?.toLowerCase().includes(q)
    const matchesCategory = !category || (p.categoryName || 'General') === category
    return matchesSearch && matchesCategory
  })

  const handleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map(p => p.id)
    const newIds = [...new Set([...selectedProductIds, ...visibleIds])]
    onChange(newIds)
  }

  const handleDeselectAllVisible = () => {
    const visibleIds = filteredProducts.map(p => p.id)
    const visibleSet = new Set(visibleIds)
    const newIds = selectedProductIds.filter(id => !visibleSet.has(id))
    onChange(newIds)
  }

  const toggleProduct = (id) => {
    const nextIds = selectedProductIds.includes(id)
      ? selectedProductIds.filter((p) => p !== id)
      : [...selectedProductIds, id]
    onChange(nextIds)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="block text-xs font-semibold text-gray-600">
          Sản phẩm áp dụng * ({selectedProductIds.length} đã chọn)
        </span>
        <div className="flex gap-2 text-xs font-bold text-[#E8420A]">
          <button aria-label="Thao tác" type="button"
            onClick={handleSelectAllVisible}
            className="hover:underline cursor-pointer border-none bg-transparent text-[#E8420A] p-0"
          >
            Chọn tất cả hiển thị
          </button>
          <span>·</span>
          <button aria-label="Thao tác" type="button"
            onClick={handleDeselectAllVisible}
            className="hover:underline cursor-pointer border-none bg-transparent text-[#E8420A] p-0"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      </div>

      {/* Search & Filter sub-row */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label htmlFor="promo-search-products" className="block text-xs font-semibold text-gray-500 mb-1">Tìm sản phẩm</label>
          <input
            id="promo-search-products"
            type="text"
            placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-700"
          />
        </div>
        <div>
          <label htmlFor="promo-filter-category" className="block text-xs font-semibold text-gray-500 mb-1">Danh mục</label>
          <select
            id="promo-filter-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded px-2.5 py-1 text-xs bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-3 text-center">Đang tải sản phẩm...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-sm text-gray-400 py-3 text-center bg-gray-50 border border-dashed border-gray-200 rounded">Không tìm thấy sản phẩm nào</div>
      ) : (
        <div className="border border-gray-200 rounded max-h-40 overflow-y-auto divide-y divide-gray-100 bg-white">
          {(() => {
            const selectedSet = new Set(selectedProductIds)
            return filteredProducts.map((p) => (
              <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSet.has(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="accent-[#E8420A] w-4 h-4 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-gray-700 font-medium truncate">{p.name}</span>
                  <span className="text-[10px] text-gray-400">{p.categoryName || 'General'}</span>
                </div>
              </label>
            ))
          })()}
        </div>
      )}
    </div>
  )
}
