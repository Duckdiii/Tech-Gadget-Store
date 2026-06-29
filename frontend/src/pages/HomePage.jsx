import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

export default function HomePage() {
  const onNavigate = useNav()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [activeTab, setActiveTab] = useState('bestseller')

  // countdown state
  const [countdown, setCountdown] = useState({ h: 5, m: 34, s: 21 })
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        let { h, m, s } = c
        if (s > 0) return { h, m, s: s - 1 }
        if (m > 0) return { h, m: m - 1, s: 59 }
        if (h > 0) return { h: h - 1, m: 59, s: 59 }
        return { h: 0, m: 0, s: 0 }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = n => String(n).padStart(2, '0')

  const allProducts = {
    bestseller: [
      { name: 'iPhone 15 Pro Max', brand: 'Apple', price: '34.990.000đ', oldPrice: '39.990.000đ', discount: '-13%', badge: 'HOT', badgeColor: '#EA580C', rating: '4.9', reviews: '2.341', bgGradient: 'linear-gradient(135deg,#374151,#1F2937)' },
      { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: '28.990.000đ', oldPrice: '33.990.000đ', discount: '-15%', badge: 'MỚI', badgeColor: '#1D4ED8', rating: '4.8', reviews: '1.876', bgGradient: 'linear-gradient(135deg,#1D4ED8,#1e3a8a)' },
      { name: 'OPPO Find X7 Pro', brand: 'OPPO', price: '18.990.000đ', oldPrice: '22.990.000đ', discount: '-17%', badge: 'SALE', badgeColor: '#F97316', rating: '4.7', reviews: '934', bgGradient: 'linear-gradient(135deg,#065f46,#022c22)' },
      { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', price: '19.990.000đ', oldPrice: '24.990.000đ', discount: '-20%', badge: 'HOT', badgeColor: '#EA580C', rating: '4.7', reviews: '1.123', bgGradient: 'linear-gradient(135deg,#92400e,#451a03)' },
    ],
    new: [
      { name: 'iPhone 16 Pro', brand: 'Apple', price: '38.990.000đ', oldPrice: '', discount: '', badge: 'MỚI', badgeColor: '#1D4ED8', rating: '5.0', reviews: '432', bgGradient: 'linear-gradient(135deg,#475569,#1E293B)' },
      { name: 'Samsung Galaxy Z Fold 6', brand: 'Samsung', price: '45.990.000đ', oldPrice: '', discount: '', badge: 'MỚI', badgeColor: '#1D4ED8', rating: '4.9', reviews: '287', bgGradient: 'linear-gradient(135deg,#1e40af,#1e3a8a)' },
      { name: 'Google Pixel 9 Pro', brand: 'Google', price: '26.990.000đ', oldPrice: '', discount: '', badge: 'MỚI', badgeColor: '#1D4ED8', rating: '4.8', reviews: '156', bgGradient: 'linear-gradient(135deg,#166534,#14532d)' },
      { name: 'OnePlus 12 Pro', brand: 'OnePlus', price: '17.990.000đ', oldPrice: '', discount: '', badge: 'MỚI', badgeColor: '#1D4ED8', rating: '4.7', reviews: '389', bgGradient: 'linear-gradient(135deg,#7c1d1d,#450a0a)' },
    ],
    sale: [
      { name: 'iPhone 14', brand: 'Apple', price: '19.990.000đ', oldPrice: '26.990.000đ', discount: '-26%', badge: 'GIẢM', badgeColor: '#EA580C', rating: '4.8', reviews: '4.521', bgGradient: 'linear-gradient(135deg,#374151,#1F2937)' },
      { name: 'Samsung Galaxy A55', brand: 'Samsung', price: '8.990.000đ', oldPrice: '12.990.000đ', discount: '-31%', badge: 'GIẢM', badgeColor: '#EA580C', rating: '4.6', reviews: '2.312', bgGradient: 'linear-gradient(135deg,#1D4ED8,#1e3a8a)' },
      { name: 'Xiaomi Redmi Note 13', brand: 'Xiaomi', price: '5.490.000đ', oldPrice: '7.990.000đ', discount: '-31%', badge: 'GIẢM', badgeColor: '#EA580C', rating: '4.5', reviews: '3.421', bgGradient: 'linear-gradient(135deg,#7c2d12,#431407)' },
      { name: 'OPPO A98', brand: 'OPPO', price: '6.490.000đ', oldPrice: '9.490.000đ', discount: '-32%', badge: 'GIẢM', badgeColor: '#EA580C', rating: '4.5', reviews: '1.876', bgGradient: 'linear-gradient(135deg,#065f46,#022c22)' },
    ],
  }

  const flashItems = [
    { name: 'Samsung S23 FE', price: '9.990.000', oldPrice: '14.990.000', discount: '-33%', soldPct: '78%', bgGradient: 'linear-gradient(135deg,#1e3a8a,#0f172a)' },
    { name: 'iPhone 13', price: '14.990.000', oldPrice: '21.990.000', discount: '-32%', soldPct: '92%', bgGradient: 'linear-gradient(135deg,#374151,#1F2937)' },
    { name: 'Xiaomi 13T Pro', price: '8.990.000', oldPrice: '13.990.000', discount: '-35%', soldPct: '65%', bgGradient: 'linear-gradient(135deg,#7c2d12,#431407)' },
    { name: 'OPPO Reno 11', price: '7.990.000', oldPrice: '11.990.000', discount: '-28%', soldPct: '54%', bgGradient: 'linear-gradient(135deg,#065f46,#022c22)' },
    { name: 'Vivo V29e', price: '5.990.000', oldPrice: '8.490.000', discount: '-29%', soldPct: '41%', bgGradient: 'linear-gradient(135deg,#4c1d95,#2e1065)' },
    { name: 'Realme GT Neo 5', price: '6.490.000', oldPrice: '9.990.000', discount: '-35%', soldPct: '67%', bgGradient: 'linear-gradient(135deg,#c2410c,#7c2d12)' },
  ]

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
                <text x="58" y="371" fontFamily="system-ui" fontSize="10" fill="rgba(255,255,255,.4)">iPhone 15 Pro Max • Titan đen</text>
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

            {/* Floating chips */}
            <div className="animate-float2" style={{ position: 'absolute', left: '-52px', top: '20%', background: '#fff', border: '1px solid rgba(234,88,12,.25)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>Camera</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>200 MP</div>
              <div style={{ fontSize: '10px', color: '#EA580C', fontWeight: 600 }}>Pro Optical Zoom</div>
            </div>
            <div className="animate-float" style={{ position: 'absolute', right: '-36px', top: '29%', background: '#fff', border: '1px solid rgba(16,185,129,.25)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', whiteSpace: 'nowrap', animationDelay: '0.8s' }}>
              <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>Chip</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>A18 Pro</div>
              <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>Apple Silicon</div>
            </div>
            <div className="animate-float2" style={{ position: 'absolute', right: '-30px', bottom: '20%', background: '#fff', border: '1px solid rgba(234,88,12,.25)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>Giảm còn</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#EA580C' }}>34.990.000đ</div>
              <div style={{ fontSize: '10px', color: '#F97316', fontWeight: 600 }}>Tiết kiệm 5 triệu</div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ maxWidth: '1300px', margin: '56px auto 0', padding: '0 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#E5E7EB', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <div style={{ background: '#fff', padding: '22px 28px', textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>500+</div><div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Mẫu điện thoại</div></div>
            <div style={{ background: '#fff', padding: '22px 28px', textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: 900, color: '#EA580C', letterSpacing: '-1px' }}>50+</div><div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Cửa hàng toàn quốc</div></div>
            <div style={{ background: '#fff', padding: '22px 28px', textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>1M+</div><div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Khách hàng tin dùng</div></div>
            <div style={{ background: '#fff', padding: '22px 28px', textAlign: 'center' }}><div style={{ fontSize: '30px', fontWeight: 900, color: '#10B981', letterSpacing: '-1px' }}>4.9★</div><div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Đánh giá trung bình</div></div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 28px' }}>


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
          <div className="scroll-x" style={{ display: 'flex', gap: '12px' }}>
            {flashItems.map((item, index) => (
              <div key={index} onClick={() => onNavigate('detail')} className="flash-card" style={{ flexShrink: 0, width: '196px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ height: '148px', background: item.bgGradient, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="62" height="102" viewBox="0 0 62 102" fill="none">
                    <rect x="3" y="0" width="56" height="102" rx="10" fill="rgba(255,255,255,.09)"></rect>
                    <rect x="8" y="6" width="46" height="90" rx="7" fill="rgba(255,255,255,.05)"></rect>
                    <rect x="20" y="2" width="22" height="5" rx="2.5" fill="rgba(0,0,0,.4)"></rect>
                    <rect x="19" y="93" width="24" height="3" rx="1.5" fill="rgba(255,255,255,.28)"></rect>
                  </svg>
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#EA580C', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>{item.discount}</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '7px 10px', background: 'linear-gradient(transparent,rgba(0,0,0,.55))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.6)' }}>Đã bán</span>
                      <span style={{ fontSize: '10px', color: '#FCD34D', fontWeight: 700 }}>{item.soldPct}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,.15)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#FCD34D,#F97316)', borderRadius: '2px', width: item.soldPct }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', lineHeight: '1.4', marginBottom: '6px', minHeight: '36px' }}>{item.name}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#EA580C', letterSpacing: '-.3px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{item.price}đ</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through', marginTop: '1px' }}>{item.oldPrice}đ</div>
                </div>
              </div>
            ))}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            {allProducts[activeTab].map((item, index) => (
              <div key={index} onClick={() => onNavigate('detail')} className="product-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, background: item.badgeColor, color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '6px' }}>{item.badge}</div>
                <div
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, background: 'rgba(0,0,0,.06)', border: '1px solid rgba(0,0,0,.08)', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 4h11M1.5 7h11M1.5 10h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"></path>
                  </svg>
                </div>
                <div className="p-img" style={{ height: '190px', background: item.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  <svg width="76" height="128" viewBox="0 0 76 128" fill="none">
                    <rect x="3" y="0" width="70" height="128" rx="12" fill="rgba(255,255,255,.1)"></rect>
                    <rect x="9" y="7" width="58" height="114" rx="9" fill="rgba(255,255,255,.06)"></rect>
                    <rect x="26" y="3" width="24" height="7" rx="3.5" fill="rgba(0,0,0,.45)"></rect>
                    <circle cx="38" cy="6.5" r="2.5" fill="rgba(0,0,0,.7)"></circle>
                    <rect x="23" y="117" width="30" height="4" rx="2" fill="rgba(255,255,255,.28)"></rect>
                  </svg>
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.brand}</div>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', lineHeight: '1.45', marginBottom: '8px', minHeight: '41px' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                    <span style={{ color: '#F59E0B', fontSize: '12px', letterSpacing: '1px' }}>★★★★★</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B' }}>{item.rating}</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({item.reviews})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#EA580C', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{item.price}</span>
                    {item.oldPrice && <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>{item.oldPrice}</span>}
                    {item.discount && <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>{item.discount}</span>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigate('cart'); }}
                    className="p-btn btn-orange"
                    style={{ width: '100%', background: 'linear-gradient(135deg,#F97316,#EA580C)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: 0.9, transform: 'translateY(5px)' }}
                  >
                    🛒 Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            ))}
          </div>

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '24px', flexWrap: 'wrap' }}>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '26px', fontWeight: 900, color: '#111827', letterSpacing: '-1px', fontFamily: '-apple-system,system-ui' }}>Apple</div>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui', letterSpacing: '.5px' }}>SAMSUNG</div>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui', letterSpacing: '1px' }}>OPPO</div>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui' }}>Xiaomi</div>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui', letterSpacing: '.5px' }}>VIVO</div>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui' }}>realme</div>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui' }}>Google</div>
            <div onClick={() => onNavigate('list')} className="brand-logo" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'system-ui', letterSpacing: '2px' }}>SONY</div>
          </div>
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
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '7px' }}>50+ Showroom</h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.65' }}>Trải nghiệm trực tiếp tại hơn 50 showroom khắp toàn quốc.</p>
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Khách hàng nói gì?</h2>
              <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '5px' }}>Hơn 10.000+ đánh giá 5 sao từ khách thực</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#EA580C', letterSpacing: '-2px', lineHeight: 1, fontFamily: 'Be Vietnam Pro, sans-serif' }}>4.9</div>
              <div style={{ color: '#F59E0B', fontSize: '17px', marginTop: '2px' }}>★★★★★</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>10.000+ đánh giá</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <div className="review-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#F97316,#EA580C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', color: 'white', flexShrink: 0 }}>HN</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>Hoàng Nam</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>TP.HCM · iPhone 15 Pro Max</div>
                </div>
                <div style={{ color: '#F59E0B', fontSize: '13px', flexShrink: 0 }}>★★★★★</div>
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.75 }}>"Mua iPhone tại Tech Store lần này cực kỳ hài lòng. Máy chính hãng, seal đầy đủ, giao trong 1.5 giờ. Nhân viên rất nhiệt tình và am hiểu sản phẩm."</p>
              <div style={{ marginTop: '14px', fontSize: '11px', color: '#D1D5DB' }}>2 ngày trước</div>
            </div>
            <div className="review-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#10B981,#059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', color: 'white', flexShrink: 0 }}>LA</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>Lan Anh</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Hà Nội · Samsung S24 Ultra</div>
                </div>
                <div style={{ color: '#F59E0B', fontSize: '13px', flexShrink: 0 }}>★★★★★</div>
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.75 }}>"Giá ở đây rẻ hơn nhiều so với các chỗ khác, lại còn được trả góp 0% 12 tháng. Chính sách đổi trả rõ ràng, không phiền hà. Sẽ ủng hộ dài dài!"</p>
              <div style={{ marginTop: '14px', fontSize: '11px', color: '#D1D5DB' }}>5 ngày trước</div>
            </div>
            <div className="review-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#F59E0B,#EA580C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', color: 'white', flexShrink: 0 }}>MT</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>Minh Tú</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Đà Nẵng · Xiaomi 14 Ultra</div>
                </div>
                <div style={{ color: '#F59E0B', fontSize: '13px', flexShrink: 0 }}>★★★★★</div>
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.75 }}>"Thu cũ đổi mới giá hời lắm! Mình đổi iPhone 13 được trợ giá 2.5 triệu. Showroom sạch sẽ, thoải mái trải nghiệm trước khi mua rất thích."</p>
              <div style={{ marginTop: '14px', fontSize: '11px', color: '#D1D5DB' }}>1 tuần trước</div>
            </div>
          </div>
        </section>

        {/* ══ BLOG ══ */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-.5px', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Tin tức công nghệ</h2>
            <span onClick={() => onNavigate('list')} style={{ fontSize: '14px', color: '#EA580C', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <div className="blog-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <div className="b-img" style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#F97316,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>📱</div>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(234,88,12,.9)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px' }}>REVIEW</div>
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>15 Tháng 6, 2026 · 5 phút đọc</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', lineHeight: 1.5, marginBottom: '8px' }}>Đánh giá iPhone 16 Pro Max: Đỉnh cao hay chưa?</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.65, marginBottom: '14px' }}>Camera 48MP, chip A18 Pro, thiết kế Titan sang trọng...</p>
                <span onClick={() => onNavigate('list')} style={{ fontSize: '13px', color: '#EA580C', fontWeight: 600, cursor: 'pointer' }}>Đọc tiếp →</span>
              </div>
            </div>
            <div className="blog-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <div className="b-img" style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1D4ED8,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>🔥</div>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(234,88,12,.9)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px' }}>HOT</div>
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>12 Tháng 6, 2026 · 3 phút đọc</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', lineHeight: 1.5, marginBottom: '8px' }}>Top 5 Samsung tốt nhất tháng 6/2026</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.65, marginBottom: '14px' }}>Galaxy S24 Ultra, Z Fold 6, A55... mẫu nào đáng mua nhất?</p>
                <span onClick={() => onNavigate('list')} style={{ fontSize: '13px', color: '#EA580C', fontWeight: 600, cursor: 'pointer' }}>Đọc tiếp →</span>
              </div>
            </div>
            <div className="blog-card" style={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <div className="b-img" style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#111827,#374151)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>💡</div>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(234,88,12,.9)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px' }}>MẸO HAY</div>
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>10 Tháng 6, 2026 · 4 phút đọc</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', lineHeight: 1.5, marginBottom: '8px' }}>10 mẹo chọn mua điện thoại không bị hớ</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.65, marginBottom: '14px' }}>Những điều cần lưu ý để không mua nhầm hàng kém chất lượng...</p>
                <span onClick={() => onNavigate('list')} style={{ fontSize: '13px', color: '#EA580C', fontWeight: 600, cursor: 'pointer' }}>Đọc tiếp →</span>
              </div>
            </div>
          </div>
        </section>

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
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>+ 49 chi nhánh khác</div>
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
