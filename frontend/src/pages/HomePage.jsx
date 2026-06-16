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
    <div className="flex items-end gap-1.5">
      {[['H', h], ['M', m], ['S', s]].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className="font-extrabold text-[20px] w-11 h-10 flex items-center justify-center tabular-nums"
            style={{ backgroundColor: 'var(--ink)', color: 'var(--accent)', border: '1px solid var(--b1)', borderRadius: '3px', fontFamily: 'Syne, sans-serif' }}
          >
            {String(val).padStart(2, '0')}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--ct3)' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Flash Sale Card (white) ── */
function FlashCard({ badge, stock = false, name, reviews, price, originalPrice, icon }) {
  return (
    <div
      className="flex-1 min-w-0 overflow-hidden transition-shadow duration-200 group cursor-pointer"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--cb)', borderRadius: '4px' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--cb)' }}
    >
      <div className="relative h-40 flex items-center justify-center" style={{ backgroundColor: 'var(--page)', borderBottom: '1px solid var(--cb)' }}>
        {badge && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 text-white uppercase tracking-wider" style={{ backgroundColor: stock ? 'var(--ct2)' : 'var(--accent)', borderRadius: '2px' }}>
            {badge}
          </span>
        )}
        <div style={{ color: '#c8d0e0' }}>{icon}</div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-2.5 h-2.5" style={{ color: i < 4 ? '#F59E0B' : '#e5e7eb' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[10px] ml-0.5" style={{ color: 'var(--ct3)' }}>({reviews})</span>
        </div>
        <p className="text-[13px] font-medium leading-snug mb-3 line-clamp-2 min-h-[2.5rem]" style={{ color: 'var(--ct1)' }}>{name}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[15px] font-extrabold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{price}</span>
            {originalPrice && <span className="text-[11px] ml-1.5 line-through" style={{ color: 'var(--ct3)' }}>{originalPrice}</span>}
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--page)', border: '1px solid var(--cb)', borderRadius: '3px', color: 'var(--ct2)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--page)'; e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct2)' }}
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

/* ── HomePage ── */
export default function HomePage() {
  const onNavigate = useNav()
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ink)' }}>
      <StoreNavbar />

      {/* ── HERO (dark) ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--ink)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(to right, var(--t1) 1px, transparent 1px), linear-gradient(to bottom, var(--t1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        <div className="absolute inset-y-0 right-[38%] w-px pointer-events-none" style={{ backgroundColor: 'var(--b1)' }} />

        <div className="relative max-w-screen-2xl mx-auto px-12 py-24 flex items-center gap-16">
          <div className="flex-1 py-4">
            <div className="inline-flex items-center text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 mb-8" style={{ color: 'var(--accent)', border: '1px solid rgba(232,66,10,0.3)', borderRadius: '2px' }}>
              ⚡ Flash Deal hôm nay
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.05] mb-2" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>iPhone 15 Pro Max</h1>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.05] mb-8" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>Titan. Đỉnh cao.</h1>
            <p className="text-[14px] leading-7 mb-10 max-w-[400px]" style={{ color: 'var(--t3)' }}>
              Camera 48MP · Chip A17 Pro · Khung titan aerospace.<br />
              Flagship thực sự cho người dùng thực sự.<br />
              Giao hàng trong ngày tại TP.HCM & Hà Nội.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('list')}
                className="inline-flex items-center gap-2 font-bold text-[14px] px-8 py-3.5 transition-colors text-white"
                style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                Mua ngay — 28.990.000₫
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <button
                className="font-semibold text-[14px] px-8 py-3.5 transition-colors"
                style={{ color: 'var(--t2)', border: '1px solid var(--b2)', borderRadius: '3px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--b3)'; e.currentTarget.style.color = 'var(--t1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b2)'; e.currentTarget.style.color = 'var(--t2)' }}
              >
                So sánh máy
              </button>
            </div>
            <div className="flex items-center gap-8 mt-8 pt-8" style={{ borderTop: '1px solid var(--b1)' }}>
              {[['28.990.000₫', 'Giá tốt nhất'], ['12 tháng', 'Bảo hành Apple'], ['Giao 2h', 'Nội thành HCM/HN']].map(([val, label]) => (
                <div key={label}>
                  <p className="font-bold text-[13px]" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>{val}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="shrink-0 w-[340px] h-[480px] flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none" style={{ border: '1px solid var(--b1)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full pointer-events-none" style={{ border: '1px solid rgba(232,66,10,0.15)' }} />
            <div className="relative z-10 w-[200px] h-[400px] rounded-[2.8rem]" style={{ backgroundColor: '#1a1a1c', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="absolute inset-[3px] rounded-[2.6rem] overflow-hidden" style={{ backgroundColor: '#111113' }}>
                <div className="absolute inset-0 flex flex-col justify-center px-5">
                  <div className="text-[8px] font-bold tracking-widest mb-3" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>A17 PRO</div>
                  <div className="h-px mb-4" style={{ backgroundColor: 'var(--b1)' }} />
                  <div className="space-y-2">
                    {[['Camera', '48 MP · f/1.78'], ['Display', '6.7" · 120Hz'], ['Battery', '4422 mAh'], ['RAM/ROM', '8GB · 256GB']].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-[8px]" style={{ color: 'var(--t3)' }}>{k}</span>
                        <span className="text-[8px] font-semibold" style={{ color: 'var(--t1)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 h-px" style={{ backgroundColor: 'var(--b1)' }} />
                  <div className="mt-4 text-center">
                    <div className="text-[10px] font-bold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>28.990.000₫</div>
                    <div className="text-[8px] mt-0.5" style={{ color: 'var(--t3)' }}>Còn 14 máy</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-5 rounded-full z-20" style={{ backgroundColor: '#0a0a0b' }} />
              <div className="absolute right-0 top-24 w-[3px] h-12 rounded-full translate-x-px" style={{ backgroundColor: 'var(--b3)' }} />
              <div className="absolute left-0 top-20 w-[3px] h-7 rounded-full -translate-x-px" style={{ backgroundColor: 'var(--b3)' }} />
              <div className="absolute left-0 top-32 w-[3px] h-7 rounded-full -translate-x-px" style={{ backgroundColor: 'var(--b3)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── BRANDS (white) ── */}
      <section style={{ backgroundColor: 'var(--card)', borderTop: '3px solid var(--accent)', borderBottom: '1px solid var(--cb)' }} className="py-10">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-[18px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Thương hiệu</h2>
            <span className="text-[11px] font-medium" style={{ color: 'var(--ct3)' }}>8 hãng chính hãng</span>
          </div>
          <div className="grid grid-cols-8 gap-0" style={{ border: '1px solid var(--cb)' }}>
            {[
              { name: 'Apple',   sub: 'iPhone',       color: '#1c1c1e', icon: <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg> },
              { name: 'Samsung', sub: 'Galaxy',       color: '#1428A0', icon: <span className="text-[16px] font-black text-white">S</span> },
              { name: 'Xiaomi',  sub: 'Redmi · Mi',  color: '#FF6900', icon: <span className="text-sm font-black text-white">MI</span> },
              { name: 'OPPO',    sub: 'Reno · Find', color: '#1D5C4A', icon: <span className="text-[10px] font-black tracking-wide text-white">OPPO</span> },
              { name: 'vivo',    sub: 'V · Y · X',   color: '#415FFF', icon: <span className="text-sm font-black italic text-white">vivo</span> },
              { name: 'realme',  sub: 'C · Note',    color: '#F5A623', icon: <span className="text-[9px] font-black tracking-wide leading-none text-center text-white">real<br/>me</span> },
              { name: 'OnePlus', sub: 'Nord · Pro',  color: '#EB0029', icon: <span className="text-base font-black text-white">1+</span> },
              { name: 'Nokia',   sub: 'G · X · C',   color: '#005AFF', icon: <span className="text-[10px] font-black tracking-wide text-white">NOK</span> },
            ].map(({ name, sub, color, icon }) => (
              <button
                key={name}
                className="group flex flex-col items-center py-6 px-3 transition-colors relative"
                style={{ backgroundColor: 'var(--card)', borderLeft: '1px solid var(--cb)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" style={{ backgroundColor: color }} />
                <div className="w-10 h-10 flex items-center justify-center mb-3 transition-transform group-hover:scale-105 duration-200" style={{ backgroundColor: color, borderRadius: '3px' }}>
                  {icon}
                </div>
                <p className="text-[12px] font-bold" style={{ color: 'var(--ct1)' }}>{name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--ct3)' }}>{sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH SALES (light page bg, white cards) ── */}
      <section className="py-10" style={{ backgroundColor: 'var(--page)', borderBottom: '1px solid var(--cb)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--accent)' }}>Flash Deal hôm nay</span>
              </div>
              <h2 className="text-[22px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Giá sốc có hạn</h2>
            </div>
            <Countdown />
          </div>
          <div className="flex gap-4">
            <FlashCard badge="-20%" name="Sony WH-1000XM5 Chống ồn chủ động" reviews={128} price="6.990.000₫" originalPrice="8.490.000₫"
              icon={<svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19H7a2 2 0 01-2-2v-4a2 2 0 012-2h2m6 0h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-6 0h6M12 3a7 7 0 00-7 7v1m14-1V10a7 7 0 00-7-7" /></svg>} />
            <FlashCard badge="-15%" name="AirPods Pro thế hệ 2" reviews={452} price="4.990.000₫" originalPrice="5.990.000₫"
              icon={<svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>} />
            <FlashCard name="Logitech MX Master 3S & Keys Combo" reviews={89} price="3.890.000₫"
              icon={<svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>} />
            <FlashCard badge="Sắp hết" stock name="Echo Studio Loa thông minh Hi-Fi" reviews={210} price="3.490.000₫"
              icon={<svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M15.536 8.464a5 5 0 010 7.072M12 10a2 2 0 110 4 2 2 0 010-4zm6.364-3.536a9 9 0 010 12.728M2.1 4.929A15 15 0 0121.9 4.93" /></svg>} />
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('list')}
              className="text-[13px] font-semibold px-7 py-2.5 transition-colors text-white"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              Xem tất cả sản phẩm →
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP (dark — creates contrast rhythm) ── */}
      <section style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-4" style={{ borderLeft: '1px solid var(--b1)' }}>
            {[
              ['Miễn phí vận chuyển', 'Toàn quốc, đơn từ 500.000₫'],
              ['Hỗ trợ kỹ thuật 24/7', 'Đội ngũ chuyên viên sẵn sàng'],
              ['Hàng chính hãng 100%', 'Bảo hành nhà sản xuất đầy đủ'],
              ['Đổi trả trong 30 ngày', 'Không cần giải thích lý do'],
            ].map(([title, sub]) => (
              <div key={title} className="py-5 px-6 flex items-center gap-3" style={{ borderRight: '1px solid var(--b1)' }}>
                <div className="w-[2px] h-7 flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                <div>
                  <p className="font-semibold text-[13px]" style={{ color: 'var(--t1)' }}>{title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER (white) ── */}
      <section className="py-16" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--cb)' }}>
        <div className="max-w-screen-2xl mx-auto px-8 flex items-center justify-between gap-16">
          <div className="max-w-sm">
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1" style={{ backgroundColor: 'var(--accent-dim)', borderRadius: '2px' }}>
              <svg className="w-3 h-3" style={{ color: 'var(--accent)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>Nhận ưu đãi trước</span>
            </div>
            <h2 className="text-[24px] font-bold mb-2" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Đăng ký nhận tin</h2>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ct2)' }}>
              Flash Deal, sản phẩm mới, và khuyến mãi độc quyền — gửi thẳng đến hộp thư của bạn. Không spam.
            </p>
          </div>
          <div className="flex max-w-md flex-1 overflow-hidden" style={{ border: '1px solid var(--cb)', borderRadius: '4px' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="field-light flex-1 px-4 py-3 text-[13px]"
              style={{ borderRadius: 0, border: 'none', outline: 'none' }}
            />
            <button
              className="font-bold text-[13px] px-7 py-3 text-white shrink-0 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-5 text-center" style={{ backgroundColor: '#0A0C11' }}>
        <p className="text-[12px]" style={{ color: 'var(--t3)' }}>
          © 2024 TechStore · Hàng chính hãng · Giao nhanh · Bảo hành chu đáo.
        </p>
      </footer>
    </div>
  )
}
