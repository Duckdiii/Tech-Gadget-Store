import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

/* ── Countdown ─────────────────────────────────────────────── */
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
    <div className="flex items-end gap-1.5">
      {[['Hours', h], ['Mins', m], ['Secs', s]].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-gray-900 text-white font-bold text-xl w-11 h-10 flex items-center justify-center rounded tabular-nums">
            {String(val).padStart(2, '0')}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Stars ─────────────────────────────────────────────────── */
function Stars() {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

/* ── Flash Sale Card ────────────────────────────────────────── */
function FlashCard({ badge, stock = false, name, reviews, price, originalPrice, bg = 'bg-gray-100', icon }) {
  return (
    <div className="bg-white border border-gray-100 overflow-hidden flex-1 min-w-0" style={{ borderRadius: '6px' }}>
      <div className={`relative ${bg} h-40 flex items-center justify-center`}>
        {badge && (
          <span
            className="absolute top-2.5 left-2.5 text-xs font-bold px-2 py-0.5 text-white"
            style={{ backgroundColor: stock ? '#374151' : 'var(--accent)', borderRadius: '3px' }}
          >
            {badge}
          </span>
        )}
        <div className="text-gray-300">{icon}</div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Stars />
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>
        <p className="text-sm text-gray-800 font-medium leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">{name}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900">{price}</span>
            {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>}
          </div>
          <button
            className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── HomePage ───────────────────────────────────────────────── */
export default function HomePage() {
  const onNavigate = useNav()
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAV ───────────────────────────────────────────────── */}
      <StoreNavbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--ink)' }} className="relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Accent geometric shape */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none"
          style={{ backgroundColor: '#161820' }}
        />
        <div
          className="absolute right-[48%] top-0 bottom-0 w-24 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, var(--ink), #161820)',
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-12 py-20 flex items-center gap-16">
          {/* Left */}
          <div className="flex-1 py-4">
            <div
              className="inline-flex items-center text-xs font-bold tracking-[0.18em] uppercase px-3.5 py-1.5 mb-8"
              style={{
                color: 'var(--accent)',
                border: '1px solid rgba(232,66,10,0.35)',
                borderRadius: '3px',
              }}
            >
              ⚡ Flash Deal hôm nay
            </div>
            <h1 className="text-[3.25rem] font-extrabold text-white leading-[1.1] mb-2">
              iPhone 15 Pro Max
            </h1>
            <h1 className="text-[3.25rem] font-extrabold leading-[1.1] mb-7" style={{ color: 'var(--accent)' }}>
              Titan. Đỉnh cao.
            </h1>
            <p className="text-[#7a8294] text-[15px] leading-7 mb-10 max-w-[420px]">
              Camera 48MP, chip A17 Pro, khung titan aerospace — flagship thực sự cho người dùng thực sự. Giao hàng trong ngày tại TP.HCM & Hà Nội.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('list')}
                className="inline-flex items-center gap-2 font-bold text-[15px] px-8 py-3.5 transition-colors text-white"
                style={{
                  backgroundColor: 'var(--accent)',
                  borderRadius: '4px',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                Mua ngay — 28.990.000₫
              </button>
              <button
                className="font-semibold text-[15px] px-8 py-3.5 transition-colors"
                style={{
                  color: '#b0b8c8',
                  border: '1px solid #2e3240',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#4a5065'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2e3240'}
              >
                So sánh máy
              </button>
            </div>
            <div className="flex items-center gap-5 mt-8 pt-8" style={{ borderTop: '1px solid #1e2130' }}>
              {[['28.990.000₫', 'Giá tốt nhất'], ['12 tháng', 'Bảo hành Apple'], ['Giao 2h', 'Nội thành HCM/HN']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-white font-bold text-[13px]">{val}</p>
                  <p className="text-[#4a5268] text-[11px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone */}
          <div className="shrink-0 w-[380px] h-[520px] flex items-center justify-center relative">
            {/* Orange accent ring */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
              style={{ border: '1px solid rgba(232,66,10,0.2)' }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full pointer-events-none"
              style={{ border: '1px solid rgba(232,66,10,0.12)' }}
            />
            {/* Phone body */}
            <div className="relative z-10">
              <div className="relative w-[210px] h-[420px] rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10" style={{ backgroundColor: '#1a1a1c' }}>
                {/* Screen */}
                <div className="absolute inset-[3px] rounded-[2.7rem] overflow-hidden" style={{ backgroundColor: '#111113' }}>
                  {/* Screen content: specs */}
                  <div className="absolute inset-0 flex flex-col justify-center px-5">
                    <div className="text-[9px] font-bold tracking-widest mb-3" style={{ color: 'var(--accent)' }}>A17 PRO</div>
                    <div className="h-px mb-4" style={{ backgroundColor: '#2a2a2e' }} />
                    <div className="space-y-2.5">
                      {[['Camera', '48 MP · f/1.78'], ['Display', '6.7" · 120Hz'], ['Battery', '4422 mAh'], ['RAM / ROM', '8 GB · 256 GB']].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-[9px] font-medium" style={{ color: '#4a5268' }}>{k}</span>
                          <span className="text-[9px] font-semibold text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 h-px" style={{ backgroundColor: '#2a2a2e' }} />
                    <div className="mt-4 text-center">
                      <div className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>28.990.000₫</div>
                      <div className="text-[9px] mt-0.5" style={{ color: '#4a5268' }}>Còn 14 máy</div>
                    </div>
                  </div>
                </div>
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[4.5rem] h-[1.4rem] rounded-full z-20" style={{ backgroundColor: '#0a0a0b' }} />
                {/* Buttons */}
                <div className="absolute right-0 top-28 w-[3px] h-14 rounded-full translate-x-px" style={{ backgroundColor: '#3a3a3c' }} />
                <div className="absolute left-0 top-24 w-[3px] h-8 rounded-full -translate-x-px" style={{ backgroundColor: '#3a3a3c' }} />
                <div className="absolute left-0 top-36 w-[3px] h-8 rounded-full -translate-x-px" style={{ backgroundColor: '#3a3a3c' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY BRAND ─────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Thương hiệu</h2>
            <span className="text-xs text-gray-400 font-medium">8 hãng chính hãng</span>
          </div>
          <div className="grid grid-cols-8 gap-0 border border-gray-100 divide-x divide-gray-100">
            {[
              { name: 'Apple',   sub: 'iPhone',        color: '#1d1d1f', icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              )},
              { name: 'Samsung', sub: 'Galaxy',        color: '#1428A0', icon: <span className="text-xl font-black tracking-tighter">S</span> },
              { name: 'Xiaomi',  sub: 'Redmi · Mi',    color: '#FF6900', icon: <span className="text-base font-black">MI</span> },
              { name: 'OPPO',    sub: 'Reno · Find',   color: '#1D5C4A', icon: <span className="text-xs font-black tracking-wide">OPPO</span> },
              { name: 'vivo',    sub: 'V · Y · X',     color: '#415FFF', icon: <span className="text-sm font-black italic">vivo</span> },
              { name: 'realme',  sub: 'C · Note · GT', color: '#F5A623', icon: <span className="text-[10px] font-black tracking-wide leading-none text-center">real<br/>me</span> },
              { name: 'OnePlus', sub: 'Nord · Pro',    color: '#EB0029', icon: <span className="text-lg font-black">1+</span> },
              { name: 'Nokia',   sub: 'G · X · C',     color: '#005AFF', icon: <span className="text-xs font-black tracking-wide">NOK</span> },
            ].map(({ name, sub, color, icon }) => (
              <button
                key={name}
                className="group flex flex-col items-center py-8 px-4 bg-white hover:bg-gray-50 transition-colors relative"
              >
                {/* Accent top bar on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"
                  style={{ backgroundColor: color }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-white transition-transform group-hover:scale-105 duration-200"
                  style={{ backgroundColor: color }}
                >
                  {icon}
                </div>
                <p className="text-[13px] font-bold text-gray-900">{name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH SALES ───────────────────────────────────────── */}
      <section className="bg-white py-10 border-t border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Flash Deal hôm nay</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Giá sốc có hạn</h2>
            </div>
            <Countdown />
          </div>

          <div className="flex gap-4">
            <FlashCard
              badge="-20%"
              name="Sony WH-1000XM5 Chống ồn chủ động"
              reviews={128}
              price="6.990.000₫"
              originalPrice="8.490.000₫"
              bg="bg-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19H7a2 2 0 01-2-2v-4a2 2 0 012-2h2m6 0h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-6 0h6M12 3a7 7 0 00-7 7v1m14-1V10a7 7 0 00-7-7" />
                </svg>
              }
            />
            <FlashCard
              badge="-15%"
              name="AirPods Pro thế hệ 2"
              reviews={452}
              price="4.990.000₫"
              originalPrice="5.990.000₫"
              bg="bg-gray-50 border border-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              }
            />
            <FlashCard
              name="Logitech MX Master 3S & Keys Combo"
              reviews={89}
              price="3.890.000₫"
              bg="bg-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              }
            />
            <FlashCard
              badge="Sắp hết"
              stock
              name="Echo Studio Loa thông minh Hi-Fi"
              reviews={210}
              price="3.490.000₫"
              bg="bg-gray-100"
              icon={
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M15.536 8.464a5 5 0 010 7.072M12 10a2 2 0 110 4 2 2 0 010-4zm6.364-3.536a9 9 0 010 12.728M2.1 4.929A15 15 0 0021.9 4.93" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--ink)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-4 divide-x divide-white/10">
            {[
              ['Miễn phí vận chuyển', 'Toàn quốc, đơn từ 500.000₫'],
              ['Hỗ trợ kỹ thuật 24/7', 'Đội ngũ chuyên viên sẵn sàng'],
              ['Hàng chính hãng 100%', 'Bảo hành nhà sản xuất đầy đủ'],
              ['Đổi trả trong 30 ngày', 'Không cần giải thích lý do'],
            ].map(([title, sub]) => (
              <div key={title} className="py-5 px-6 flex items-center gap-3">
                <div className="w-[3px] h-7 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                <div>
                  <p className="text-white font-semibold text-[13px]">{title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#4a5268' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────── */}
      <section className="bg-white py-14 border-t border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-8 flex items-center justify-between gap-16">
          <div className="max-w-sm">
            <p className="text-xs font-bold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--accent)' }}>
              Nhận ưu đãi trước
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký nhận tin</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Flash Deal, sản phẩm mới, và khuyến mãi độc quyền — gửi thẳng đến hộp thư của bạn. Không spam.
            </p>
          </div>
          <div className="flex max-w-md flex-1">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="flex-1 border border-gray-200 border-r-0 px-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white text-gray-900"
              style={{ borderRadius: '4px 0 0 4px' }}
            />
            <button
              className="font-bold text-sm px-6 py-3 text-white shrink-0 transition-colors"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '0 4px 4px 0' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: 'var(--ink)' }} className="py-5 text-center">
        <p className="text-sm" style={{ color: '#4a5268' }}>© 2024 TechStore. Hàng chính hãng — Giao nhanh — Bảo hành chu đáo.</p>
      </footer>

    </div>
  )
}
