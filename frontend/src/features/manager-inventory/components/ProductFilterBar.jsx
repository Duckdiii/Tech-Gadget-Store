export default function ProductFilterBar({
  search, onSearchChange,
  selectedBrand, onBrandChange, brands,
  selectedCategory, onCategoryChange, categories,
  hasFilters, onClearFilters,
  summaryText,
}) {
  return (
    <div className="bg-white rounded border border-gray-200 px-5 py-3.5 flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <label htmlFor="product-filter-search-input" className="sr-only">Tìm sản phẩm</label>
        <input id="product-filter-search-input" value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]" />
      </div>

      <select
        value={selectedBrand}
        onChange={onBrandChange}
        aria-label="Lọc theo thương hiệu"
        className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
      >
        <option value="">Tất cả thương hiệu</option>
        {brands.map(b => (
          <option key={b.id} value={b.name}>{b.name}</option>
        ))}
      </select>

      <select
        value={selectedCategory}
        onChange={onCategoryChange}
        aria-label="Lọc theo danh mục"
        className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A] cursor-pointer"
      >
        <option value="">Tất cả danh mục</option>
        {categories.map(c => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </select>

      {hasFilters && (
        <button aria-label="Lọc"
          type="button"
          onClick={onClearFilters}
          className="text-xs text-gray-500 hover:text-red-500 font-semibold px-2 py-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
        >
          Xóa bộ lọc
        </button>
      )}

      <span className="ml-auto text-xs text-gray-400 shrink-0">
        {summaryText}
      </span>
    </div>
  )
}
