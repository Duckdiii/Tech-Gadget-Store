import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import StoreNavbar from '../../../components/StoreNavbar'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import FilterPanel from '../components/FilterPanel'
import Pagination from '../components/Pagination'
import { mapApiProduct } from '../utils/mapApiProduct'
import { shopService } from '../services/shopService'

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: '' },
  { label: 'Giá thấp đến cao', value: 'price_asc' },
  { label: 'Giá cao đến thấp', value: 'price_desc' },
]

const PAGE_SIZE = 12

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

  // Fetch categories & brands một lần khi mount
  useEffect(() => {
    shopService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
    shopService.getBrandNames()
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]))
  }, [])

  const patchFilters = (patch) => setFilters(prev => ({ ...prev, ...patch }))
  const resetFilters = () => setFilters({
    ...EMPTY_FILTERS,
    categoryNames: [],
  })
  const manualFiltersActive = !isFiltersEmpty(filters)

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
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
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
            <button
              onClick={() => onNavigate('list', { search: '' })}
              className="mt-1.5 text-[12px] font-semibold underline decoration-dotted"
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
          <button
            onClick={() => onNavigate('home')}
            className="transition-colors cursor-pointer hover:text-slate-900"
          >
            Trang chủ
          </button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {selectedCategories.length === 1 ? (
            <>
              <button onClick={() => onNavigate('list')} className="transition-colors cursor-pointer hover:text-slate-900">
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
              className="px-3.5 py-2 text-[12.5px] font-semibold rounded-lg border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter bar */}
        <FilterPanel
          filters={filters}
          onChange={patchFilters}
          onReset={resetFilters}
          categories={categories}
          brands={brands}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="text-center py-20 text-sm font-semibold" style={{ color: 'var(--t3)' }}>
                {manualFiltersActive
                  ? 'Rất tiếc! Không có sản phẩm nào đáp ứng bộ lọc của bạn.'
                  : aiFilter
                    ? `Rất tiếc! Không tìm thấy sản phẩm nào phù hợp với "${aiQuery}".`
                    : keyword
                      ? `Rất tiếc! Không tìm thấy sản phẩm nào khớp với "${keyword}".`
                      : 'Rất tiếc! Không có sản phẩm nào đáp ứng bộ lọc của bạn.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>
            )}
            {!loading && products.length > 0 && totalPages > 1 && (
              <Pagination current={page + 1} total={totalPages} onChange={(p) => setPage(p - 1)} />
            )}
        </div>
      </div>
    </div>
  )
}
