import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

/* ── Countdown ── */
function Countdown() {
  const [total, setTotal] = useState(12 * 3600 + 45 * 60 + 30)
  useEffect(() => {
    const t = setInterval(() => setTotal(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-medium" style={{ color: 'var(--ct3)' }}>Kết thúc sau</span>
      <div className="flex items-center gap-1">
        {[[h, 'GIỜ'], [m, 'PHÚT'], [s, 'GIÂY']].map(([val, label], i) => (
          <div key={label} className="flex items-center gap-1">
            {i > 0 && (
              <span className="font-black text-[16px] leading-none" style={{ color: 'var(--cb)', lineHeight: '2.5rem' }}>:</span>
            )}
            <div className="flex flex-col items-center">
              <div
                className="w-11 h-10 flex items-center justify-center font-black tabular-nums"
                style={{
                  fontSize: '19px',
                  background: 'linear-gradient(160deg, #1a202c 0%, #2d3748 100%)',
                  color: 'var(--accent)',
                  borderRadius: '8px',
                  fontFamily: 'Syne, sans-serif',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {String(val).padStart(2, '0')}
              </div>
              <span className="text-[8px] font-bold tracking-widest mt-1" style={{ color: 'var(--ct3)' }}>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Flash Sale Card ── */
function FlashCard({ badge, lowStock = false, name, reviews, price, originalPrice, image, stockLeft = 60 }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="flex-1 min-w-0 overflow-hidden cursor-pointer relative"
      style={{
        backgroundColor: 'var(--card)',
        border: `1.5px solid ${hovered ? 'var(--accent)' : 'var(--cb)'}`,
        borderRadius: '16px',
        boxShadow: hovered ? '0 16px 44px rgba(232,66,10,0.13)' : '0 2px 10px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {badge && (
        <span
          className="absolute top-3 left-3 z-10 text-[10px] font-black px-2.5 py-1 text-white uppercase tracking-widest"
          style={{ backgroundColor: lowStock ? '#ef4444' : 'var(--accent)', borderRadius: '20px' }}
        >
          {badge}
        </span>
      )}

      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #f8faff 0%, #edf2f7 100%)', borderRadius: '14px 14px 0 0' }}
      >
        <img
          src={image}
          alt={name}
          className="w-28 h-28 object-contain"
          style={{
            transform: hovered ? 'scale(1.08) translateY(-3px)' : 'scale(1)',
            transition: 'transform 0.32s ease',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
          }}
        />
        {hovered && (
          <div
            className="absolute bottom-0 left-0 right-0 h-14"
            style={{ background: 'linear-gradient(to top, rgba(232,66,10,0.07), transparent)' }}
          />
        )}
      </div>

      <div className="p-4">
        <p className="text-[13px] font-semibold leading-snug mb-3 line-clamp-2 min-h-[2.6rem]" style={{ color: 'var(--ct1)' }}>
          {name}
        </p>

        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px]" style={{ color: 'var(--ct3)' }}>Đã bán {100 - stockLeft}%</span>
            {lowStock
              ? <span className="text-[10px] font-bold" style={{ color: '#ef4444' }}>⚡ Sắp hết hàng</span>
              : <span className="text-[10px]" style={{ color: 'var(--ct3)' }}>Còn {stockLeft}%</span>
            }
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--page)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${100 - stockLeft}%`,
                background: lowStock
                  ? 'linear-gradient(90deg, #ef4444, #f87171)'
                  : 'linear-gradient(90deg, var(--accent), #ff6b35)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3" style={{ color: i < 4 ? '#F59E0B' : '#e5e7eb' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[10px] ml-1" style={{ color: 'var(--ct3)' }}>({reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold" style={{ fontSize: '17px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{price}</span>
            {originalPrice && (
              <span className="text-[11px] ml-2 line-through" style={{ color: 'var(--ct3)' }}>{originalPrice}</span>
            )}
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white transition-opacity"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '8px', opacity: hovered ? 1 : 0.88 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Thêm
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Featured Product Card ── */
function FeaturedCard({ name, brand, price, originalPrice, rating, reviews, image, tag }) {
  const [hovered, setHovered] = useState(false)
  const [wished, setWished] = useState(false)
  return (
    <div
      className="overflow-hidden cursor-pointer relative group"
      style={{
        backgroundColor: 'var(--card)',
        border: `1.5px solid ${hovered ? '#c8d0e4' : 'var(--cb)'}`,
        borderRadius: '14px',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {tag && (
        <span
          className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 text-white uppercase tracking-wide"
          style={{ backgroundColor: tag === 'Mới' ? '#059669' : 'var(--accent)', borderRadius: '20px' }}
        >
          {tag}
        </span>
      )}
      <button
        onClick={e => { e.stopPropagation(); setWished(w => !w) }}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        style={{
          backgroundColor: wished ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.9)',
          border: `1px solid ${wished ? 'rgba(239,68,68,0.3)' : 'var(--cb)'}`,
          borderRadius: '50%',
          color: wished ? '#ef4444' : 'var(--ct3)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <svg className="w-3.5 h-3.5" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--page)', borderBottom: '1px solid var(--cb)' }}
      >
        <img
          src={image}
          alt={name}
          className="w-32 h-32 object-contain"
          style={{
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.3s ease',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
          }}
        />
      </div>

      <div className="p-4">
        {brand && (
          <span className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--ct3)' }}>{brand}</span>
        )}
        <p className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2 min-h-[2.6rem]" style={{ color: 'var(--ct1)' }}>
          {name}
        </p>

        <div className="flex items-center gap-1 mb-2.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3" style={{ color: i < rating ? '#F59E0B' : '#e5e7eb' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[10px] ml-1" style={{ color: 'var(--ct3)' }}>({reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold" style={{ fontSize: '16px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{price}</span>
            {originalPrice && (
              <span className="text-[11px] ml-1.5 line-through" style={{ color: 'var(--ct3)' }}>{originalPrice}</span>
            )}
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-white transition-all"
            style={{
              backgroundColor: hovered ? 'var(--accent)' : 'var(--s3)',
              borderRadius: '8px',
              color: hovered ? 'white' : 'var(--ct2)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── HomePage ── */
export default function HomePage() {
  const onNavigate = useNav()
  const [email, setEmail] = useState('')
  const [activeTab, setActiveTab] = useState('popular')
  const [heroSlide, setHeroSlide] = useState(0)

  /* Auto-rotate hero indicator */
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % 3), 5000)
    return () => clearInterval(t)
  }, [])

  const categories = [
    { label: 'Điện thoại', count: '120+ sản phẩm', accent: '#4F46E5', icon: <PhoneIcon />, desc: 'iPhone, Samsung, Xiaomi...' },
    { label: 'Laptop', count: '80+ sản phẩm', accent: '#7C3AED', icon: <LaptopIcon />, desc: 'MacBook, Dell, Asus...' },
    { label: 'Tai nghe', count: '60+ sản phẩm', accent: '#D97706', icon: <HeadphoneIconSm />, desc: 'AirPods, Sony, JBL...' },
    { label: 'Smartwatch', count: '45+ sản phẩm', accent: '#059669', icon: <WatchIcon />, desc: 'Apple Watch, Galaxy Watch...' },
    { label: 'Phụ kiện', count: '200+ sản phẩm', accent: '#E8420A', icon: <BoltIcon />, desc: 'Sạc, ốp lưng, cáp...' },
    { label: 'Gaming', count: '55+ sản phẩm', accent: '#374151', icon: <GamingIcon />, desc: 'Chuột, bàn phím, tai nghe...' },
  ]

  const featuredProducts = {
    popular: [
      { name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', price: '28.990.000₫', originalPrice: '33.500.000₫', rating: 5, reviews: 342, image: 'https://placehold.co/300x300/EEF1F9/475569?text=iPhone+15', tag: 'Hot' },
      { name: 'Samsung Galaxy S24 Ultra 256GB', brand: 'Samsung', price: '26.990.000₫', originalPrice: '31.990.000₫', rating: 5, reviews: 218, image: 'https://placehold.co/300x300/EEF1F9/475569?text=Galaxy+S24' },
      { name: 'MacBook Air M3 15" 256GB', brand: 'Apple', price: '32.490.000₫', rating: 4, reviews: 156, image: 'https://placehold.co/300x300/EEF1F9/475569?text=MacBook+Air' },
      { name: 'iPad Pro M4 11" WiFi 256GB', brand: 'Apple', price: '25.990.000₫', originalPrice: '28.990.000₫', rating: 5, reviews: 89, image: 'https://placehold.co/300x300/EEF1F9/475569?text=iPad+Pro' },
    ],
    new: [
      { name: 'Samsung Galaxy Z Fold6 256GB', brand: 'Samsung', price: '40.990.000₫', rating: 4, reviews: 45, image: 'https://placehold.co/300x300/EEF1F9/475569?text=Z+Fold6', tag: 'Mới' },
      { name: 'Sony WF-1000XM5 True Wireless', brand: 'Sony', price: '5.990.000₫', rating: 5, reviews: 67, image: 'https://placehold.co/300x300/EEF1F9/475569?text=Sony+WF', tag: 'Mới' },
      { name: 'Apple Watch Ultra 2 49mm', brand: 'Apple', price: '21.490.000₫', rating: 5, reviews: 34, image: 'https://placehold.co/300x300/EEF1F9/475569?text=Watch+Ultra', tag: 'Mới' },
      { name: 'Xiaomi 14 Ultra 512GB', brand: 'Xiaomi', price: '23.990.000₫', rating: 4, reviews: 28, image: 'https://placehold.co/300x300/EEF1F9/475569?text=Xiaomi+14', tag: 'Mới' },
    ],
    bestseller: [
      { name: 'AirPods Pro 2nd Generation', brand: 'Apple', price: '4.990.000₫', originalPrice: '5.990.000₫', rating: 5, reviews: 892, image: 'https://placehold.co/300x300/EEF1F9/475569?text=AirPods+Pro', tag: '#1' },
      { name: 'Samsung Galaxy A55 5G 128GB', brand: 'Samsung', price: '9.490.000₫', rating: 4, reviews: 567, image: 'https://placehold.co/300x300/EEF1F9/475569?text=Galaxy+A55', tag: '#2' },
      { name: 'Xiaomi Redmi Note 13 Pro 256GB', brand: 'Xiaomi', price: '6.990.000₫', rating: 4, reviews: 445, image: 'https://placehold.co/300x300/EEF1F9/475569?text=Redmi+Note+13', tag: '#3' },
      { name: 'Logitech MX Master 3S', brand: 'Logitech', price: '2.190.000₫', originalPrice: '2.690.000₫', rating: 5, reviews: 378, image: 'https://placehold.co/300x300/EEF1F9/475569?text=MX+Master', tag: '#4' },
    ],
  }

  const testimonials = [
    { name: 'Nguyễn Minh Tuấn', avatar: 'MT', role: 'Mua iPhone 15 Pro Max', rating: 5, text: 'Giao hàng cực nhanh, nhận trong 2 giờ tại HCM. Máy nguyên seal, phụ kiện đầy đủ. Rất hài lòng với dịch vụ!', date: '2 tuần trước' },
    { name: 'Trần Thị Hương', avatar: 'TH', role: 'Mua MacBook Air M3', rating: 5, text: 'Tư vấn rất nhiệt tình, hỗ trợ cài đặt máy miễn phí. Giá tốt hơn cửa hàng khác, lại có bảo hành 12 tháng Apple.', date: '1 tháng trước' },
    { name: 'Lê Quốc Bảo', avatar: 'LB', role: 'Mua Samsung Galaxy S24 Ultra', rating: 4, text: 'Đặt hàng online rất tiện, thanh toán dễ dàng. Sản phẩm chính hãng 100%. Sẽ quay lại mua tiếp!', date: '3 tuần trước' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--ink)', minHeight: '460px' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.055) 1px, transparent 0)',
            backgroundSize: '30px 30px',
          }}
        />
        <div
          className="absolute top-0 right-0 w-[640px] h-[580px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(232,66,10,0.09) 0%, transparent 62%)' }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-12 py-16 flex items-center gap-16">
          {/* Left */}
          <div className="flex-1 py-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="live-dot" />
              <span
                className="text-[10px] font-bold tracking-[0.22em] uppercase px-3 py-1.5 text-white"
                style={{ backgroundColor: 'var(--accent)', borderRadius: '20px' }}
              >
                Flash Deal · Hôm nay
              </span>
            </div>

            <h1
              className="font-extrabold leading-[1.0] mb-2"
              style={{ fontSize: 'clamp(2.6rem, 4.5vw, 3.8rem)', color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}
            >
              iPhone 15 Pro Max
            </h1>
            <h2
              className="font-extrabold leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontFamily: 'Syne, sans-serif' }}
            >
              <span style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, #ff6b35 100%)',
                backgroundClip: 'text',
              }}>
                Titan. Đỉnh cao.
              </span>
            </h2>

            <p className="text-[14px] leading-7 mb-8 max-w-[390px]" style={{ color: 'var(--ct2)' }}>
              Camera 48MP · Chip A17 Pro · Khung titan aerospace.<br />
              Flagship thực sự dành cho người dùng thực sự.<br />
              <span className="font-semibold" style={{ color: 'var(--ct1)' }}>Giao trong ngày tại TP.HCM &amp; Hà Nội.</span>
            </p>

            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => onNavigate('list')}
                className="inline-flex items-center gap-2 font-bold text-[14px] px-7 py-3.5 text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, #be330a 100%)',
                  borderRadius: '12px',
                  boxShadow: '0 6px 18px rgba(232,66,10,0.38)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(232,66,10,0.48)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(232,66,10,0.38)' }}
              >
                Mua ngay — 28.990.000₫
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                className="font-semibold text-[14px] px-7 py-3.5 transition-all"
                style={{ color: 'var(--ct2)', border: '1.5px solid var(--cb)', borderRadius: '12px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ct3)'; e.currentTarget.style.color = 'var(--ct1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct2)' }}
              >
                So sánh máy
              </button>
            </div>

            {/* Hero carousel dots */}
            <div className="flex items-center gap-2 mb-8">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => setHeroSlide(i)}
                  className="transition-all duration-300"
                  style={{
                    width: heroSlide === i ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: heroSlide === i ? 'var(--accent)' : 'var(--cb)',
                  }}
                />
              ))}
            </div>

            <div className="flex items-stretch gap-8 pt-6" style={{ borderTop: '1px solid var(--b1)' }}>
              {[
                { val: '28.990.000₫', label: 'Giá tốt nhất', color: '#E8420A' },
                { val: '12 tháng', label: 'Bảo hành Apple', color: '#059669' },
                { val: 'Giao 2h', label: 'Nội thành HCM / HN', color: '#4F46E5' },
              ].map(({ val, label, color }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <p className="font-bold text-[13px]" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>{val}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--ct3)' }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone */}
          <div className="shrink-0 w-[340px] h-[460px] flex items-center justify-center relative">
            <div
              className="absolute w-80 h-80 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(232,66,10,0.13) 0%, transparent 65%)', animation: 'glow-pulse 3.5s ease-in-out infinite' }}
            />
            <div className="absolute w-64 h-64 rounded-full pointer-events-none" style={{ border: '1px solid rgba(232,66,10,0.10)' }} />
            <div className="absolute w-48 h-48 rounded-full border-dashed pointer-events-none" style={{ borderColor: 'rgba(232,66,10,0.14)', borderWidth: 1 }} />

            <div className="relative z-10 hero-float" style={{ filter: 'drop-shadow(0 28px 52px rgba(0,0,0,0.20))' }}>
              <div
                className="w-[192px] h-[390px] relative"
                style={{
                  borderRadius: '46px',
                  backgroundColor: '#1C1C1E',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.07) inset, 0 20px 60px rgba(0,0,0,0.32)',
                }}
              >
                {/* Screen */}
                <div
                  className="absolute flex flex-col overflow-hidden"
                  style={{ inset: '3px', borderRadius: '43px', backgroundColor: '#080a0e' }}
                >
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-5 pt-3 pb-0.5">
                    <span className="text-[7.5px] font-bold text-white">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4.5 h-2.5 border rounded-sm flex items-center px-0.5" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
                        <div className="h-full w-3/4 rounded-sm" style={{ backgroundColor: '#4ade80' }} />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic island */}
                  <div className="mx-auto mt-1 w-16 h-[18px] rounded-full" style={{ backgroundColor: '#080a0e', border: '1px solid rgba(255,255,255,0.06)' }} />

                  {/* Content */}
                  <div className="flex-1 px-5 flex flex-col justify-center">
                    <div className="text-[7px] font-black tracking-[0.3em] mb-2.5" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>
                      iPHONE 15 PRO MAX
                    </div>
                    <div className="h-px mb-3.5" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                    <div className="space-y-1.5">
                      {[['Camera', '48 MP · f/1.78'], ['Display', '6.7" ProMotion 120Hz'], ['Chip', 'A17 Pro · 6-core GPU'], ['Storage', '8 GB RAM · 256 GB']].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.32)' }}>{k}</span>
                          <span className="text-[7px] font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px mt-3.5 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-[11px] font-extrabold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>28.990.000₫</div>
                      <div className="text-[7px] line-through" style={{ color: 'rgba(255,255,255,0.28)' }}>33.500.000₫</div>
                      <div
                        className="mt-1.5 px-3.5 py-1 text-[7px] font-bold text-white rounded-full"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #ff6b35)' }}
                      >
                        Mua ngay
                      </div>
                    </div>
                    <div className="mt-3 text-center" style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.28)' }}>
                      Còn 14 máy · Giao trong ngày tại HCM
                    </div>
                  </div>
                </div>

                {/* Physical buttons */}
                <div className="absolute right-0 top-[92px] w-[3px] h-14 rounded-l-sm" style={{ backgroundColor: '#3A3A3C' }} />
                <div className="absolute left-0 top-[76px] w-[3px] h-7 rounded-r-sm" style={{ backgroundColor: '#3A3A3C' }} />
                <div className="absolute left-0 top-[110px] w-[3px] h-7 rounded-r-sm" style={{ backgroundColor: '#3A3A3C' }} />
                <div className="absolute left-0 top-[55px] w-[3px] h-5 rounded-r-sm" style={{ backgroundColor: '#3A3A3C' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES — Bento Grid ── */}
      <section className="py-12" style={{ backgroundColor: 'var(--ink)', borderTop: '1px solid var(--b1)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Khám phá danh mục</h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--ct3)' }}>500+ sản phẩm chính hãng đang chờ bạn</p>
            </div>
            <button
              className="text-[12px] font-semibold transition-colors"
              style={{ color: 'var(--accent)' }}
              onClick={() => onNavigate('list')}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Xem tất cả →
            </button>
          </div>

          {/* Bento: 2 large left + 4 small right */}
          <div className="grid grid-cols-12 gap-4" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
            {categories.map(({ label, count, accent, icon, desc }, idx) => {
              const isLarge = idx < 2
              return (
                <button
                  key={label}
                  onClick={() => onNavigate('list')}
                  className={`group flex ${isLarge ? 'flex-col items-start p-7 col-span-4 row-span-2' : 'flex-col items-center py-6 px-4 col-span-2'} transition-all duration-250 cursor-pointer relative overflow-hidden`}
                  style={{
                    backgroundColor: 'var(--card)',
                    border: '1.5px solid var(--cb)',
                    borderRadius: '16px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = accent
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = `0 14px 36px ${accent}22`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--cb)'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Subtle gradient overlay for large cards */}
                  {isLarge && (
                    <div
                      className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-[0.06] group-hover:opacity-[0.12] transition-opacity"
                      style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 70%)` }}
                    />
                  )}
                  <div
                    className={`${isLarge ? 'w-14 h-14 mb-4' : 'w-12 h-12 mb-3.5'} flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110 duration-250`}
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                  >
                    {icon}
                  </div>
                  <p className={`${isLarge ? 'text-[16px]' : 'text-[13px]'} font-bold ${isLarge ? 'text-left' : 'text-center'}`} style={{ color: 'var(--ct1)' }}>{label}</p>
                  <p className={`${isLarge ? 'text-[12px]' : 'text-[10px]'} mt-0.5 ${isLarge ? 'text-left' : 'text-center'}`} style={{ color: 'var(--ct3)' }}>{count}</p>
                  {isLarge && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--ct3)' }}>{desc}</p>
                  )}
                  {isLarge && (
                    <span
                      className="mt-auto pt-4 text-[12px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: accent }}
                    >
                      Khám phá ngay
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PROMOTION BANNERS ── */}
      <section className="py-4" style={{ backgroundColor: 'var(--ink)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-2 gap-4">
            <div
              className="promo-banner relative overflow-hidden px-8 py-7 flex items-center justify-between cursor-pointer group"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '16px',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
              <div className="relative z-10">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Ưu đãi combo</p>
                <p className="text-[18px] font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Mua kèm phụ kiện giảm 30%</p>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Áp dụng cho tất cả điện thoại, laptop</p>
              </div>
              <div className="promo-icon relative z-10 w-16 h-16 flex items-center justify-center rounded-2xl transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
              </div>
            </div>

            <div
              className="promo-banner relative overflow-hidden px-8 py-7 flex items-center justify-between cursor-pointer group"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                borderRadius: '16px',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
              <div className="relative z-10">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Trả góp dễ dàng</p>
                <p className="text-[18px] font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Trả góp 0% cho đơn từ 3 triệu</p>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Duyệt nhanh trong 5 phút · Không thế chấp</p>
              </div>
              <div className="promo-icon relative z-10 w-16 h-16 flex items-center justify-center rounded-2xl transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLASH SALE ── */}
      <section className="py-12" style={{ backgroundColor: 'var(--page)', borderTop: '1px solid var(--cb)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 rounded-full" style={{ background: 'linear-gradient(180deg, var(--accent), #ff6b35)' }} />
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--accent)' }}>
                    Flash Deal hôm nay
                  </span>
                </div>
                <h2 className="text-[22px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Giá sốc có hạn</h2>
              </div>
            </div>
            <Countdown />
          </div>

          <div className="grid grid-cols-4 gap-5">
            <FlashCard
              badge="-20%"
              name="Sony WH-1000XM5 Chống ồn chủ động ANC"
              reviews={128}
              price="6.990.000₫"
              originalPrice="8.490.000₫"
              stockLeft={35}
              image="https://placehold.co/300x300/EEF1F9/475569?text=Sony+XM5"
            />
            <FlashCard
              badge="-15%"
              name="AirPods Pro thế hệ 2 · Chống ồn thích nghi"
              reviews={452}
              price="4.990.000₫"
              originalPrice="5.990.000₫"
              stockLeft={54}
              image="https://placehold.co/300x300/EEF1F9/475569?text=AirPods+Pro"
            />
            <FlashCard
              name="Logitech MX Master 3S + Keys Mini Combo"
              reviews={89}
              price="3.890.000₫"
              stockLeft={71}
              image="https://placehold.co/300x300/EEF1F9/475569?text=MX+Master"
            />
            <FlashCard
              badge="Sắp hết!"
              lowStock
              name="Amazon Echo Studio Loa thông minh Hi-Fi"
              reviews={210}
              price="3.490.000₫"
              stockLeft={11}
              image="https://placehold.co/300x300/EEF1F9/475569?text=Echo+Studio"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onNavigate('list')}
              className="inline-flex items-center gap-2 font-semibold text-[13px] px-8 py-3.5 text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #be330a)',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(232,66,10,0.28)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,66,10,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,66,10,0.28)' }}
            >
              Xem tất cả sản phẩm
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-12" style={{ backgroundColor: 'var(--ink)', borderTop: '1px solid var(--b1)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Sản phẩm nổi bật</h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--ct3)' }}>Được khách hàng yêu thích nhất</p>
            </div>
            <div className="flex items-center gap-1" style={{ borderBottom: '2px solid var(--b1)' }}>
              {[
                { key: 'popular', label: 'Phổ biến' },
                { key: 'new', label: 'Mới về' },
                { key: 'bestseller', label: 'Bán chạy' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`featured-tab px-4 py-2.5 text-[13px] font-semibold ${activeTab === tab.key ? 'active' : ''}`}
                  style={{ color: activeTab === tab.key ? 'var(--accent)' : 'var(--ct3)' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-5">
            {featuredProducts[activeTab].map((product, idx) => (
              <FeaturedCard key={`${activeTab}-${idx}`} {...product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onNavigate('list')}
              className="inline-flex items-center gap-2 font-semibold text-[13px] px-6 py-3 transition-all"
              style={{ color: 'var(--ct2)', border: '1.5px solid var(--cb)', borderRadius: '12px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct2)' }}
            >
              Xem thêm sản phẩm
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="py-10" style={{ backgroundColor: 'var(--page)', borderTop: '1px solid var(--cb)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-baseline justify-between mb-7">
            <div>
              <h2 className="text-[20px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Thương hiệu chính hãng</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--ct3)' }}>8 hãng · 100% hàng chính hãng có giấy tờ</p>
            </div>
          </div>
          <div className="grid grid-cols-8 gap-3">
            {[
              { name: 'Apple',   sub: 'iPhone · Mac',  color: '#1c1c1e', icon: <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg> },
              { name: 'Samsung', sub: 'Galaxy · Tab',  color: '#1428A0', icon: <span className="text-[17px] font-black text-white">S</span> },
              { name: 'Xiaomi',  sub: 'Redmi · Mi',   color: '#FF6900', icon: <span className="text-sm font-black text-white">MI</span> },
              { name: 'OPPO',    sub: 'Reno · Find',  color: '#1D5C4A', icon: <span className="text-[10px] font-black tracking-wide text-white">OPPO</span> },
              { name: 'vivo',    sub: 'V · Y · X',    color: '#415FFF', icon: <span className="text-sm font-black italic text-white">vivo</span> },
              { name: 'realme',  sub: 'C · Note',     color: '#F5A623', icon: <span className="text-[9px] font-black tracking-wide leading-none text-center text-white">real<br/>me</span> },
              { name: 'OnePlus', sub: 'Nord · Pro',   color: '#EB0029', icon: <span className="text-base font-black text-white">1+</span> },
              { name: 'Nokia',   sub: 'G · X · C',    color: '#005AFF', icon: <span className="text-[10px] font-black tracking-wide text-white">NOK</span> },
            ].map(({ name, sub, color, icon }) => (
              <button
                key={name}
                className="group flex flex-col items-center py-6 px-3 transition-all duration-220 relative overflow-hidden"
                style={{ backgroundColor: 'var(--card)', border: '1.5px solid var(--cb)', borderRadius: '14px' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = color
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = `0 10px 24px ${color}25`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--cb)'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-11 h-11 flex items-center justify-center mb-3 rounded-xl transition-transform group-hover:scale-110 duration-220"
                  style={{ backgroundColor: color }}
                >
                  {icon}
                </div>
                <p className="text-[12px] font-bold" style={{ color: 'var(--ct1)' }}>{name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--ct3)' }}>{sub}</p>
                <span
                  className="text-[10px] font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color }}
                >
                  Xem →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14" style={{ backgroundColor: 'var(--ink)', borderTop: '1px solid var(--b1)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="text-[22px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Khách hàng nói gì về TechStore</h2>
            <p className="text-[12px] mt-1" style={{ color: 'var(--ct3)' }}>Hơn 10.000 khách hàng hài lòng trên toàn quốc</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {testimonials.map(({ name, avatar, role, rating, text, date }) => (
              <div
                key={name}
                className="testimonial-card p-6 relative"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--cb)',
                  borderRadius: '16px',
                }}
              >
                {/* Quote icon */}
                <div className="absolute top-5 right-5" style={{ color: 'var(--b1)' }}>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" opacity="0.5">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5" style={{ color: i < rating ? '#F59E0B' : '#e5e7eb' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review text */}
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--ct2)' }}>
                  "{text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--b1)' }}>
                  <div
                    className="w-10 h-10 flex items-center justify-center text-white font-bold text-[12px] shrink-0"
                    style={{ backgroundColor: 'var(--accent)', borderRadius: '50%' }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: 'var(--ct1)' }}>{name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--ct3)' }}>{role} · {date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ background: 'linear-gradient(135deg, #E8420A 0%, #be330a 100%)' }}>
        <div className="max-w-screen-2xl mx-auto px-8 py-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                title: 'Miễn phí vận chuyển',
                sub: 'Toàn quốc · Đơn từ 500.000₫',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
              },
              {
                title: 'Hỗ trợ kỹ thuật 24/7',
                sub: 'Đội ngũ chuyên viên sẵn sàng',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
              },
              {
                title: 'Hàng chính hãng 100%',
                sub: 'Bảo hành nhà sản xuất đầy đủ',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              },
              {
                title: 'Đổi trả trong 30 ngày',
                sub: 'Không cần giải thích lý do',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
              },
            ].map(({ title, sub, icon }) => (
              <div key={title} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                >
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-[13px] text-white">{title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-14" style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--cb)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div
            className="rounded-2xl px-12 py-10 flex items-center justify-between gap-16 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a2744 100%)' }}
          >
            <div className="absolute right-0 top-0 w-96 h-80 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top right, rgba(232,66,10,0.18) 0%, transparent 58%)' }} />
            <div className="absolute -bottom-6 right-20 w-48 h-48 rounded-full pointer-events-none"
              style={{ border: '1px dashed rgba(232,66,10,0.18)' }} />
            <div className="absolute bottom-4 right-8 w-24 h-24 rounded-full pointer-events-none"
              style={{ border: '1px dashed rgba(232,66,10,0.1)' }} />

            <div className="relative max-w-sm">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(232,66,10,0.22)', color: '#ff6b35' }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Nhận ưu đãi trước
              </span>
              <h2
                className="font-bold text-white mb-3"
                style={{ fontSize: '26px', fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}
              >
                Đừng bỏ lỡ<br />Flash Deal tiếp theo
              </h2>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Thông báo sớm nhất về Flash Deal, sản phẩm mới, và khuyến mãi độc quyền — gửi thẳng vào hộp thư. Không spam.
              </p>
            </div>

            <div className="relative flex-1 max-w-md">
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="địa chỉ email của bạn"
                  className="flex-1 px-5 py-4 text-[13px] bg-white outline-none"
                  style={{ borderRadius: 0, border: 'none', color: '#1a202c' }}
                />
                <button
                  className="font-bold text-[13px] px-7 py-4 text-white shrink-0 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #be330a 100%)' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Đăng ký miễn phí
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Bảo mật tuyệt đối
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  Không spam
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  15.000+ đã đăng ký
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#0c1220', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-screen-2xl mx-auto px-8 pt-12 pb-6">
          {/* Main footer grid */}
          <div className="grid grid-cols-4 gap-12 mb-10">
            {/* About */}
            <div>
              <h3 className="text-[14px] font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>TechStore</h3>
              <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Hệ thống bán lẻ thiết bị công nghệ chính hãng hàng đầu Việt Nam. Cam kết sản phẩm 100% chính hãng với giá tốt nhất.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'Facebook', icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /> },
                  { label: 'YouTube', icon: <><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></> },
                  { label: 'Zalo', icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm4-4.5c0 1.38-1.12 2.5-2.5 2.5h-1v-2h1c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5H10V9h2.5C13.88 9 15 10.12 15 11.5v1z" /> },
                ].map(({ label, icon }) => (
                  <a
                    key={label}
                    href="#"
                    className="w-8 h-8 flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                    aria-label={label}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">{icon}</svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div>
              <h3 className="text-[13px] font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Chính sách</h3>
              <ul className="space-y-2.5">
                {['Chính sách bảo hành', 'Chính sách đổi trả', 'Chính sách vận chuyển', 'Chính sách bảo mật', 'Điều khoản sử dụng'].map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[12px] transition-colors"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-[13px] font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Hỗ trợ</h3>
              <ul className="space-y-2.5">
                {['Hướng dẫn mua hàng', 'Hướng dẫn thanh toán', 'Tra cứu đơn hàng', 'Hỏi đáp · FAQ', 'Liên hệ hợp tác'].map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[12px] transition-colors"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-[13px] font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <div>
                    <p className="text-[12px] font-semibold text-white">1800-9999</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Miễn phí · T2–T7 · 8:00–22:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="text-[12px] font-semibold text-white">support@techstore.vn</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Phản hồi trong 2 giờ</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                    <p className="text-[12px] font-semibold text-white">Showroom</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>HCM · Hà Nội · Đà Nẵng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="flex items-center justify-between pt-6 mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Phương thức thanh toán</p>
            <div className="flex items-center gap-3">
              {['VISA', 'MC', 'JCB', 'MoMo', 'ZaloPay', 'COD'].map(method => (
                <div
                  key={method}
                  className="px-3 py-1.5 text-[9px] font-bold tracking-wider"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'rgba(255,255,255,0.5)' }}
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              © 2024 TechStore · Hàng chính hãng · Giao nhanh · Bảo hành chu đáo.
            </p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              GPKD số 0123456789 do Sở KH&ĐT TP.HCM cấp ngày 01/01/2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Category icons ── */
const PhoneIcon       = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
const LaptopIcon      = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
const HeadphoneIconSm = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19H7a2 2 0 01-2-2v-4a2 2 0 012-2h2m6 0h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-6 0h6M12 3a7 7 0 00-7 7v1m14-1V10a7 7 0 00-7-7" /></svg>
const WatchIcon       = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const BoltIcon        = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
const GamingIcon      = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
