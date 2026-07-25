import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import { useFavorites } from '../../../hooks/useFavorites'
import StoreNavbar from '../../../components/StoreNavbar'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import FilterPanel from '../components/FilterPanel'
import Pagination from '../components/Pagination'
import { mapApiProduct } from '../utils/mapApiProduct'
import { shopService } from '../services/shopService'
import QuickViewModal from '../components/QuickViewModal'
import BackInStockModal from '../components/BackInStockModal'

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: '' },
  { label: 'Giá thấp đến cao', value: 'price_asc' },
  { label: 'Giá cao đến thấp', value: 'price_desc' },
]

const PAGE_SIZE = 12

const COMPARISON_FIELDS = [
  { label: 'Hình ảnh', key: 'image', type: 'image' },
  { label: 'Tên sản phẩm', key: 'name', type: 'text' },
  { label: 'Giá bán', key: 'price', type: 'price' },
  { label: 'Thương hiệu', key: 'brand', type: 'text' },
  { label: 'Danh mục', key: 'category', type: 'text' },
  { label: 'CPU', key: 'cpu', type: 'text' },
  { label: 'Đồ họa (GPU)', key: 'gpu', type: 'text' },
  { label: 'Bộ nhớ RAM', key: 'ram', type: 'text' },
  { label: 'Bộ nhớ trong', key: 'storage', type: 'text' },
  { label: 'Kích thước màn hình', key: 'screenSize', type: 'screen' },
  { label: 'Độ phân giải', key: 'resolution', type: 'text' },
  { label: 'Chipset', key: 'chipset', type: 'text' },
  { label: 'Dung lượng Pin', key: 'batteryCapacity', type: 'battery' },
  { label: 'Hệ điều hành', key: 'operatingSystem', type: 'text' },
  { label: 'Tần số quét', key: 'refreshRate', type: 'refresh' },
  { label: 'Tấm nền', key: 'panelType', type: 'text' },
  { label: 'Kết nối không dây', key: 'isWireless', type: 'boolean' },
  { label: 'Chống ồn ANC', key: 'hasNoiseCancelling', type: 'boolean' },
  { label: 'Định vị GPS', key: 'hasGps', type: 'boolean' },
  { label: 'Kháng nước', key: 'isWaterResistant', type: 'boolean' }
]

// Bộ lọc rỗng — shape chuẩn dùng chung với FilterPanel, khớp các field của ProductFilterRequestDto.
const EMPTY_FILTERS = {
  keyword: '',
  brandNames: [],
  categoryNames: [],
  minPrice: undefined,
  maxPrice: undefined,
  ramGb: [],
  storageGb: [],
  colors: [],
  // Phone-specific
  operatingSystem: undefined,
  minScreenSize: undefined,
  maxScreenSize: undefined,
  minBatteryCapacity: undefined,
  maxBatteryCapacity: undefined,
  chipset: undefined,
  simType: undefined,
  nfcSupported: undefined,
  // Laptop-specific
  cpuKeyword: undefined,
  gpuKeyword: undefined,
  minWeight: undefined,
  maxWeight: undefined,
  // Monitor-specific
  minRefreshRate: undefined,
  maxRefreshRate: undefined,
  panelType: undefined,
  // Headphones-specific
  isWireless: undefined,
  hasNoiseCancelling: undefined,
  // Smartwatch-specific
  hasGps: undefined,
  isWaterResistant: undefined,
  // Common
  onlyAvailable: undefined,
  onPromotion: undefined,
}

function isFiltersEmpty(filters) {
  return Object.entries(filters).every(([key, value]) => {
    if (key === 'keyword') return !value
    return Array.isArray(value) ? value.length === 0 : value === undefined || value === false || value === null
  })
}

// Tóm tắt ngắn gọn bộ lọc mà AI đã suy ra
function describeAiFilter(filter) {
  if (!filter) return null
  const parts = []
  if (filter.brandNames?.length) parts.push(filter.brandNames.join(', '))
  if (filter.categoryNames?.length) parts.push(filter.categoryNames.join(', '))
  if (filter.minPrice || filter.maxPrice) {
    const fmt = (v) => `${Math.round(v / 1_000_000)} triệu`
    if (filter.minPrice && filter.maxPrice) parts.push(`giá ${fmt(filter.minPrice)} – ${fmt(filter.maxPrice)}`)
    else if (filter.maxPrice) parts.push(`giá dưới ${fmt(filter.maxPrice)}`)
    else parts.push(`giá trên ${fmt(filter.minPrice)}`)
  }
  if (filter.ramGb?.length) parts.push(`RAM ${filter.ramGb.join('/')}GB`)
  if (filter.storageGb?.length) parts.push(`bộ nhớ ${filter.storageGb.join('/')}GB`)
  if (filter.colors?.length) parts.push(`màu ${filter.colors.join(', ')}`)
  if (filter.chipset) parts.push(`chip ${filter.chipset}`)
  if (filter.nfcSupported) parts.push('có NFC')
  if (filter.keyword) parts.push(`"${filter.keyword}"`)
  return parts.length ? parts.join(' · ') : null
}

// Tạo tiêu đề động dựa trên các category đang filter
function buildPageTitle(categoryNames, aiFilter, aiQuery, keyword) {
  if (aiFilter) return `✨ Kết quả AI cho "${aiQuery}"`
  if (keyword) return `Kết quả cho "${keyword}"`
  if (categoryNames?.length === 1) return categoryNames[0]
  if (categoryNames?.length > 1) return categoryNames.join(' & ')
  return 'Tất cả sản phẩm'
}

function buildPageSubtitle(categoryNames, aiFilter, aiSummary, keyword) {
  if (aiFilter) return aiSummary ? `Hệ thống hiểu là: ${aiSummary}.` : 'Không tách được tiêu chí cụ thể, đang tìm theo toàn bộ câu hỏi.'
  if (keyword) return 'Kết quả được sắp xếp theo mức độ liên quan.'
  if (categoryNames?.length) return `Khám phá những sản phẩm ${categoryNames.join(', ')} mới nhất với ưu đãi trả góp 0% độc quyền tại TechStore.`
  return 'Khám phá toàn bộ sản phẩm công nghệ mới nhất với các ưu đãi trả góp 0% độc quyền tại TechStore.'
}

function evaluateProductMatch(product, activeFilters, excludeKey = null) {
  // Check keyword
  if (excludeKey !== 'keyword' && activeFilters.keyword) {
    const kw = activeFilters.keyword.toLowerCase()
    if (!product.name.toLowerCase().includes(kw) && !product.brand?.toLowerCase().includes(kw)) {
      return false
    }
  }
  // Check brand
  if (excludeKey !== 'brandNames' && activeFilters.brandNames?.length > 0) {
    if (!activeFilters.brandNames.includes(product.brand)) {
      return false
    }
  }
  // Check category
  if (excludeKey !== 'categoryNames' && activeFilters.categoryNames?.length > 0) {
    if (!activeFilters.categoryNames.includes(product.category)) {
      return false
    }
  }
  // Check price
  if (excludeKey !== 'price') {
    if (activeFilters.minPrice !== undefined && product.price < activeFilters.minPrice) return false
    if (activeFilters.maxPrice !== undefined && product.price > activeFilters.maxPrice) return false
  }
  // Check ram
  if (excludeKey !== 'ramGb' && activeFilters.ramGb?.length > 0) {
    const ramVal = product.ram ? parseInt(product.ram) : null
    if (!ramVal || !activeFilters.ramGb.includes(ramVal)) return false
  }
  // Check storage
  if (excludeKey !== 'storageGb' && activeFilters.storageGb?.length > 0) {
    const storageVal = product.storage ? parseInt(product.storage) : null
    if (!storageVal || !activeFilters.storageGb.includes(storageVal)) return false
  }
  // Check colors
  if (excludeKey !== 'colors' && activeFilters.colors?.length > 0) {
    if (!product.color || !activeFilters.colors.includes(product.color)) return false
  }

  // Category-specific filters
  // Monitor
  if (excludeKey !== 'monitor') {
    if (activeFilters.minRefreshRate !== undefined && product.refreshRate < activeFilters.minRefreshRate) return false
    if (activeFilters.maxRefreshRate !== undefined && product.refreshRate > activeFilters.maxRefreshRate) return false
    if (activeFilters.panelType && product.panelType !== activeFilters.panelType) return false
  }
  // Headphones
  if (excludeKey !== 'headphones') {
    if (activeFilters.isWireless !== undefined && product.isWireless !== activeFilters.isWireless) return false
    if (activeFilters.hasNoiseCancelling !== undefined && product.hasNoiseCancelling !== activeFilters.hasNoiseCancelling) return false
  }
  // Smartwatch
  if (excludeKey !== 'smartwatch') {
    if (activeFilters.hasGps !== undefined && product.hasGps !== activeFilters.hasGps) return false
    if (activeFilters.isWaterResistant !== undefined && product.isWaterResistant !== activeFilters.isWaterResistant) return false
  }

  return true
}

export default function ProductsPage() {
  const onNavigate = useNav()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const keyword = searchParams.get('keyword') || ''

  // Khi khách vào trang này từ ô tìm kiếm AI trên StoreNavbar, router state mang theo câu hỏi
  // gốc + bộ lọc đã diễn giải + kết quả trang đầu (để tránh gọi API 2 lần khi vừa vào trang).
  const aiFilter = location.state?.aiFilter || null
  const aiQuery = location.state?.aiQuery || ''
  const aiInitialResults = location.state?.aiResults || null
  const skipNextFetch = useRef(!!aiInitialResults)

  // Nếu navigate từ category link, pre-select danh mục
  const initialCategory = location.state?.categoryName || null

  const [sort, setSort] = useState('')
  const [page, setPage] = useState(0)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('shop-view-mode') || 'grid')
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    categoryNames: initialCategory ? [initialCategory] : [],
  }))
  const [products, setProducts] = useState(() => (aiInitialResults?.items ?? []).map(mapApiProduct))
  const [totalItems, setTotalItems] = useState(() => aiInitialResults?.totalItems ?? 0)
  const [totalPages, setTotalPages] = useState(() => aiInitialResults?.totalPages ?? 0)
  const [loading, setLoading] = useState(!aiInitialResults)
  const [error, setError] = useState(null)

  // Data từ API
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [allProducts, setAllProducts] = useState([])

  const [comparedProducts, setComparedProducts] = useState([])
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  const handleToggleCompare = (product) => {
    setComparedProducts(prev => {
      const exists = prev.some(p => p.id === product.id)
      if (exists) {
        return prev.filter(p => p.id !== product.id)
      } else {
        if (prev.length >= 3) {
          alert('Bạn chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!')
          return prev
        }
        return [...prev, product]
      }
    })
  }

  const handleRemoveCompare = (productId) => {
    setComparedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const handleClearCompare = () => {
    setComparedProducts([])
  }

  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [notifyProduct, setNotifyProduct] = useState(null)

  const { favoritesMap, toggleWishlist: handleToggleWishlist } = useFavorites()

  // Fetch categories & brands một lần khi mount
  useEffect(() => {
    shopService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
    shopService.getBrandNames()
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]))
    shopService.getBestsellers(4)
      .then(data => setBestsellers(Array.isArray(data) ? data.map(mapApiProduct) : []))
      .catch(() => setBestsellers([]))
    // Backend caps page size at 100, so fetch all pages and merge for facet counting.
    const FACET_FETCH_SIZE = 100
    async function fetchAllProductsForFacets() {
      const first = await shopService.getProductsByFilter({ page: 0, size: FACET_FETCH_SIZE })
      const items = Array.isArray(first?.items) ? [...first.items] : []
      const totalPages = first?.totalPages ?? 1
      if (totalPages > 1) {
        const pagePromises = []
        for (let p = 1; p < totalPages; p++) {
          pagePromises.push(shopService.getProductsByFilter({ page: p, size: FACET_FETCH_SIZE }))
        }
        const pages = await Promise.all(pagePromises)
        pages.forEach(next => {
          if (Array.isArray(next?.items)) items.push(...next.items)
        })
      }
      return items
    }
    fetchAllProductsForFacets()
      .then(items => setAllProducts(items.map(mapApiProduct)))
      .catch(() => setAllProducts([]))
  }, [])

  const patchFilters = (patch) => setFilters(prev => ({ ...prev, ...patch }))
  const resetFilters = () => setFilters({
    ...EMPTY_FILTERS,
    categoryNames: [],
  })
  const manualFiltersActive = !isFiltersEmpty(filters)



  const getBrandCount = (brandName) => {
    return allProducts.filter(p => evaluateProductMatch(p, filters, 'brandNames') && p.brand === brandName).length
  }

  const getCategoryCount = (categoryName) => {
    return allProducts.filter(p => evaluateProductMatch(p, filters, 'categoryNames') && p.category === categoryName).length
  }

  const getRamCount = (ramGbVal) => {
    return allProducts.filter(p => {
      const ramVal = p.ram ? parseInt(p.ram) : null
      return evaluateProductMatch(p, filters, 'ramGb') && ramVal === ramGbVal
    }).length
  }

  const getStorageCount = (storageGbVal) => {
    return allProducts.filter(p => {
      const storageVal = p.storage ? parseInt(p.storage) : null
      return evaluateProductMatch(p, filters, 'storageGb') && storageVal === storageGbVal
    }).length
  }

  const getColorCount = (colorName) => {
    return allProducts.filter(p => evaluateProductMatch(p, filters, 'colors') && p.color === colorName).length
  }

  const facetCounts = {
    brands: brands.reduce((acc, brand) => {
      acc[brand] = getBrandCount(brand)
      return acc
    }, {}),
    categories: categories.reduce((acc, cat) => {
      acc[cat.name] = getCategoryCount(cat.name)
      return acc
    }, {}),
    ram: [6, 8, 12, 16, 32].reduce((acc, val) => {
      acc[val] = getRamCount(val)
      return acc
    }, {}),
    storage: [128, 256, 512, 1024].reduce((acc, val) => {
      acc[val] = getStorageCount(val)
      return acc
    }, {}),
    colors: ['Đen', 'Trắng', 'Xanh', 'Bạc', 'Xám', 'Vàng', 'Đỏ', 'Titan Tự Nhiên', 'Titan Xanh', 'Xanh Navy'].reduce((acc, val) => {
      acc[val] = getColorCount(val)
      return acc
    }, {}),
  }

  useEffect(() => { setPage(0) }, [keyword, sort, aiFilter, filters])

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false
      return
    }
    setLoading(true)
    setError(null)

    let params
    if (manualFiltersActive) {
      params = { ...filters, keyword: filters.keyword || keyword || undefined, sort: sort || undefined, page, size: PAGE_SIZE }
    } else if (aiFilter) {
      params = { ...aiFilter, sort: sort || aiFilter.sort || undefined, page, size: PAGE_SIZE }
    } else {
      params = { keyword: keyword || undefined, sort: sort || undefined, page, size: PAGE_SIZE }
    }

    shopService.getProductsByFilter(params)
      .then(data => {
        setProducts((data.items ?? []).map(mapApiProduct))
        setTotalItems(data.totalItems ?? 0)
        setTotalPages(data.totalPages ?? 0)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [keyword, sort, page, aiFilter, filters, manualFiltersActive])

  const aiSummary = aiFilter ? describeAiFilter(aiFilter) : null
  const selectedCategories = filters.categoryNames ?? []
  const pageTitle = buildPageTitle(selectedCategories, aiFilter, aiQuery, keyword)
  const pageSubtitle = buildPageSubtitle(selectedCategories, aiFilter, aiSummary, keyword)

  return (
    <div className="flex-1 flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* Category header */}
      <div
        className="py-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderBottom: '1px solid var(--b1)',
        }}
      >
        <div className="absolute top-0 right-0 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,66,10,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--accent)' }}>
            {selectedCategories.length > 0 ? selectedCategories.join(' · ') : 'Danh mục sản phẩm'}
          </p>
          <h1 className="text-[20px] font-black text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {pageTitle}
          </h1>
          <p className="text-xs mt-1 text-slate-400">{pageSubtitle}</p>
          {aiFilter && (
            <button aria-label="Xoá tìm kiếm AI" type="button"
              onClick={() => onNavigate('list', { search: '' })}
              className="mt-1.5 text-[12px] font-semibold underline decoration-dotted border-none bg-transparent p-0 cursor-pointer"
              style={{ color: 'var(--accent)' }}
            >
              Xoá tìm kiếm AI, quay lại duyệt thường
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] mb-6" style={{ color: 'var(--t3)' }}>
          <button aria-label="Trang chủ" type="button"
            onClick={() => onNavigate('home')}
            className="transition-colors cursor-pointer hover:text-slate-900 border-none bg-transparent p-0"
          >
            Trang chủ
          </button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {selectedCategories.length === 1 ? (
            <>
              <button aria-label="Sản phẩm" type="button" onClick={() => onNavigate('list')} className="transition-colors cursor-pointer hover:text-slate-900 border-none bg-transparent p-0">
                Sản phẩm
              </button>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span style={{ color: 'var(--t1)' }}>{selectedCategories[0]}</span>
            </>
          ) : (
            <span style={{ color: 'var(--t1)' }}>{selectedCategories.length > 0 ? selectedCategories.join(' & ') : 'Tất cả sản phẩm'}</span>
          )}
        </nav>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--b1)' }}>
          <p className="text-[13px]" style={{ color: 'var(--t2)' }}>
            {loading ? (
              'Đang tải sản phẩm...'
            ) : (
              <>
                Tìm thấy{' '}
                <span className="font-extrabold" style={{ color: 'var(--t1)' }}>
                  {totalItems}
                </span>{' '}
                sản phẩm
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[12.5px] font-medium" style={{ color: 'var(--t3)' }}>Sắp xếp theo:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Sắp xếp danh sách sản phẩm"
              className="px-3.5 py-2 text-[12.5px] font-semibold rounded-lg border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 ml-1">
              <button aria-label="Thao tác" type="button"
                onClick={() => { setViewMode('grid'); localStorage.setItem('shop-view-mode', 'grid') }}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center border-none ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#E8420A] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
                title="Dạng lưới"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button aria-label="Thao tác" type="button"
                onClick={() => { setViewMode('list'); localStorage.setItem('shop-view-mode', 'list') }}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center border-none ${
                  viewMode === 'list'
                    ? 'bg-white text-[#E8420A] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
                title="Dạng danh sách"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <FilterPanel
          filters={filters}
          onChange={patchFilters}
          onReset={resetFilters}
          categories={categories}
          brands={brands}
          facetCounts={facetCounts}
        />

        {/* Grid */}
        <div>
            {error && (
              <div
                className="text-[13px] mb-6 px-4 py-3 font-semibold"
                style={{
                  color: 'var(--err)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  backgroundColor: 'rgba(239,68,68,0.04)',
                  borderRadius: '10px',
                }}
              >
                Không thể kết nối danh sách sản phẩm: {error}
              </div>
            )}
            {loading ? (
              <div className={viewMode === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'}>
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={_?.id ?? _?.code ?? _?.name ?? i} viewMode={viewMode} />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="w-full">
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-xl mx-auto">
                  {/* SVG Illustration */}
                  <div 
                    className="w-24 h-24 mb-6 rounded-3xl flex items-center justify-center shadow-inner"
                    style={{
                      backgroundColor: 'rgba(234,88,12,0.04)',
                      border: '1px solid rgba(234,88,12,0.08)'
                    }}
                  >
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13h.01M14 13h.01M10 17h4" />
                    </svg>
                  </div>

                  <h2 className="text-lg font-black text-slate-800 mb-2">Không tìm thấy sản phẩm phù hợp</h2>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    {manualFiltersActive
                      ? 'Chúng tôi không tìm thấy kết quả nào khớp với các bộ lọc hiện tại của bạn. Thử xoá bớt các điều kiện lọc để tìm kiếm rộng hơn.'
                      : aiFilter
                        ? `Không tìm thấy sản phẩm nào phù hợp với yêu cầu tìm kiếm AI: "${aiQuery}".`
                        : keyword
                          ? `Không tìm thấy kết quả phù hợp cho từ khóa: "${keyword}".`
                          : 'Không có sản phẩm nào có sẵn.'}
                  </p>

                  {manualFiltersActive && (
                    <button aria-label="Xoá tất cả bộ lọc" type="button"
                      onClick={resetFilters}
                      className="px-6 py-2.5 text-[13px] font-bold text-white rounded-xl hover:bg-[#ff551c] transition-colors cursor-pointer shadow-md shadow-orange-500/10 active:scale-95 border-none"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      Xoá tất cả bộ lọc
                    </button>
                  )}
                </div>

                {/* Suggestions panel */}
                {bestsellers.length > 0 && (
                  <div className="mt-12 pt-12 border-t border-slate-150 w-full text-left">
                    <h3 className="text-[16px] font-black text-slate-800 mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                      Sản phẩm bán chạy gợi ý cho bạn
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {bestsellers.map(p => (
                        <ProductCard 
                          key={p.id} 
                          product={p} 
                          onNavigate={onNavigate} 
                          viewMode="grid" 
                          isCompared={comparedProducts.some(cp => cp.id === p.id)}
                          onToggleCompare={handleToggleCompare}
                          onQuickView={setQuickViewProduct}
                          onNotifyBackInStock={setNotifyProduct}
                          isWished={!!favoritesMap[p.id]}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={viewMode === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'}>
                {products.map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onNavigate={onNavigate} 
                    viewMode={viewMode} 
                    isCompared={comparedProducts.some(cp => cp.id === p.id)}
                    onToggleCompare={handleToggleCompare}
                    onQuickView={setQuickViewProduct}
                    onNotifyBackInStock={setNotifyProduct}
                    isWished={!!favoritesMap[p.id]}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
            {!loading && products.length > 0 && totalPages > 1 && (
              <Pagination current={page + 1} total={totalPages} onChange={(p) => setPage(p - 1)} />
            )}
        </div>
      </div>

      {/* Comparison Drawer */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.15)] border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-5 transition-colors duration-300 transform ${
          comparedProducts.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-black text-slate-800">So sánh sản phẩm</span>
          <span className="text-[10px] text-slate-500 font-semibold">{comparedProducts.length}/3 đã chọn</span>
        </div>

        {/* Selected Products Thumbnails */}
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, idx) => {
            const prod = comparedProducts[idx]
            if (prod) {
              return (
                <div key={prod.id} className="relative w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-1 group">
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center bg-orange-50 text-[10px] font-bold text-orange-500 rounded-lg">SP</div>
                  )}
                  <button aria-label="Thao tác" type="button" 
                    onClick={() => handleRemoveCompare(prod.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-800 text-white rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-red-500 border border-white cursor-pointer"
                    title="Xóa"
                  >
                    ×
                  </button>
                </div>
              )
            }
            return (
              <div key={_?.id ?? _?.code ?? _?.name ?? _?.key ?? _?.val ?? _} className="w-12 h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-sm font-semibold select-none">
                +
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 pl-2">
          <button aria-label="Thao tác" type="button"
            onClick={() => setCompareModalOpen(true)}
            disabled={comparedProducts.length < 2}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-colors cursor-pointer border-none shadow-md ${
              comparedProducts.length >= 2 
                ? 'bg-[#E8420A] text-white hover:bg-[#ff551c] shadow-orange-500/10 active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            So sánh ngay
          </button>
          <button aria-label="Thao tác" type="button" 
            onClick={handleClearCompare}
            className="text-[11px] font-bold text-slate-500 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
          >
            Xóa hết
          </button>
        </div>
      </div>

      {/* Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-transform transition-opacity"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#E8420A] rounded-full" />
                So sánh chi tiết thông số kỹ thuật
              </h2>
              <button aria-label="Thao tác" type="button" 
                onClick={() => setCompareModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body: Comparison Table */}
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider w-1/4">Thông số</th>
                    {comparedProducts.map(p => (
                      <th key={p.id} className="py-3 px-4 text-sm font-black text-slate-800 text-center w-1/4">
                        <div className="flex flex-col items-center gap-2">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-16 w-16 object-contain" />
                          ) : (
                            <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400">Không có ảnh</div>
                          )}
                          <span className="line-clamp-2 max-w-[150px] leading-snug">{p.name}</span>
                        </div>
                      </th>
                    ))}
                    {/* Fill remaining empty columns to keep layout consistent */}
                    {[...Array(3 - comparedProducts.length)].map((_, i) => (
                      <th key={_?.id ?? _?.code ?? _?.name ?? i} className="w-1/4" />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON_FIELDS.reduce((acc, field) => {
                    if (field.key === 'image' || field.key === 'name') return acc
                    // Check if at least one product has a value for this field
                    const hasValue = comparedProducts.some(p => p[field.key] !== null && p[field.key] !== undefined && p[field.key] !== '')
                    if (!hasValue) return acc

                    acc.push(
                      <tr key={field.key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-xs font-bold text-slate-500">{field.label}</td>
                        {comparedProducts.map(p => {
                          const val = p[field.key]
                          
                          // Render based on type
                          let rendered = '-'
                          if (val !== null && val !== undefined && val !== '') {
                            if (field.type === 'price') {
                              rendered = <span className="font-extrabold text-orange-600">{(val).toLocaleString('vi-VN')} đ</span>
                            } else if (field.type === 'boolean') {
                              rendered = val ? (
                                <span className="text-emerald-600 font-bold">✓</span>
                              ) : (
                                <span className="text-slate-300 font-bold">✗</span>
                              )
                            } else {
                              rendered = <span className="text-slate-800 font-semibold">{val}</span>
                            }
                          }

                          return (
                            <td key={p.id} className="py-3 px-4 text-xs text-center">
                              {rendered}
                            </td>
                          )
                        })}
                        {[...Array(3 - comparedProducts.length)].map((_, i) => (
                          <td key={_?.id ?? _?.code ?? _?.name ?? i} className="py-3 px-4" />
                        ))}
                      </tr>
                    )
                    return acc
                  }, [])}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-150 flex justify-end bg-slate-50">
              <button aria-label="Thao tác" type="button"
                onClick={() => setCompareModalOpen(false)}
                className="px-5 py-2 text-xs font-bold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors cursor-pointer border-none"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          productId={quickViewProduct.id}
          onClose={() => setQuickViewProduct(null)}
          onNavigate={onNavigate}
        />
      )}
      {/* Back-in-Stock Notification Modal */}
      {notifyProduct && (
        <BackInStockModal
          product={notifyProduct}
          onClose={() => setNotifyProduct(null)}
        />
      )}
    </div>
  )
}
