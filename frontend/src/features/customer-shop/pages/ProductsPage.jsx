import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import StoreNavbar from '../../../components/StoreNavbar'
import ProductCard from '../components/ProductCard'
import FilterPanel from '../components/FilterPanel'
import Pagination from '../components/Pagination'
import { mapApiProduct } from '../utils/mapApiProduct'
import { shopService } from '../services/shopService'

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: '' },
  { label: 'Giá thấp đến cao', value: 'price_asc' },
  { label: 'Giá cao đến thấp', value: 'price_desc' },
]

const PAGE_SIZE = 9

export default function ProductsPage() {
  const onNavigate = useNav()
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(0)
  const [products, setProducts] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { setPage(0) }, [keyword, sort])

  useEffect(() => {
    setLoading(true)
    setError(null)
    shopService.getProductsByFilter({
      keyword: keyword || undefined,
      sort: sort || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then(data => {
        setProducts((data.items ?? []).map(mapApiProduct))
        setTotalItems(data.totalItems ?? 0)
        setTotalPages(data.totalPages ?? 0)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [keyword, sort, page])

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* Category header — premium dark slate gradient */}
      <div
        className="py-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderBottom: '1px solid var(--b1)',
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,66,10,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <p className="text-[11px] font-extrabold tracking-[0.25em] uppercase mb-1.5" style={{ color: 'var(--accent)' }}>
            Danh mục sản phẩm
          </p>
          <h1 className="text-[28px] font-black text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {keyword ? `Kết quả cho "${keyword}"` : 'Điện thoại di động'}
          </h1>
          <p className="text-sm mt-1.5 text-slate-400">
            {keyword
              ? 'Kết quả được sắp xếp theo mức độ liên quan.'
              : 'Khám phá những mẫu điện thoại mới nhất với các ưu đãi trả góp 0% độc quyền tại TechStore.'}
          </p>
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
          <span style={{ color: 'var(--t1)' }}>Điện thoại di động</span>
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

        {/* Filter + Grid */}
        <div className="flex gap-7 items-start">
          <FilterPanel />
          <div className="flex-1 min-w-0">
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
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse"
                    style={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--b1)',
                      borderRadius: '16px',
                    }}
                  />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="text-center py-20 text-sm font-semibold" style={{ color: 'var(--t3)' }}>
                {keyword
                  ? `Rất tiếc! Không tìm thấy sản phẩm nào khớp với "${keyword}".`
                  : 'Rất tiếc! Không có sản phẩm nào đáp ứng bộ lọc của bạn.'}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>
            )}
            {!loading && products.length > 0 && totalPages > 1 && (
              <Pagination current={page + 1} total={totalPages} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
