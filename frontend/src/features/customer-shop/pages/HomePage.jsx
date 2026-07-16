import { useState, useEffect, useRef, useCallback } from 'react'
import { useNav } from '../../../hooks/useNav'
import StoreNavbar from '../../../components/StoreNavbar'
import { useAuth } from '../../../context/useAuth'
import RecommendationSection from '../components/RecommendationSection'
import ProductCard from '../components/ProductCard'
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

export default function HomePage() {
  const onNavigate = useNav()
  const { user } = useAuth()
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

  const pad = n => String(n).padStart(2, '0')

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
  const [reviewHighlights, setReviewHighlights] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    shopService.getBrandNames().then(setBrandNames).catch(() => setBrandNames([]))
    shopService.getHomeStats().then(setHomeStats).catch(() => setHomeStats(null))
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
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <StoreNavbar />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', background: '#fff', overflow: 'hidden', padding: '80px 0 64px' }}>
        {/* BG decoration */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(234,88,12,.07) 0%,transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(249,115,22,.05) 0%,transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(234,88,12,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,.025) 1px,transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }}></div>

        <div className="max-w-screen-2xl mx-auto px-12 flex items-center justify-between gap-16 relative" style={{ zIndex: 1 }}>
          {/* Left info column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFF7ED', border: '1px solid rgba(234,88,12,.25)', borderRadius: '24px', padding: '6px 14px', fontSize: '13px', color: '#EA580C', fontWeight: 600, marginBottom: '24px' }}>
              <span className="animate-glow" style={{ width: '7px', height: '7px', background: '#F97316', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}></span>
              Đối tác chính hãng Apple · Samsung · OPPO · Xiaomi
            </div>

            <h1 style={{ fontSize: '58px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2.5px', marginBottom: '20px' }}>
              <span style={{ display: 'block', color: '#111827' }}>Công Nghệ</span>
              <span className="gradient-text" style={{ display: 'block' }}>Đỉnh Cao,</span>
              <span style={{ display: 'block', color: '#111827' }}>Giá Cực Tốt</span>
            </h1>

            <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.75, maxWidth: '500px', marginBottom: '32px' }}>
              Hơn <strong style={{ color: '#111827' }}>500+ mẫu điện thoại</strong> chính hãng từ các thương hiệu hàng đầu. Bảo hành chính hãng, giao hàng trong 2 giờ, giá tốt nhất thị trường.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <button
                onClick={() => onNavigate('list')}
                className="btn-orange"
                style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 28px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(234,88,12,.35)' }}
              >
                Mua ngay
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('flash-sale-section')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-outline"
                style={{ background: 'transparent', color: '#EA580C', border: '1.5px solid rgba(234,88,12,.3)', borderRadius: '12px', padding: '14px 28px', fontSize: '16px', fontWeight: 600 }}
              >
                Xem Flash Sale →
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '32px', height: '32px', background: '#ECFDF5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Chính hãng 100%</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Cam kết hoàn tiền</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '32px', height: '32px', background: '#FFF7ED', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Giao trong 2 giờ</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>TP.HCM &amp; Hà Nội</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '32px', height: '32px', background: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Bảo hành 24 tháng</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>1 đổi 1 trong 30 ngày</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '32px', height: '32px', background: '#FFF7ED', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Trả góp 0%</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Lên đến 24 tháng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Phone Art */}
          <div style={{ flexShrink: 0, width: '320px', height: '540px', position: 'relative' }}>
            <div className="animate-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '320px', height: '320px', background: 'radial-gradient(circle,rgba(234,88,12,.18) 0%,transparent 70%)', pointerEvents: 'none' }}></div>

            <div className="animate-float" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
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
                <div className="animate-float2" style={{ position: 'absolute', left: '-52px', top: '20%', background: '#fff', border: '1px solid rgba(234,88,12,.25)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>Sản phẩm</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{homeStats.totalProducts.toLocaleString('vi-VN')}+</div>
                  <div style={{ fontSize: '10px', color: '#EA580C', fontWeight: 600 }}>Đa dạng mẫu mã</div>
                </div>
                {homeStats.averageRating != null && (
                  <div className="animate-float" style={{ position: 'absolute', right: '-36px', top: '29%', background: '#fff', border: '1px solid rgba(16,185,129,.25)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', whiteSpace: 'nowrap', animationDelay: '0.8s' }}>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>Đánh giá</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{homeStats.averageRating.toFixed(1)}★</div>
                    <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>Từ khách hàng thật</div>
                  </div>
                )}
                <div className="animate-float2" style={{ position: 'absolute', right: '-30px', bottom: '20%', background: '#fff', border: '1px solid rgba(234,88,12,.25)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>Khách hàng</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#EA580C' }}>{homeStats.totalCustomers.toLocaleString('vi-VN')}+</div>
                  <div style={{ fontSize: '10px', color: '#F97316', fontWeight: 600 }}>Tin dùng TechStore</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ maxWidth: '1300px', margin: '56px auto 0', padding: '0 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#E5E7EB', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <div style={{ background: '#fff', padding: '22px 28px', textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>{homeStats ? `${homeStats.totalProducts.toLocaleString('vi-VN')}+` : '—'}</div><div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Mẫu điện thoại</div></div>
            <div style={{ background: '#fff', padding: '22px 28px', textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>{homeStats ? `${homeStats.totalCustomers.toLocaleString('vi-VN')}+` : '—'}</div><div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Khách hàng tin dùng</div></div>
            <div style={{ background: '#fff', padding: '22px 28px', textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: 900, color: '#10B981', letterSpacing: '-1px' }}>{homeStats?.averageRating != null ? `${homeStats.averageRating.toFixed(1)}★` : '—'}</div><div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Đánh giá trung bình{homeStats?.totalReviews ? ` (${homeStats.totalReviews.toLocaleString('vi-VN')})` : ''}</div></div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 28px' }}>

        {/* ══ GỢI Ý CÁ NHÂN HÓA (personalized, logged-in only) ══ */}
        {user && (forYouLoading || forYouProducts.length > 0 || historySuggestions.length > 0) && (
          <section className="mt-10">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                Gợi ý cho bạn
              </h2>
              {historySuggestions.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '3px' }}>
                  <button
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
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setActiveRecTab('forYou')}
                  >
                    Dành cho bạn
                  </button>
                  <button
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
                      transition: 'all 0.2s'
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
              />
            ) : (
              <RecommendationSection
                title="Gợi ý từ lịch sử"
                products={historySuggestions}
                loading={historySuggestionsLoading}
                onNavigate={onNavigate}
                hideTitle={true}
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
            <span onClick={() => onNavigate('list')} style={{ fontSize: '14px', color: 'rgba(255,255,255,.9)', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,.15)', padding: '6px 16px', borderRadius: '8px' }}>Xem tất cả →</span>
          </div>

          {/* Flash products list */}
          <div style={{ position: 'relative' }}>
            {canScrollFlashLeft && (
              <button
                onClick={() => scrollFlashByAmount(-1)}
                aria-label="Cuộn sang trái"
                className="rec-arrow"
                style={{
                  position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#fff', border: '1px solid #E5E7EB', color: '#111827', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {canScrollFlashRight && (
              <button
                onClick={() => scrollFlashByAmount(1)}
                aria-label="Cuộn sang phải"
                className="rec-arrow"
                style={{
                  position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#fff', border: '1px solid #E5E7EB', color: '#111827', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}

            {flashLoading ? (
              <div className="scroll-x" style={{ display: 'flex', gap: '12px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ flexShrink: 0, width: '196px', height: '260px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px' }} className="animate-pulse" />
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
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Sản phẩm nổi bật</h2>
            <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '3px' }}>
              <button
                className="tab-btn"
                style={{
                  background: activeTab === 'bestseller' ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'transparent',
                  color: activeTab === 'bestseller' ? 'white' : '#6B7280',
                  borderRadius: '7px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
                onClick={() => setActiveTab('bestseller')}
              >
                Bán chạy
              </button>
              <button
                className="tab-btn"
                style={{
                  background: activeTab === 'new' ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'transparent',
                  color: activeTab === 'new' ? 'white' : '#6B7280',
                  borderRadius: '7px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
                onClick={() => setActiveTab('new')}
              >
                Mới nhất
              </button>
              <button
                className="tab-btn"
                style={{
                  background: activeTab === 'sale' ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'transparent',
                  color: activeTab === 'sale' ? 'white' : '#6B7280',
                  borderRadius: '7px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
                onClick={() => setActiveTab('sale')}
              >
                Đang giảm
              </button>
            </div>
          </div>

          {featuredLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: '380px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px' }} className="animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
              Không có sản phẩm nào phù hợp.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <button onClick={() => onNavigate('list')} className="btn-outline" style={{ background: 'transparent', color: '#EA580C', border: '1.5px solid rgba(234,88,12,.3)', borderRadius: '12px', padding: '12px 28px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả sản phẩm →</button>
          </div>
        </section>

        {/* ══ PROMO BANNERS ══ */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: '16px' }}>
            <div onClick={() => onNavigate('list')} className="promo-banner" style={{ background: 'linear-gradient(135deg,#EA580C,#F97316,#FB923C)', borderRadius: '20px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '200px', height: '200px', background: 'rgba(255,255,255,.08)', borderRadius: '50%', pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', right: '60px', bottom: '-50px', width: '160px', height: '160px', background: 'rgba(255,255,255,.06)', borderRadius: '50%', pointerEvents: 'none' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.18)', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: 'white', marginBottom: '14px', letterSpacing: '.5px' }}>THU CŨ ĐỔI MỚI</div>
                <h3 style={{ fontSize: '30px', fontWeight: 900, color: 'white', letterSpacing: '-.8px', marginBottom: '10px', lineHeight: 1.15, fontFamily: 'Be Vietnam Pro, sans-serif' }}>Thu máy cũ<br />Giá cao nhất</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.78)', marginBottom: '22px', lineHeight: 1.65 }}>Đổi điện thoại cũ lấy máy mới — trợ giá <strong style={{ color: '#FEF3C7' }}>lên đến 3 triệu</strong></p>
                <button className="btn-orange" style={{ background: 'white', color: '#EA580C', border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>Định giá ngay →</button>
              </div>
            </div>
            <div onClick={() => onNavigate('list')} className="promo-banner" style={{ background: '#111827', borderRadius: '20px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '180px', height: '180px', background: 'rgba(234,88,12,.08)', borderRadius: '50%', pointerEvents: 'none' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-block', background: 'rgba(234,88,12,.2)', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: '#F97316', marginBottom: '14px', letterSpacing: '.5px' }}>TRẢ GÓP 0%</div>
                <h3 style={{ fontSize: '30px', fontWeight: 900, color: 'white', letterSpacing: '-.8px', marginBottom: '10px', lineHeight: 1.15, fontFamily: 'Be Vietnam Pro, sans-serif' }}>Trả góp<br />0% lãi suất</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.6)', marginBottom: '22px', lineHeight: 1.65 }}>Lên đến 24 tháng. Duyệt trong <strong style={{ color: '#F97316' }}>5 phút</strong></p>
                <button className="btn-orange" style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', color: 'white', border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>Xem điều kiện →</button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ══ PARTNER BRANDS ══ */}
      <section style={{ padding: '52px 0', marginTop: '56px', background: '#fff', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 28px' }}>
          <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '32px' }}>Thương hiệu đối tác chính hãng</p>
          {brandNames.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#D1D5DB' }}>—</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '24px', flexWrap: 'wrap' }}>
              {brandNames.map(brand => (
                <div
                  key={brand}
                  onClick={() => onNavigate('list', { search: '?keyword=' + encodeURIComponent(brand) })}
                  className="brand-logo"
                  style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui', letterSpacing: '.5px' }}
                >
                  {brand}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 28px' }}>

        {/* ══ SERVICES ══ */}
        <section style={{ padding: '56px 0 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '6px', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Cam kết của Tech Store</h2>
          <p style={{ textAlign: 'center', fontSize: '15px', color: '#9CA3AF', marginBottom: '36px' }}>Khách hàng luôn là ưu tiên hàng đầu</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Hàng chính hãng</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>100% chính hãng từ nhà sản xuất. Hoàn tiền nếu phát hiện hàng giả.</p>
            </div>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Giao hàng 2 giờ</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Nhận ngay trong 2 giờ tại TP.HCM và Hà Nội. Miễn phí giao hàng.</p>
            </div>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Bảo hành 24 tháng</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Bảo hành chính hãng 12–24 tháng. 1 đổi 1 trong 30 ngày nếu lỗi.</p>
            </div>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Trả góp 0%</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Hỗ trợ trả góp 0% lãi suất lên đến 24 tháng qua ngân hàng đối tác.</p>
            </div>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Đổi trả 30 ngày</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Không vừa ý? Hoàn trả dễ dàng trong 30 ngày, không cần lý do.</p>
            </div>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Hỗ trợ 24/7</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Đội ngũ tư vấn chuyên sâu sẵn sàng hỗ trợ bất kỳ lúc nào.</p>
            </div>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Giá tốt nhất</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Cam kết giá rẻ nhất thị trường — tìm thấy rẻ hơn, hoàn 110%.</p>
            </div>
            <div className="svc-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '26px 18px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div className="svc-icon" style={{ width: '52px', height: '52px', background: '#FFF7ED', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>Đa dạng thanh toán</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Visa, Mastercard, MoMo, ZaloPay, VNPay hoặc thanh toán khi nhận hàng.</p>
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Khách hàng nói gì?</h2>
              <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '5px' }}>
                {homeStats?.totalReviews ? `Hơn ${homeStats.totalReviews.toLocaleString('vi-VN')} đánh giá từ khách thực` : 'Đánh giá từ khách hàng thực'}
              </p>
            </div>
            {homeStats?.averageRating != null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '42px', fontWeight: 900, color: '#EA580C', letterSpacing: '-2px', lineHeight: 1, fontFamily: 'Be Vietnam Pro, sans-serif' }}>{homeStats.averageRating.toFixed(1)}</div>
                <div style={{ color: '#F59E0B', fontSize: '17px', marginTop: '2px' }}>★★★★★</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{homeStats.totalReviews.toLocaleString('vi-VN')} đánh giá</div>
              </div>
            )}
          </div>
          {reviewsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: '190px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px' }} className="animate-pulse" />
              ))}
            </div>
          ) : reviewHighlights.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
              Chưa có đánh giá nào từ khách hàng.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${reviewHighlights.length}, 1fr)`, gap: '16px' }}>
              {reviewHighlights.map((review, i) => (
                <div key={review.id} className="review-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '44px', height: '44px', background: ['linear-gradient(135deg,#F97316,#EA580C)', 'linear-gradient(135deg,#10B981,#059669)', 'linear-gradient(135deg,#F59E0B,#EA580C)'][i % 3], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', color: 'white', flexShrink: 0 }}>{avatarInitials(review.userName)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>{review.userName}</div>
                      {review.productName && (
                        <div style={{ fontSize: '12px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.productName}</div>
                      )}
                    </div>
                    <div style={{ color: '#F59E0B', fontSize: '13px', flexShrink: 0 }}>{'★'.repeat(review.rating ?? 0)}</div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.75 }}>"{review.content}"</p>
                  <div style={{ marginTop: '14px', fontSize: '11px', color: '#D1D5DB' }}>{timeAgo(review.createdAt)}</div>
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
          />
        )}


        {/* ══ NEWSLETTER ══ */}
        <section style={{ padding: '56px 0 80px' }}>
          <div style={{ background: 'linear-gradient(135deg,#F97316,#EA580C,#C2410C)', borderRadius: '24px', padding: '52px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', background: 'rgba(255,255,255,.07)', borderRadius: '50%', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '-70px', left: '-50px', width: '260px', height: '260px', background: 'rgba(255,255,255,.05)', borderRadius: '50%', pointerEvents: 'none' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Newsletter</p>
              <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '12px', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Nhận ưu đãi độc quyền mỗi tuần</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.75)', marginBottom: '28px' }}>Đăng ký nhận Flash Sale, sản phẩm mới và mã giảm giá riêng cho thành viên</p>
              
              {subscribed ? (
                <div style={{ maxWidth: '440px', margin: '0 auto', padding: '12px 20px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid #10B981', borderRadius: '10px', color: '#10B981', fontWeight: 700 }}>
                  ✅ Đã đăng ký thành công ưu đãi!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', maxWidth: '440px', margin: '0 auto' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    style={{ flex: 1, background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: '10px', padding: '12px 18px', fontSize: '14px', color: 'white', outline: 'none' }}
                  />
                  <button className="btn-orange" type="submit" style={{ background: '#fff', color: '#EA580C', border: 'none', borderRadius: '10px', padding: '12px 20px', fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap', transition: 'all .3s' }}>
                    Đăng ký
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#111827', borderTop: '1px solid rgba(255,255,255,.06)', padding: '60px 0 0' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.3fr', gap: '40px', marginBottom: '48px' }}>

            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                  }}
                >
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
                <div style={{ display: 'flex', gap: '2px' }}>
                  <span style={{ fontSize: '21px', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Tech</span>
                  <span style={{ fontSize: '21px', fontWeight: 900, color: '#EA580C', letterSpacing: '-0.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Store</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.8', marginBottom: '20px' }}>Hệ thống bán lẻ điện thoại chính hãng hàng đầu Việt Nam. Cam kết giá tốt, chất lượng và dịch vụ tận tâm.</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div
                  className="social-btn"
                  style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </div>
                <div
                  className="social-btn"
                  style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
                  title="Zalo"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 5.8 2 10.5c0 2.1 1 4 2.6 5.3L3.5 19.5c-.15.4.25.75.65.6l3.6-1.8c1.3.5 2.8.8 4.2.8 5.52 0 10-3.8 10-8.5S17.52 2 12 2zm3.3 11.5h-4.3l3-3.8h-2.8V8.5h4.1v1.2l-3 3.8h3v1z"/>
                  </svg>
                </div>
                <div
                  className="social-btn"
                  style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
                  title="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.482 20.5 12 20.5 12 20.5s7.518 0 9.388-.553a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div
                  className="social-btn"
                  style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
                  title="TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.18.97 1.13 2.37 1.83 3.84 2.02v3.9c-1.39-.03-2.74-.51-3.89-1.29-.69-.47-1.3-.1-1.3-.1v6.23c.04 4.38-3.08 8.12-7.46 8.57-4.83.67-9.31-2.73-9.91-7.53C-.38 10.82 3.19 6.2 8.08 5.76c1.17-.11 2.35.09 3.42.59v4.03c-.76-.46-1.64-.67-2.52-.61-2.32.1-4.22 1.94-4.38 4.26-.22 2.65 1.76 4.96 4.41 5.17 2.66.21 4.97-1.75 5.19-4.41.02-.27.02-.55.02-.82V0h-.3z"/>
                  </svg>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Thanh toán</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '4px 9px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>Visa</div>
                  <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '4px 9px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>Mastercard</div>
                  <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '4px 9px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>MoMo</div>
                  <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '4px 9px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>ZaloPay</div>
                  <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '4px 9px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>VNPay</div>
                  <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '4px 9px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>COD</div>
                </div>
              </div>
            </div>

            {/* Products column */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Sản phẩm</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>iPhone</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Samsung Galaxy</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>OPPO</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Xiaomi / Redmi</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Vivo</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Realme</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Google Pixel</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Phụ kiện</span>
              </div>
            </div>

            {/* Services column */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Dịch vụ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Hướng dẫn mua hàng</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Chính sách bảo hành</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Đổi trả hàng</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Trả góp 0%</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Thu cũ đổi mới</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Kiểm tra đơn hàng</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>So sánh sản phẩm</span>
              </div>
            </div>

            {/* Company column */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Công ty</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Giới thiệu</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Tuyển dụng</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Tin tức</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Hệ thống cửa hàng</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Chính sách bảo mật</span>
                <span onClick={() => onNavigate('list')} className="footer-link" style={{ fontSize: '13px', color: '#6B7280' }}>Điều khoản dịch vụ</span>
              </div>
            </div>

            {/* Contact column */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Liên hệ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#F97316', flexShrink: 0, marginTop: '3px', display: 'flex', alignItems: 'center' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.122-4.103-6.927-6.927l1.293-.97a2.25 2.25 0 00.417-1.173L7.91 3.5c-.125-.501-.575-.852-1.091-.852H5.437a2.25 2.25 0 00-2.25 2.25v1.372z"/>
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB' }}>1800 6678</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Miễn phí · 8:00–22:00</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#F97316', flexShrink: 0, marginTop: '3px', display: 'flex', alignItems: 'center' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', color: '#D1D5DB' }}>support@techstore.vn</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Phản hồi trong 2 giờ</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#F97316', flexShrink: 0, marginTop: '3px', display: 'flex', alignItems: 'center' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z"/>
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', color: '#D1D5DB' }}>123 Nguyễn Huệ, Q.1, TP.HCM</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Chứng nhận</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.28)', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: '#10B981' }}>ĐKKD</div>
                    <div style={{ background: 'rgba(249,115,22,.12)', border: '1px solid rgba(249,115,22,.28)', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: '#F97316' }}>BCER</div>
                    <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.28)', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: '#F59E0B' }}>ISO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>© 2026 TechStore JSC. GPKD số: 0123456789 do Sở KHĐT TP.HCM cấp.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span className="footer-link" style={{ fontSize: '12px', color: '#6B7280' }}>Bảo mật</span>
              <span className="footer-link" style={{ fontSize: '12px', color: '#6B7280' }}>Điều khoản</span>
              <span className="footer-link" style={{ fontSize: '12px', color: '#6B7280' }}>Cookie</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
