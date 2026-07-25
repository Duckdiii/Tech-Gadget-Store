import { useState, useEffect, useRef, useCallback } from 'react'
import { useNav } from '../../../hooks/useNav'
import { useFavorites } from '../../../hooks/useFavorites'
import StoreNavbar from '../../../components/StoreNavbar'
import { useAuth } from '../../../context/useAuth'
import RecommendationSection from '../components/RecommendationSection'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import { useForYouRecommendations, useRecentlyViewed, useSuggestionsFromHistory } from '../hooks/useRecommendations'
import { shopService } from '../services/shopService'
import { mapApiProduct } from '../utils/mapApiProduct'
import { formatCurrency } from '../../../utils/formatters'

// "bestseller" gọi API riêng (/api/products/bestsellers, xếp hạng theo số lượng đã bán thật);
// 2 tab còn lại dùng chung /api/products/filter với tham số khác nhau.
const FEATURED_TAB_PARAMS = {
  new: {},
  sale: { onPromotion: true },
}

// Line-icon + gradient per category, used on the homepage category tiles whenever a category
// has no real photo yet (managers can still set a real imageUrl via Brand/Category settings —
// the seeded placehold.co URL is treated as "no photo" so these icons show instead).
const CATEGORY_VISUALS = [
  {
    keys: ['điện thoại', 'phone'],
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <path strokeLinecap="round" d="M11 18h2" />
      </svg>
    ),
  },
  {
    keys: ['laptop'],
    gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="11" rx="1.5" />
        <path strokeLinecap="round" d="M2 19h20" />
      </svg>
    ),
  },
  {
    keys: ['màn hình', 'monitor'],
    gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path strokeLinecap="round" d="M8 20h8M12 16v4" />
      </svg>
    ),
  },
  {
    keys: ['tai nghe', 'headphone'],
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" d="M4 14v-2a8 8 0 0116 0v2" />
        <rect x="2.5" y="14" width="4" height="6" rx="1.5" />
        <rect x="17.5" y="14" width="4" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    keys: ['smartwatch', 'đồng hồ'],
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="7" y="7" width="10" height="10" rx="2.5" />
        <path strokeLinecap="round" d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M9 17v3a1 1 0 001 1h4a1 1 0 001-1v-3" />
      </svg>
    ),
  },
  {
    keys: ['máy tính bảng', 'tablet'],
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path strokeLinecap="round" d="M11 18h2" />
      </svg>
    ),
  },
  {
    keys: ['loa', 'speaker'],
    gradient: 'linear-gradient(135deg, #f97316, #c2410c)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <circle cx="12" cy="8" r="1.6" />
        <circle cx="12" cy="15" r="3.2" />
      </svg>
    ),
  },
  {
    keys: ['phụ kiện', 'accessory'],
    gradient: 'linear-gradient(135deg, #64748b, #334155)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4M15 3v4M7 7h10l-1 5a4 4 0 01-8 0L7 7zM12 16v5" />
      </svg>
    ),
  },
]

const DEFAULT_CATEGORY_VISUAL = {
  gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
  icon: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
    </svg>
  ),
}

const getCategoryVisual = (name) => {
  const lower = (name || '').toLowerCase()
  const match = CATEGORY_VISUALS.find(v => v.keys.some(k => lower.includes(k)))
  return match || DEFAULT_CATEGORY_VISUAL
}

const avatarInitials = (name) => (name || '?').trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase()

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diffMs / 86400000)
  if (days <= 0) return 'Hôm nay'
  if (days === 1) return '1 ngày trước'
  if (days < 30) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  return `${months} tháng trước`
}

const pad = n => String(n).padStart(2, '0')

export default function HomePage() {
  const onNavigate = useNav()
  const { user } = useAuth()
  const { favoritesMap, toggleWishlist } = useFavorites()
  const { products: forYouProducts, loading: forYouLoading } = useForYouRecommendations(!!user)

  // Chỉ riêng "Dành cho bạn" cần báo cáo click về cho A/B test (xem RecommendationExperimentLog)
  // — ProductCard/RecommendationSection dùng chung cho mọi loại gợi ý nên giữ nguyên, không sửa.
  const handleForYouNavigate = (page, opts) => {
    if (page === 'detail' && opts?.search) {
      const productId = new URLSearchParams(opts.search).get('id')
      const clicked = forYouProducts.find(p => p.id === productId)
      if (clicked?.__impressionId) {
        shopService.trackForYouClick(clicked.__impressionId).catch(() => {})
      }
    }
    onNavigate(page, opts)
  }
  const { products: recentlyViewedProducts, loading: recentlyViewedLoading } = useRecentlyViewed(!!user)
  const { products: historySuggestions, loading: historySuggestionsLoading } = useSuggestionsFromHistory(!!user)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [activeTab, setActiveTab] = useState('bestseller')
  const [activeRecTab, setActiveRecTab] = useState('forYou')

  // ══ HERO SMART SEARCH STATES & LOGIC ══
  const [heroSearch, setHeroSearch] = useState('')
  const [heroSearchFocused, setHeroSearchFocused] = useState(false)
  const [heroAiMode, setHeroAiMode] = useState(true)
  const [heroAiLoading, setHeroAiLoading] = useState(false)

  const handleHeroSearch = async (e, customQuery = null) => {
    if (e) e.preventDefault()
    const q = (customQuery !== null ? customQuery : heroSearch).trim()
    if (!q) {
      onNavigate('list', { search: '' })
      return
    }
    if (!heroAiMode) {
      onNavigate('list', { search: `?keyword=${encodeURIComponent(q)}` })
      return
    }
    setHeroAiLoading(true)
    try {
      const data = await shopService.searchNaturalLanguage(q)
      onNavigate('list', { state: { aiQuery: q, aiFilter: data.interpretedFilter, aiResults: data.results } })
    } catch {
      onNavigate('list', { search: `?keyword=${encodeURIComponent(q)}` })
    } finally {
      setHeroAiLoading(false)
    }
  }

  // ══ FLASH SALE (real data) ══
  const [flashProducts, setFlashProducts] = useState([])
  const [flashLoading, setFlashLoading] = useState(true)
  const [flashEndAt, setFlashEndAt] = useState(null)

  const flashScrollRef = useRef(null)
  const [canScrollFlashLeft, setCanScrollFlashLeft] = useState(false)
  const [canScrollFlashRight, setCanScrollFlashRight] = useState(false)

  const updateFlashScrollState = useCallback(() => {
    const el = flashScrollRef.current
    if (!el) return
    setCanScrollFlashLeft(el.scrollLeft > 4)
    setCanScrollFlashRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateFlashScrollState()
  }, [flashProducts, updateFlashScrollState])

  const scrollFlashByAmount = (dir) => {
    const el = flashScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * (196 + 12) * 2, behavior: 'smooth' })
  }


  useEffect(() => {
    shopService.getFlashSaleProducts()
      .then(items => {
        setFlashProducts(items || [])
        // Nhiều promotion có thể đang chạy song song với thời gian kết thúc khác nhau —
        // đếm ngược tới mốc kết thúc SỚM NHẤT, vì đó là lúc danh sách này bắt đầu thay đổi.
        const soonestEnd = (items || []).reduce((min, it) => {
          if (!it.saleEndAt) return min
          const t = new Date(it.saleEndAt)
          return !min || t < min ? t : min
        }, null)
        if (soonestEnd) setFlashEndAt(soonestEnd)
      })
      .catch(() => setFlashProducts([]))
      .finally(() => setFlashLoading(false))
  }, [])

  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    if (!flashEndAt) return
    const tick = () => {
      const totalSec = Math.max(0, Math.floor((flashEndAt.getTime() - Date.now()) / 1000))
      setCountdown({ h: Math.floor(totalSec / 3600), m: Math.floor((totalSec % 3600) / 60), s: totalSec % 60 })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [flashEndAt])

  // ══ FEATURED PRODUCTS (real data) ══
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    setFeaturedLoading(true)
    const request = activeTab === 'bestseller'
      ? shopService.getBestsellers(4).then(items => (items ?? []).map(mapApiProduct))
      : shopService.getProductsByFilter({ ...FEATURED_TAB_PARAMS[activeTab], size: 4 })
          .then(data => (data.items ?? []).map(mapApiProduct))
    request
      .then(setFeaturedProducts)
      .catch(() => setFeaturedProducts([]))
      .finally(() => setFeaturedLoading(false))
  }, [activeTab])

  // ══ SITE-WIDE STATS, BRANDS, REVIEW HIGHLIGHTS (real data) ══
  const [brandNames, setBrandNames] = useState([])
  const [homeStats, setHomeStats] = useState(null)
  const [catalogCategories, setCatalogCategories] = useState([])
  const [reviewHighlights, setReviewHighlights] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    shopService.getBrandNames().then(setBrandNames).catch(() => setBrandNames([]))
    shopService.getHomeStats().then(setHomeStats).catch(() => setHomeStats(null))
    shopService.getCategories().then(setCatalogCategories).catch(() => setCatalogCategories([]))
    shopService.getReviewHighlights(3)
      .then(setReviewHighlights)
      .catch(() => setReviewHighlights([]))
      .finally(() => setReviewsLoading(false))
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <StoreNavbar />

      {/* ══ HERO ══ */}
      <section className="relative bg-white overflow-hidden py-16 lg:py-20">
        {/* BG decoration */}
        <div className="absolute -top-[60px] -right-[60px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(234,88,12,0.07)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute -bottom-[40px] -left-[40px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(249,115,22,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.025)_1px,transparent_1px)] bg-[size:56px_56px] pointer-events-none"></div>

        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
          {/* Left info column */}
          <div className="flex-1 w-full min-w-0">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-500/25 rounded-full px-3.5 py-1.5 text-xs md:text-sm text-orange-600 font-semibold mb-6">
              <span className="animate-glow w-1.5 h-1.5 bg-orange-500 rounded-full inline-block shrink-0"></span>
              Đối tác chính hãng Apple · Samsung · OPPO · Xiaomi
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[58px] font-black leading-[1.08] tracking-[-2.5px] mb-5">
              <span className="block text-gray-900">Công Nghệ</span>
              <span className="gradient-text block">Đỉnh Cao,</span>
              <span className="block text-gray-900">Giá Cực Tốt</span>
            </h1>

            <p className="text-sm md:text-base lg:text-[17px] text-gray-500 leading-relaxed max-w-[500px] mb-6">
              Hơn <strong className="text-gray-955">500+ mẫu điện thoại</strong> chính hãng từ các thương hiệu hàng đầu. Bảo hành chính hãng, giao hàng trong 2 giờ, giá tốt nhất thị trường.
            </p>

            {/* 🔍 KHUNG TÌM KIẾM THÔNG MINH */}
            <form onSubmit={handleHeroSearch} className="relative w-full max-w-[550px] mb-8">
              <div 
                className={`relative flex items-center bg-white border rounded-2xl p-1.5 transition-all duration-300 ${
                  heroSearchFocused 
                    ? 'border-orange-500 shadow-[0_10px_30px_rgba(234,88,12,0.12)] ring-4 ring-orange-500/10' 
                    : 'border-gray-200 shadow-sm'
                }`}
              >
                {/* AI Toggle Button */}
                <button type="button"
                  onClick={() => setHeroAiMode(v => !v)}
                  title={heroAiMode ? 'Đang tìm bằng AI — bấm để tắt' : 'Bấm để bật tìm kiếm bằng câu hỏi tự nhiên'}
                  className={`shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    heroAiMode 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 border border-gray-200/50'
                  }`}
                >
                  <span>✨</span>
                  <span>AI</span>
                </button>

                {/* Input Field */}
                <div className="relative flex-1 flex items-center min-w-0">
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={e => setHeroSearch(e.target.value)}
                    onFocus={() => setHeroSearchFocused(true)}
                    onBlur={() => setHeroSearchFocused(false)}
                    placeholder={
                      heroAiMode 
                        ? 'Tìm kiếm thông minh: "máy chụp hình đẹp dưới 15tr"...' 
                        : 'Tìm tên điện thoại, máy tính, phụ kiện...'
                    }
                    aria-label="Tìm kiếm sản phẩm"
                    className="w-full pl-3.5 pr-14 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 min-w-0"
                  />
                </div>

                {/* Submit Search Button / Spinner */}
                {heroAiLoading ? (
                  <div className="absolute right-3.5 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  <button type="submit" aria-label="Tìm kiếm sản phẩm"
                    className="absolute right-2.5 p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors duration-200 cursor-pointer border-none"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Quick Tags Suggestions */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3 px-1.5">
                <span className="text-xs text-gray-400">Gợi ý:</span>
                {[
                  { label: 'iPhone 15 Pro Max', q: 'iPhone 15 Pro Max' },
                  { label: 'Samsung S24 Ultra', q: 'Samsung S24 Ultra' },
                  { label: 'Máy dưới 10 triệu', q: 'điện thoại dưới 10 triệu' },
                  { label: 'Trả góp 0%', q: 'trả góp 0%' }
                ].map(tag => (
                  <button key={tag.label}
                    type="button"
                    onClick={() => {
                      setHeroSearch(tag.q)
                      handleHeroSearch(null, tag.q)
                    }}
                    className="text-xs text-gray-500 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 border border-gray-200/40 rounded-lg px-2.5 py-1 transition-colors duration-200 cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <button type="button"
                onClick={() => onNavigate('list')}
                className="btn-orange w-full sm:w-auto bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl px-7 py-3.5 text-base font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(234,88,12,0.35)]"
              >
                Mua ngay
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
              <button type="button"
                onClick={() => {
                  const el = document.getElementById('flash-sale-section')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-outline w-full sm:w-auto bg-transparent text-orange-600 border border-orange-500/30 rounded-xl px-7 py-3.5 text-base font-semibold flex items-center justify-center"
              >
                Xem Flash Sale →
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <div className="text-xs md:text-sm font-bold text-gray-900">Chính hãng 100%</div>
                  <div className="text-[10px] md:text-xs text-gray-400">Cam kết hoàn tiền</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <div className="text-xs md:text-sm font-bold text-gray-900">Giao trong 2 giờ</div>
                  <div className="text-[10px] md:text-xs text-gray-400">TP.HCM &amp; Hà Nội</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <div className="text-xs md:text-sm font-bold text-gray-900">Bảo hành 24 tháng</div>
                  <div className="text-[10px] md:text-xs text-gray-400">1 đổi 1 trong 30 ngày</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <div className="text-xs md:text-sm font-bold text-gray-900">Trả góp 0%</div>
                  <div className="text-[10px] md:text-xs text-gray-400">Lên đến 24 tháng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Phone Art */}
          <div className="shrink-0 w-80 h-[540px] relative hidden lg:block">
            <div className="animate-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(234,88,12,0.18)_0%,transparent_70%)] pointer-events-none"></div>

            <div className="animate-float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg width="232" height="468" viewBox="0 0 232 468" fill="none" style={{ filter: 'drop-shadow(0 32px 56px rgba(0,0,0,.18)) drop-shadow(0 0 40px rgba(234,88,12,.15))' }}>
                <rect width="232" height="468" rx="41" fill="#1C1C1E"></rect>
                <rect x="0.75" y="0.75" width="230.5" height="466.5" rx="40.25" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" fill="none"></rect>
                <rect x="8" y="8" width="216" height="452" rx="34" fill="#050C1A"></rect>
                <rect x="8" y="8" width="216" height="452" rx="34" fill="url(#heroWallOrange)"></rect>
                <rect x="72" y="15" width="88" height="24" rx="12" fill="#000"></rect>
                <circle cx="140" cy="27" r="7" fill="#0A0A0A"></circle>
                <text x="26" y="43" fontFamily="system-ui,-apple-system" fontSize="13" fontWeight="600" fill="rgba(255,255,255,.9)">9:41</text>
                <text x="116" y="108" fontFamily="system-ui,-apple-system" fontSize="48" fontWeight="200" fill="white" textAnchor="middle" letterSpacing="-2">9:41</text>
                <text x="116" y="130" fontFamily="system-ui,-apple-system" fontSize="13" fill="rgba(255,255,255,.5)" textAnchor="middle">Thứ Bảy, 28 Tháng 6</text>
                <rect x="22" y="152" width="40" height="40" rx="10" fill="rgba(255,255,255,.08)"></rect>
                <rect x="74" y="152" width="40" height="40" rx="10" fill="rgba(249,115,22,.3)"></rect>
                <rect x="126" y="152" width="40" height="40" rx="10" fill="rgba(255,255,255,.08)"></rect>
                <rect x="178" y="152" width="40" height="40" rx="10" fill="rgba(255,255,255,.08)"></rect>
                <rect x="22" y="204" width="40" height="40" rx="10" fill="rgba(255,255,255,.06)"></rect>
                <rect x="74" y="204" width="40" height="40" rx="10" fill="rgba(239,68,68,.22)"></rect>
                <rect x="126" y="204" width="40" height="40" rx="10" fill="rgba(255,255,255,.06)"></rect>
                <rect x="178" y="204" width="40" height="40" rx="10" fill="rgba(16,185,129,.22)"></rect>
                <rect x="22" y="256" width="40" height="40" rx="10" fill="rgba(234,88,12,.25)"></rect>
                <rect x="74" y="256" width="40" height="40" rx="10" fill="rgba(255,255,255,.06)"></rect>
                <rect x="126" y="256" width="40" height="40" rx="10" fill="rgba(255,255,255,.06)"></rect>
                <rect x="178" y="256" width="40" height="40" rx="10" fill="rgba(99,102,241,.22)"></rect>
                <rect x="14" y="316" width="204" height="66" rx="14" fill="rgba(30,41,59,.82)"></rect>
                <rect x="14" y="316" width="204" height="66" rx="14" stroke="rgba(255,255,255,.07)" strokeWidth="1" fill="none"></rect>
                <rect x="26" y="328" width="22" height="22" rx="6" fill="rgba(234,88,12,.85)"></rect>
                <text x="58" y="341" fontFamily="system-ui" fontSize="9.5" fill="rgba(255,255,255,.45)">Tech Store • Vừa xong</text>
                <text x="58" y="357" fontFamily="system-ui" fontSize="11.5" fill="rgba(255,255,255,.88)" fontWeight={500}>Đơn hàng đã giao thành công ✅</text>
                <text x="58" y="371" fontFamily="system-ui" fontSize="10" fill="rgba(255,255,255,.4)">Đang trên đường giao đến bạn</text>
                <rect x="78" y="442" width="76" height="4" rx="2" fill="rgba(255,255,255,.4)"></rect>
                <rect x="-3" y="118" width="3" height="26" rx="1.5" fill="#2D2D30"></rect>
                <rect x="-3" y="154" width="3" height="46" rx="1.5" fill="#2D2D30"></rect>
                <rect x="-3" y="210" width="3" height="46" rx="1.5" fill="#2D2D30"></rect>
                <rect x="232" y="140" width="3" height="56" rx="1.5" fill="#2D2D30"></rect>
                <defs>
                  <linearGradient id="heroWallOrange" x1="0" y1="0" x2=".28" y2="1">
                    <stop offset="0%" stopColor="#7c2d12"></stop>
                    <stop offset="30%" stopColor="#1c0a03"></stop>
                    <stop offset="100%" stopColor="#050C1A"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Floating chips (real site-wide stats) */}
            {homeStats && (
              <>
                <div className="animate-float2 absolute -left-12 top-[20%] bg-white border border-orange-500/25 rounded-xl p-3.5 shadow-md whitespace-nowrap">
                  <div className="text-[10px] text-gray-400 font-medium mb-0.5">Sản phẩm</div>
                  <div className="text-base font-extrabold text-gray-900">{homeStats.totalProducts.toLocaleString('vi-VN')}+</div>
                  <div className="text-[10px] text-orange-600 font-semibold">Đa dạng mẫu mã</div>
                </div>
                {homeStats.averageRating != null && (
                  <div className="animate-float absolute -right-9 top-[29%] bg-white border border-emerald-500/25 rounded-xl p-3.5 shadow-md whitespace-nowrap [animation-delay:0.8s]">
                    <div className="text-[10px] text-gray-400 font-medium mb-0.5">Đánh giá</div>
                    <div className="text-base font-extrabold text-gray-900">{homeStats.averageRating.toFixed(1)}★</div>
                    <div className="text-[10px] text-emerald-500 font-semibold">Từ khách hàng thật</div>
                  </div>
                )}
                <div className="animate-float2 absolute -right-[30px] bottom-[20%] bg-white border border-orange-500/25 rounded-xl p-3.5 shadow-md whitespace-nowrap">
                  <div className="text-[10px] text-gray-400 font-medium mb-0.5">Khách hàng</div>
                  <div className="text-base font-extrabold text-orange-600">{homeStats.totalCustomers.toLocaleString('vi-VN')}+</div>
                  <div className="text-[10px] text-orange-500 font-semibold">Tin dùng TechStore</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-[1300px] mx-auto mt-14 px-6 md:px-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
            <div className="bg-white p-5 md:p-7 text-center"><div className="text-3xl font-black text-gray-900 tracking-tight">{homeStats ? `${homeStats.totalProducts.toLocaleString('vi-VN')}+` : '—'}</div><div className="text-xs md:text-sm text-gray-400 mt-1">Mẫu điện thoại</div></div>
            <div className="bg-white p-5 md:p-7 text-center"><div className="text-3xl font-black text-gray-900 tracking-tight">{homeStats ? `${homeStats.totalCustomers.toLocaleString('vi-VN')}+` : '—'}</div><div className="text-xs md:text-sm text-gray-400 mt-1">Khách hàng tin dùng</div></div>
            <div className="bg-white p-5 md:p-7 text-center"><div className="text-3xl font-black text-emerald-500 tracking-tight">{homeStats?.averageRating != null ? `${homeStats.averageRating.toFixed(1)}★` : '—'}</div><div className="text-xs md:text-sm text-gray-400 mt-1">Đánh giá trung bình{homeStats?.totalReviews ? ` (${homeStats.totalReviews.toLocaleString('vi-VN')})` : ''}</div></div>
          </div>
        </div>
      </section>

      {/* ══ DANH MỤC SẢN PHẨM ══ */}
      {catalogCategories.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-6 md:px-7 mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-orange-600 mb-1">Danh mục</p>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                Khám Phá Theo Loại
              </h2>
            </div>
            <button type="button"
              onClick={() => onNavigate('list')}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer border-none bg-transparent"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {catalogCategories.map(cat => {
              const hasRealPhoto = cat.imageUrl && !cat.imageUrl.includes('placehold.co')
              const visual = getCategoryVisual(cat.name)
              return (
                <button type="button"
                  key={cat.id}
                  onClick={() => onNavigate('list', { state: { categoryName: cat.name } })}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-colors duration-200 cursor-pointer group"
                >
                  {hasRealPhoto ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 rounded-xl object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <span
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform"
                      style={{ background: visual.gradient }}
                    >
                      {visual.icon}
                    </span>
                  )}
                  <span className="text-[12.5px] font-bold text-gray-700 group-hover:text-orange-600 transition-colors text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="max-w-[1300px] mx-auto px-6 md:px-7">

        {/* ══ GỢI Ý CÁ NHÂN HÓA (personalized, logged-in only) ══ */}
        {user && (forYouLoading || forYouProducts.length > 0 || historySuggestions.length > 0) && (
          <section className="mt-10">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                Gợi ý cho bạn
              </h2>
              {historySuggestions.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '3px' }}>
                  <button type="button"
                    className="tab-btn"
                    style={{
                      background: activeRecTab === 'forYou' ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'transparent',
                      color: activeRecTab === 'forYou' ? 'white' : '#6B7280',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '7px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'color 0.2s, background 0.2s'
                    }}
                    onClick={() => setActiveRecTab('forYou')}
                  >
                    Dành cho bạn
                  </button>
                  <button type="button"
                    className="tab-btn"
                    style={{
                      background: activeRecTab === 'history' ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'transparent',
                      color: activeRecTab === 'history' ? 'white' : '#6B7280',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '7px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'color 0.2s, background 0.2s'
                    }}
                    onClick={() => setActiveRecTab('history')}
                  >
                    Từ lịch sử xem
                  </button>
                </div>
              )}
            </div>

            {activeRecTab === 'forYou' ? (
              <RecommendationSection
                title="Dành cho bạn"
                products={forYouProducts}
                loading={forYouLoading}
                onNavigate={handleForYouNavigate}
                hideTitle={true}
                favoritesMap={favoritesMap}
                onToggleWishlist={toggleWishlist}
              />
            ) : (
              <RecommendationSection
                title="Gợi ý từ lịch sử"
                products={historySuggestions}
                loading={historySuggestionsLoading}
                onNavigate={onNavigate}
                hideTitle={true}
                favoritesMap={favoritesMap}
                onToggleWishlist={toggleWishlist}
              />
            )}
          </section>
        )}

        {/* ══ FLASH SALE ══ */}
        <section id="flash-sale-section" style={{ padding: '52px 0 0' }}>
          <div style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', borderRadius: '20px', padding: '24px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg className="w-6 h-6 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>FLASH SALE</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.8)' }}>Kết thúc sau:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ background: 'rgba(0,0,0,.25)', borderRadius: '7px', padding: '5px 10px', fontSize: '20px', fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums', minWidth: '42px', textAlign: 'center' }}>{pad(countdown.h)}</div>
                  <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 700, fontSize: '18px' }}>:</span>
                  <div style={{ background: 'rgba(0,0,0,.25)', borderRadius: '7px', padding: '5px 10px', fontSize: '20px', fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums', minWidth: '42px', textAlign: 'center' }}>{pad(countdown.m)}</div>
                  <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 700, fontSize: '18px' }}>:</span>
                  <div style={{ background: '#fff', borderRadius: '7px', padding: '5px 10px', fontSize: '20px', fontWeight: 800, color: '#EA580C', fontVariantNumeric: 'tabular-nums', minWidth: '42px', textAlign: 'center', animation: 'countPulse 1s ease-in-out infinite' }}>{pad(countdown.s)}</div>
                </div>
              </div>
            </div>
            <button aria-label="Xem tất cả sản phẩm Flash Sale" type="button" onClick={() => onNavigate('list')} className="border-none bg-white/15 text-white/90 text-sm font-semibold cursor-pointer px-4 py-1.5 rounded-lg">Xem tất cả →</button>
          </div>

          {/* Flash products list */}
          <div style={{ position: 'relative' }}>
            {canScrollFlashLeft && (
              <button type="button"
                onClick={() => scrollFlashByAmount(-1)}
                aria-label="Cuộn sang trái"
                className="rec-arrow border-none bg-white text-gray-900"
                style={{
                  position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', itemsCenter: 'center', justifyContent: 'center',
                  border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {canScrollFlashRight && (
              <button type="button"
                onClick={() => scrollFlashByAmount(1)}
                aria-label="Cuộn sang phải"
                className="rec-arrow border-none bg-white text-gray-900"
                style={{
                  position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', itemsCenter: 'center', justifyContent: 'center',
                  border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}

            {flashLoading ? (
              <div className="scroll-x" style={{ display: 'flex', gap: '12px' }}>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={_?.id ?? _?.code ?? _?.name ?? i} 
                    style={{ flexShrink: 0, width: '196px', height: '260px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden' }} 
                    className="animate-pulse flex flex-col"
                  >
                    <div className="h-[148px] bg-gray-50 border-b border-gray-200 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                      <div className="space-y-1.5">
                        <div className="h-3 w-full bg-gray-200 rounded" />
                        <div className="h-3 w-3/4 bg-gray-200 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-4.5 w-16 bg-gray-200 rounded" />
                        <div className="h-3 w-10 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : flashProducts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
                Hiện chưa có sản phẩm Flash Sale nào đang diễn ra.
              </div>
            ) : (
              <div
                ref={flashScrollRef}
                onScroll={updateFlashScrollState}
                className="scroll-x"
                style={{ display: 'flex', gap: '12px', scrollSnapType: 'x proximity' }}
              >
                {flashProducts.map((item) => (
                  <div
                    key={item.variantId || item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Xem sản phẩm Flash Sale ${item.name}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('detail', { search: '?id=' + item.id }) }}
                    onClick={() => onNavigate('detail', { search: '?id=' + item.id })}
                    className="flash-card"
                    style={{ flexShrink: 0, width: '196px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start' }}
                  >
                    <div style={{ height: '148px', background: 'linear-gradient(135deg,#F8FAFC,#F1F5F9)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-28 w-28 object-contain" style={{ filter: 'drop-shadow(0 8px 16px rgba(15,23,42,0.08))' }} />
                      ) : (
                        <svg width="52" height="86" viewBox="0 0 62 102" fill="none">
                          <rect x="3" y="0" width="56" height="102" rx="10" fill="rgba(148,163,184,.18)"></rect>
                          <rect x="8" y="6" width="46" height="90" rx="7" fill="rgba(148,163,184,.1)"></rect>
                          <rect x="20" y="2" width="22" height="5" rx="2.5" fill="rgba(100,116,139,.35)"></rect>
                          <rect x="19" y="93" width="24" height="3" rx="1.5" fill="rgba(100,116,139,.3)"></rect>
                        </svg>
                      )}
                      {!!item.discountPercent && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#EA580C', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>-{Math.round(item.discountPercent)}%</div>
                      )}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', lineHeight: '1.4', marginBottom: '6px', minHeight: '36px' }}>{item.name}</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#EA580C', letterSpacing: '-.3px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{formatCurrency(item.salePrice)}</div>
                      {item.originalPrice != null && (
                        <div style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through', marginTop: '1px' }}>{formatCurrency(item.originalPrice)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══ FEATURED PRODUCTS ══ */}
        <section className="pt-14">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight font-['Be_Vietnam_Pro',sans-serif]">Sản phẩm nổi bật</h2>
            <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1">
              <button type="button"
                className={`tab-btn px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                  activeTab === 'bestseller' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('bestseller')}
              >
                Bán chạy
              </button>
              <button type="button"
                className={`tab-btn px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                  activeTab === 'new' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('new')}
              >
                Mới nhất
              </button>
              <button type="button"
                className={`tab-btn px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                  activeTab === 'sale' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('sale')}
              >
                Đang giảm
              </button>
            </div>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={_?.id ?? _?.code ?? _?.name ?? i} />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm bg-white border border-gray-200 rounded-2xl">
              Không có sản phẩm nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                  isWished={!!favoritesMap[product.id]}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-7">
            <button type="button" onClick={() => onNavigate('list')} className="btn-outline w-full sm:w-auto bg-transparent text-orange-600 border border-orange-500/30 rounded-xl px-7 py-3 text-sm md:text-base font-semibold cursor-pointer">Xem tất cả sản phẩm →</button>
          </div>
        </section>

        {/* ══ PROMO BANNERS ══ */}
        <section className="pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div
              tabIndex={0}
              onClick={() => onNavigate('list')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('list') }}
              className="promo-banner lg:col-span-3 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 rounded-2xl p-8 md:p-10 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute -right-[30px] -top-[30px] w-[200px] h-[200px] bg-white/8 rounded-full pointer-events-none"></div>
              <div className="absolute right-[60px] -bottom-[50px] w-[160px] h-[160px] bg-white/6 rounded-full pointer-events-none"></div>
              <div className="relative z-10">
                <div className="inline-block bg-white/18 rounded-lg px-3 py-1 text-xs font-bold text-white mb-3.5 tracking-wide">THU CŨ ĐỔI MỚI</div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2.5 leading-[1.15] font-['Be_Vietnam_Pro',sans-serif]">Thu máy cũ<br />Giá cao nhất</h3>
                <p className="text-sm text-white/78 mb-5 leading-relaxed">Đổi điện thoại cũ lấy máy mới — trợ giá <strong className="text-amber-100 font-bold">lên đến 3 triệu</strong></p>
                <span className="btn-orange bg-white text-orange-600 border-none rounded-xl px-5.5 py-2.5 text-sm font-extrabold inline-block">Định giá ngay →</span>
              </div>
            </div>
            <div
              tabIndex={0}
              onClick={() => onNavigate('list')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('list') }}
              className="promo-banner lg:col-span-2 bg-gray-900 rounded-2xl p-8 md:p-10 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute -right-[30px] -top-[30px] w-[180px] h-[180px] bg-orange-500/8 rounded-full pointer-events-none"></div>
              <div className="relative z-10">
                <div className="inline-block bg-orange-500/20 rounded-lg px-3 py-1 text-xs font-bold text-orange-500 mb-3.5 tracking-wide">TRẢ GÓP 0%</div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2.5 leading-[1.15] font-['Be_Vietnam_Pro',sans-serif]">Trả góp<br />0% lãi suất</h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">Lên đến 24 tháng. Duyệt trong <strong className="text-orange-500 font-bold">5 phút</strong></p>
                <span className="btn-orange bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none rounded-xl px-5.5 py-2.5 text-sm font-extrabold inline-block">Xem điều kiện →</span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ══ PARTNER BRANDS ══ */}
      <section className="py-12 mt-14 bg-white border-y border-gray-200">
        <div className="max-w-[1300px] mx-auto px-6 md:px-7">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Thương hiệu đối tác chính hãng</p>
          {brandNames.length === 0 ? (
            <div className="text-center text-xs text-gray-300">—</div>
          ) : (
            <div className="flex items-center justify-center md:justify-around gap-6 md:gap-8 flex-wrap">
              {brandNames.map(brand => (
                <button
                  key={brand}
                  type="button"
                  aria-label={`Thương hiệu đối tác ${brand}`}
                  onClick={() => onNavigate('list', { search: '?keyword=' + encodeURIComponent(brand) })}
                  className="brand-logo text-xl md:text-2xl font-bold text-gray-900 font-sans tracking-wide cursor-pointer transition-colors duration-300 hover:scale-110 border-none bg-transparent"
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-[1300px] mx-auto px-6 md:px-7">

        {/* ══ SERVICES ══ */}
        <section className="pt-14">
          <h2 className="text-center text-2xl font-black text-gray-900 mb-1.5 tracking-tight font-['Be_Vietnam_Pro',sans-serif]">Cam kết của Tech Store</h2>
          <p className="text-center text-sm md:text-base text-gray-400 mb-9">Khách hàng luôn là ưu tiên hàng đầu</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Hàng chính hãng</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">100% chính hãng từ nhà sản xuất. Hoàn tiền nếu phát hiện hàng giả.</p>
            </div>
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Giao hàng 2 giờ</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">Nhận ngay trong 2 giờ tại TP.HCM và Hà Nội. Miễn phí giao hàng.</p>
            </div>
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Bảo hành 24 tháng</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">Bảo hành chính hãng 12–24 tháng. 1 đổi 1 trong 30 ngày nếu lỗi.</p>
            </div>
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Trả góp 0%</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">Hỗ trợ trả góp 0% lãi suất lên đến 24 tháng qua ngân hàng đối tác.</p>
            </div>
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Đổi trả 30 ngày</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">Không vừa ý? Hoàn trả dễ dàng trong 30 ngày, không cần lý do.</p>
            </div>
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Hỗ trợ 24/7</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">Đội ngũ tư vấn chuyên sâu sẵn sàng hỗ trợ bất kỳ lúc nào.</p>
            </div>
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Giá tốt nhất</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">Cam kết giá rẻ nhất thị trường — tìm thấy rẻ hơn, hoàn 110%.</p>
            </div>
            <div className="svc-card border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="svc-icon w-13 h-13 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Đa dạng thanh toán</h3>
              <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed">Visa, Mastercard, MoMo, ZaloPay, VNPay hoặc thanh toán khi nhận hàng.</p>
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        <section className="pt-14">
          <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight font-['Be_Vietnam_Pro',sans-serif]">Khách hàng nói gì?</h2>
              <p className="text-sm text-gray-400 mt-1">
                {homeStats?.totalReviews ? `Hơn ${homeStats.totalReviews.toLocaleString('vi-VN')} đánh giá từ khách thực` : 'Đánh giá từ khách hàng thực'}
              </p>
            </div>
            {homeStats?.averageRating != null && (
              <div className="text-left md:text-right">
                <div className="text-[42px] font-black text-orange-600 tracking-tighter leading-none font-['Be_Vietnam_Pro',sans-serif]">{homeStats.averageRating.toFixed(1)}</div>
                <div className="text-amber-500 text-lg mt-0.5">★★★★★</div>
                <div className="text-xs text-gray-400">{homeStats.totalReviews.toLocaleString('vi-VN')} đánh giá</div>
              </div>
            )}
          </div>
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={_?.id ?? _?.code ?? _?.name ?? i} className="h-[190px] bg-white border border-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reviewHighlights.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm bg-white border border-gray-200 rounded-2xl">
              Chưa có đánh giá nào từ khách hàng.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviewHighlights.map((review, i) => (
                <div key={review.id} className="review-card border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div style={{ width: '44px', height: '44px', background: ['linear-gradient(135deg,#F97316,#EA580C)', 'linear-gradient(135deg,#10B981,#059669)', 'linear-gradient(135deg,#F59E0B,#EA580C)'][i % 3], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', color: 'white', flexShrink: 0 }}>{avatarInitials(review.userName)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm md:text-base">{review.userName}</div>
                      {review.productName && (
                        <div className="text-xs text-gray-400 truncate">{review.productName}</div>
                      )}
                    </div>
                    <div className="text-amber-500 text-xs shrink-0">{'★'.repeat(review.rating ?? 0)}</div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">"{review.content}"</p>
                  <div className="mt-3.5 text-[11px] text-gray-300">{timeAgo(review.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ══ BẠN VỪA XEM (logged-in only) ══ */}
        {user && (
          <RecommendationSection
            title="Sản phẩm bạn vừa xem"
            products={recentlyViewedProducts}
            loading={recentlyViewedLoading}
            onNavigate={onNavigate}
            favoritesMap={favoritesMap}
            onToggleWishlist={toggleWishlist}
          />
        )}


        {/* ══ NEWSLETTER ══ */}
        <section className="pt-14 pb-20">
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-[24px] p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-[50px] -right-[50px] w-[220px] h-[220px] bg-white/7 rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-[70px] -left-[50px] w-[260px] h-[260px] bg-white/5 rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-[12px] font-bold text-white/70 tracking-widest uppercase mb-3">Newsletter</p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight font-['Be_Vietnam_Pro',sans-serif]">Nhận ưu đãi độc quyền mỗi tuần</h2>
              <p className="text-sm md:text-base text-white/75 mb-7">Đăng ký nhận Flash Sale, sản phẩm mới và mã giảm giá riêng cho thành viên</p>
              
              {subscribed ? (
                <div className="max-w-[440px] mx-auto py-3 px-5 bg-white/15 border border-emerald-500 rounded-xl text-emerald-400 font-bold">
                  ✅ Đã đăng ký thành công ưu đãi!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-[440px] mx-auto">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    aria-label="Email nhận bản tin"
                    className="flex-1 bg-white/15 border border-white/25 rounded-xl px-4.5 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/50 transition-colors duration-200"
                  />
                  <button aria-label="Đăng ký nhận bản tin" className="btn-orange w-full sm:w-auto bg-white text-orange-600 border-none rounded-xl px-6 py-3 text-sm font-extrabold whitespace-nowrap transition-colors duration-300 cursor-pointer" type="submit">
                    Đăng ký
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* ══ FOOTER ══ */}
      <footer className="bg-gray-900 border-t border-white/6 pt-16">
        <div className="max-w-[1300px] mx-auto px-6 md:px-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">

            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(234,88,12,0.35)]">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path
                      d="M11 2.5L4.5 6.2v6.8c0 3.8 2.8 7.4 6.5 8.4 3.7-1 6.5-4.6 6.5-8.4V6.2L11 2.5z"
                      fill="rgba(255, 255, 255, 0.95)"
                    />
                    <path
                      d="M7.5 10.5h7M7.5 13.5h5"
                      stroke="#EA580C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex gap-0.5">
                  <span className="text-xl font-black text-gray-50 tracking-tight font-['Be_Vietnam_Pro',sans-serif]">Tech</span>
                  <span className="text-xl font-black text-orange-600 tracking-tight font-['Be_Vietnam_Pro',sans-serif]">Store</span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-5">Hệ thống bán lẻ điện thoại chính hãng hàng đầu Việt Nam. Cam kết giá tốt, chất lượng và dịch vụ tận tâm.</p>
              <div className="flex gap-2 mb-5">
                <div
                  className="social-btn w-9 h-9 bg-white/6 rounded-lg flex items-center justify-center text-gray-400"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </div>
                <div
                  className="social-btn w-9 h-9 bg-white/6 rounded-lg flex items-center justify-center text-gray-400"
                  title="Zalo"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 5.8 2 10.5c0 2.1 1 4 2.6 5.3L3.5 19.5c-.15.4.25.75.65.6l3.6-1.8c1.3.5 2.8.8 4.2.8 5.52 0 10-3.8 10-8.5S17.52 2 12 2zm3.3 11.5h-4.3l3-3.8h-2.8V8.5h4.1v1.2l-3 3.8h3v1z"/>
                  </svg>
                </div>
                <div
                  className="social-btn w-9 h-9 bg-white/6 rounded-lg flex items-center justify-center text-gray-400"
                  title="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.482 20.5 12 20.5 12 20.5s7.518 0 9.388-.553a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div
                  className="social-btn w-9 h-9 bg-white/6 rounded-lg flex items-center justify-center text-gray-400"
                  title="TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.18.97 1.13 2.37 1.83 3.84 2.02v3.9c-1.39-.03-2.74-.51-3.89-1.29-.69-.47-1.3-.1-1.3-.1v6.23c.04 4.38-3.08 8.12-7.46 8.57-4.83.67-9.31-2.73-9.91-7.53C-.38 10.82 3.19 6.2 8.08 5.76c1.17-.11 2.35.09 3.42.59v4.03c-.76-.46-1.64-.67-2.52-.61-2.32.1-4.22 1.94-4.38 4.26-.22 2.65 1.76 4.96 4.41 5.17 2.66.21 4.97-1.75 5.19-4.41.02-.27.02-.55.02-.82V0h-.3z"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Thanh toán</div>
                <div className="flex gap-1.5 flex-wrap">
                  <div className="bg-white/6 border border-white/8 rounded-md px-2 py-1 text-[10px] md:text-xs font-semibold text-gray-400">Visa</div>
                  <div className="bg-white/6 border border-white/8 rounded-md px-2 py-1 text-[10px] md:text-xs font-semibold text-gray-400">Mastercard</div>
                  <div className="bg-white/6 border border-white/8 rounded-md px-2 py-1 text-[10px] md:text-xs font-semibold text-gray-400">MoMo</div>
                  <div className="bg-white/6 border border-white/8 rounded-md px-2 py-1 text-[10px] md:text-xs font-semibold text-gray-400">ZaloPay</div>
                  <div className="bg-white/6 border border-white/8 rounded-md px-2 py-1 text-[10px] md:text-xs font-semibold text-gray-400">VNPay</div>
                  <div className="bg-white/6 border border-white/8 rounded-md px-2 py-1 text-[10px] md:text-xs font-semibold text-gray-400">COD</div>
                </div>
              </div>
            </div>

            {/* Products column */}
            <div>
              <h4 className="text-xs md:text-sm font-bold text-gray-50 mb-4 uppercase tracking-wider font-['Be_Vietnam_Pro',sans-serif]">Sản phẩm</h4>
              <div className="flex flex-col gap-2">
                <button aria-label="Xem sản phẩm iPhone" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">iPhone</button>
                <button aria-label="Xem sản phẩm Samsung Galaxy" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Samsung Galaxy</button>
                <button aria-label="Xem sản phẩm OPPO" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">OPPO</button>
                <button aria-label="Xem sản phẩm Xiaomi / Redmi" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Xiaomi / Redmi</button>
                <button aria-label="Xem sản phẩm Vivo" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Vivo</button>
                <button aria-label="Xem sản phẩm Realme" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Realme</button>
                <button aria-label="Xem sản phẩm Google Pixel" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Google Pixel</button>
                <button aria-label="Xem phụ kiện" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Phụ kiện</button>
              </div>
            </div>

            {/* Services column */}
            <div>
              <h4 className="text-xs md:text-sm font-bold text-gray-50 mb-4 uppercase tracking-wider font-['Be_Vietnam_Pro',sans-serif]">Dịch vụ</h4>
              <div className="flex flex-col gap-2">
                <button aria-label="Xem hướng dẫn mua hàng" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Hướng dẫn mua hàng</button>
                <button aria-label="Xem chính sách bảo hành" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Chính sách bảo hành</button>
                <button aria-label="Xem chính sách đổi trả hàng" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Đổi trả hàng</button>
                <button aria-label="Xem thông tin trả góp 0%" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Trả góp 0%</button>
                <button aria-label="Xem dịch vụ thu cũ đổi mới" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Thu cũ đổi mới</button>
                <button aria-label="Kiểm tra đơn hàng" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Kiểm tra đơn hàng</button>
                <button aria-label="So sánh sản phẩm" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">So sánh sản phẩm</button>
              </div>
            </div>

            {/* Company column */}
            <div>
              <h4 className="text-xs md:text-sm font-bold text-gray-50 mb-4 uppercase tracking-wider font-['Be_Vietnam_Pro',sans-serif]">Công ty</h4>
              <div className="flex flex-col gap-2">
                <button aria-label="Giới thiệu về công ty" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Giới thiệu</button>
                <button aria-label="Thông tin tuyển dụng" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Tuyển dụng</button>
                <button aria-label="Tin tức công nghệ" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Tin tức</button>
                <button aria-label="Hệ thống cửa hàng" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Hệ thống cửa hàng</button>
                <button aria-label="Chính sách bảo mật" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Chính sách bảo mật</button>
                <button aria-label="Điều khoản dịch vụ" type="button" onClick={() => onNavigate('list')} className="footer-link text-xs md:text-sm text-gray-500 border-none bg-transparent cursor-pointer p-0 text-left">Điều khoản dịch vụ</button>
              </div>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="text-xs md:text-sm font-bold text-gray-50 mb-4 uppercase tracking-wider font-['Be_Vietnam_Pro',sans-serif]">Liên hệ</h4>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2.5">
                  <span className="text-orange-500 shrink-0 mt-0.5 flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.122-4.103-6.927-6.927l1.293-.97a2.25 2.25 0 00.417-1.173L7.91 3.5c-.125-.501-.575-.852-1.091-.852H5.437a2.25 2.25 0 00-2.25 2.25v1.372z"/>
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-bold text-gray-50">1800 6678</div>
                    <div className="text-[10px] md:text-xs text-gray-500">Miễn phí · 8:00–22:00</div>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-orange-500 shrink-0 mt-0.5 flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs md:text-sm text-gray-300">support@techstore.vn</div>
                    <div className="text-[10px] md:text-xs text-gray-500">Phản hồi trong 2 giờ</div>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-orange-500 shrink-0 mt-0.5 flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z"/>
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs md:text-sm text-gray-300">123 Nguyễn Huệ, Q.1, TP.HCM</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Chứng nhận</div>
                  <div className="flex gap-1.5">
                    <div className="bg-emerald-500/10 border border-emerald-500/28 rounded-md px-2 py-1 text-[10px] font-bold text-emerald-400">ĐKKD</div>
                    <div className="bg-orange-500/12 border border-orange-500/28 rounded-md px-2 py-1 text-[10px] font-bold text-orange-500">BCER</div>
                    <div className="bg-amber-500/10 border border-amber-500/28 rounded-md px-2 py-1 text-[10px] font-bold text-amber-500">ISO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/7 py-5 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-gray-500">© 2026 TechStore JSC. GPKD số: 0123456789 do Sở KHĐT TP.HCM cấp.</span>
            <div className="flex gap-5">
              <span className="footer-link text-xs text-gray-500">Bảo mật</span>
              <span className="footer-link text-xs text-gray-500">Điều khoản</span>
              <span className="footer-link text-xs text-gray-500">Cookie</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
