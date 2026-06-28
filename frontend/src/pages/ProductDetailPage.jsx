import { useState } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const THUMBNAILS = [
  'https://placehold.co/80x80/EEF1F9/96A3BC?text=1',
  'https://placehold.co/80x80/EEF1F9/96A3BC?text=2',
  'https://placehold.co/80x80/EEF1F9/96A3BC?text=3',
  'https://placehold.co/80x80/EEF1F9/96A3BC?text=4',
]

const COLORS = [
  { name: 'Titan Tự nhiên', hex: '#C4AA82' },
  { name: 'Titan Đen',      hex: '#2C3E6B' },
  { name: 'Titan Trắng',    hex: '#E8E8E8', border: true },
  { name: 'Titan Đen tối',  hex: '#4A4A4A' },
]

const STORAGES = ['256GB', '512GB', '1TB']
const RAMS = ['8GB (Mặc định)']

const SPECS = [
  { label: 'Màn hình',          value: '6.7 inch, LTPO Super Retina XDR OLED, 120Hz' },
  { label: 'Độ phân giải',      value: '1290 × 2796 pixels' },
  { label: 'Vi xử lý',          value: 'Apple A17 Pro (3 nm)', link: true },
  { label: 'Camera sau',         value: '48MP (chính) + 12MP (tele 5x) + 12MP (góc siêu rộng)' },
  { label: 'Camera trước',       value: '12MP, f/1.9' },
  { label: 'Pin & Sạc',         value: '4441 mAh, Sạc nhanh, 15W MagSafe' },
  { label: 'Hệ điều hành',      value: 'iOS 17' },
  { label: 'Kết nối',           value: 'NFC, Dual SIM (Nano-SIM + eSIM), 5G, Wi-Fi 6E' },
]

function ProductImages() {
  const [selected, setSelected] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-center transition-all duration-300"
        style={{
          height: '380px',
          backgroundColor: 'var(--s1)',
          border: '1px solid var(--b1)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
      >
        <button
          className="absolute top-4 right-4 p-2 transition-colors cursor-pointer"
          style={{ border: '1px solid var(--b1)', backgroundColor: 'var(--card)', borderRadius: '8px', color: 'var(--t2)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--b2)'; e.currentTarget.style.color = 'var(--t1)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b1)'; e.currentTarget.style.color = 'var(--t2)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <img
          src="https://placehold.co/300x360/EEF1F9/96A3BC?text=iPhone+15+Pro+Max"
          alt="Apple iPhone 15 Pro Max"
          className="h-80 object-contain hover:scale-105 transition-transform duration-300"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(15,23,42,0.08))' }}
        />
      </div>
      <div className="flex gap-3">
        {THUMBNAILS.map((src, i) => (
          <button key={i} onClick={() => setSelected(i)} className="relative w-20 h-20 overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: 'var(--s1)',
              border: selected === i ? '2.5px solid var(--accent)' : '1px solid var(--b1)',
              borderRadius: '10px',
              transform: selected === i ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <img src={src} alt={`thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            {i === 3 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(15,23,42,0.45)' }}>
                <span className="text-white text-sm font-semibold">+3</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductInfo({ onNavigate }) {
  const [selectedStorage, setSelectedStorage] = useState('256GB')
  const [selectedRam, setSelectedRam] = useState('8GB (Mặc định)')
  const [selectedColor, setSelectedColor] = useState(1)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-extrabold px-3 py-1 text-white tracking-wider uppercase" style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '6px' }}>Mới nhất</span>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4" style={{ color: i < 4 ? '#F59E0B' : '#e2e8f0' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-xs font-semibold" style={{ color: 'var(--t3)' }}>128 đánh giá</span>
      </div>

      <h1 className="text-2xl font-black leading-tight" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Apple iPhone 15 Pro Max</h1>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--t2)' }}>Khung Titanium cao cấp · Chip A17 Pro · Nút tác vụ · Cổng USB-C chính hãng</p>

      {/* Price */}
      <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div>
          <p className="text-[10px] mb-1.5 uppercase tracking-widest font-extrabold" style={{ color: 'var(--t3)' }}>Giá bán lẻ đề xuất</p>
          <p className="text-[34px] font-black leading-none" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            28.990.000<span className="text-xl ml-1 font-bold">đ</span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5" style={{ color: 'var(--ok)', backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px' }}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Còn hàng
        </span>
      </div>

      {/* Storage */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2.5" style={{ color: 'var(--t3)' }}>Dung lượng lưu trữ</p>
        <div className="flex gap-2">
          {STORAGES.map(s => (
            <button key={s} onClick={() => setSelectedStorage(s)}
              className="px-4 py-2.5 text-xs font-extrabold cursor-pointer transition-all"
              style={{
                backgroundColor: 'var(--card)',
                border: selectedStorage === s ? '2px solid var(--accent)' : '1px solid var(--b1)',
                borderRadius: '8px',
                color: selectedStorage === s ? 'var(--accent)' : 'var(--t2)',
                transform: selectedStorage === s ? 'scale(1.03)' : 'scale(1)'
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2.5" style={{ color: 'var(--t3)' }}>RAM</p>
        <div className="flex gap-2">
          {RAMS.map(r => (
            <button key={r} onClick={() => setSelectedRam(r)}
              className="px-4 py-2.5 text-xs font-extrabold cursor-pointer"
              style={{
                backgroundColor: 'var(--card)',
                border: selectedRam === r ? '2px solid var(--accent)' : '1px solid var(--b1)',
                borderRadius: '8px',
                color: selectedRam === r ? 'var(--accent)' : 'var(--t2)',
              }}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2.5" style={{ color: 'var(--t3)' }}>
          Màu sắc — <span className="font-bold normal-case" style={{ color: 'var(--t2)' }}>{COLORS[selectedColor].name}</span>
        </p>
        <div className="flex gap-3">
          {COLORS.map((c, i) => (
            <button key={i} onClick={() => setSelectedColor(i)} title={c.name}
              className="w-8 h-8 cursor-pointer transition-all"
              style={{
                backgroundColor: c.hex,
                borderRadius: '50%',
                border: selectedColor === i ? '2.5px solid var(--accent)' : c.border ? '1px solid var(--b1)' : '1px solid transparent',
                outline: selectedColor === i ? '2.5px solid var(--accent)' : 'none',
                outlineOffset: '2px',
                transform: selectedColor === i ? 'scale(1.1)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5 pt-1">
        <button
          onClick={() => onNavigate('cart')}
          className="w-full flex items-center justify-center gap-2.5 text-white font-extrabold py-3.5 px-6 text-[14px] cursor-pointer transition-all duration-200 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Thêm vào giỏ hàng
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('cart')}
            className="flex-1 text-white font-extrabold py-2.5 px-4 text-xs cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--t1)', borderRadius: '10px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--t1)'}
          >
            Mua ngay
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 font-bold py-2.5 px-4 text-xs cursor-pointer transition-colors"
            style={{ border: '1.5px solid var(--b1)', color: 'var(--t2)', borderRadius: '10px', backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--b2)'; e.currentTarget.style.color = 'var(--t1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b1)'; e.currentTarget.style.color = 'var(--t2)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Thông báo khi về hàng
          </button>
        </div>
      </div>

      {/* Trust mini strip */}
      <div className="grid grid-cols-2 mt-1" style={{ borderTop: '1px solid var(--b1)' }}>
        {[
          [<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, 'Giao hàng miễn phí', 'Đơn từ 500.000đ'],
          [<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, 'Bảo hành 12 tháng', 'Chính hãng Apple VN'],
        ].map(([icon, title, sub], i) => (
          <div key={title} className="flex items-center gap-3 px-3 py-3" style={{ borderRight: i === 0 ? '1px solid var(--b1)' : 'none' }}>
            <div className="w-8 h-8 flex items-center justify-center shrink-0 text-white animate-none" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>
              {icon}
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{title}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SpecsTab() {
  return (
    <div className="flex gap-6 mt-6">
      <div className="flex-1 overflow-hidden" style={{ border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--b1)', backgroundColor: 'var(--s1)' }}>
          <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-bold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Thông số chi tiết</h3>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {SPECS.map((spec, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'var(--card)' : 'var(--s1)' }}>
                <td className="px-5 py-3.5 w-44 font-extrabold align-top" style={{ color: 'var(--t2)', borderBottom: '1px solid var(--b1)' }}>{spec.label}</td>
                <td className="px-5 py-3.5 align-top" style={{ color: spec.link ? 'var(--accent)' : 'var(--t1)', cursor: spec.link ? 'pointer' : 'default', fontWeight: spec.link ? '700' : '400', borderBottom: '1px solid var(--b1)' }}>
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-64 flex flex-col gap-4 shrink-0">
        {/* Promo card */}
        <div className="p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Ưu đãi độc quyền</h4>
          <div className="space-y-3">
            {['Tặng ốp lưng chính hãng trị giá 1.200.000đ', 'Giảm 20% khi mua kèm AirPods Pro 2', 'Trả góp 0% qua thẻ tín dụng, thủ tục nhanh'].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--t2)', fontWeight: '500' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Care+ card — dark for contrast */}
        <div className="p-5 text-white" style={{ backgroundColor: 'var(--ink)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p className="text-[10px] font-extrabold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>TECHSTORE CARE+</p>
          <p className="text-sm font-bold leading-snug mb-3">Bảo vệ toàn diện 2 năm</p>
          <button className="flex items-center gap-1 text-xs transition-colors cursor-pointer" style={{ color: 'var(--t3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >
            Tìm hiểu thêm
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

      </div>
    </div>
  )
}

function ProductTabs() {
  const [activeTab, setActiveTab] = useState('specs')
  const tabs = [
    { id: 'specs', label: 'Thông số kỹ thuật' },
    { id: 'desc', label: 'Mô tả sản phẩm' },
    { id: 'reviews', label: 'Đánh giá (128)' },
  ]
  return (
    <div className="mt-10">
      <div className="flex" style={{ borderBottom: '2px solid var(--b1)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`featured-tab px-5 py-3.5 text-sm font-extrabold cursor-pointer transition-all duration-200 ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--t3)',
              marginBottom: '-2px',
            }}
          >{tab.label}</button>
        ))}
      </div>
      {activeTab === 'specs' && <SpecsTab />}
      {activeTab === 'desc' && <div className="mt-6 text-sm" style={{ color: 'var(--t3)' }}>Mô tả sản phẩm đang được cập nhật...</div>}
      {activeTab === 'reviews' && <div className="mt-6 text-sm" style={{ color: 'var(--t3)' }}>Đánh giá đang được tải...</div>}
    </div>
  )
}

export default function ProductDetailPage() {
  const onNavigate = useNav()
  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] mb-8" style={{ color: 'var(--t3)' }}>
          <span onClick={() => onNavigate('home')} className="cursor-pointer transition-colors hover:text-slate-900"
          >Trang chủ</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span onClick={() => onNavigate('list')} className="cursor-pointer transition-colors hover:text-slate-900"
          >Điện thoại di động</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: 'var(--t1)', fontWeight: 700 }}>Apple iPhone 15 Pro Max</span>
        </nav>

        {/* Main */}
        <div className="flex gap-10 items-start">
          <div className="w-[380px] shrink-0"><ProductImages /></div>
          <div className="flex-1 min-w-0"><ProductInfo onNavigate={onNavigate} /></div>
        </div>

        <ProductTabs />
      </div>
    </div>
  )
}
