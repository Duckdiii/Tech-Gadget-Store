import { useState } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const THUMBNAILS = [
  'https://placehold.co/80x80/f3f4f6/374151?text=1',
  'https://placehold.co/80x80/f3f4f6/374151?text=2',
  'https://placehold.co/80x80/f3f4f6/374151?text=3',
  'https://placehold.co/80x80/f3f4f6/374151?text=4',
]

const COLORS = [
  { name: 'Titan Tự nhiên', hex: '#C4AA82' },
  { name: 'Titan Đen', hex: '#2C3E6B' },
  { name: 'Titan Trắng', hex: '#E8E8E8', border: true },
  { name: 'Titan Tự nhiên tối', hex: '#4A4A4A' },
]

const STORAGES = ['256GB', '512GB', '1TB']
const RAMS = ['8GB (Mặc định)']

const SPECS = [
  { label: 'Màn hình', value: '6.7 inch, LTPO Super Retina XDR OLED, 120Hz' },
  { label: 'Độ phân giải', value: '1290 × 2796 pixels' },
  { label: 'Vi xử lý (Chipset)', value: 'Apple A17 Pro (3 nm)', link: true },
  { label: 'Camera sau', value: '48MP (chính) + 12MP (tele 5x) + 12MP (góc siêu rộng)' },
  { label: 'Camera trước', value: '12MP, f/1.9' },
  { label: 'Pin & Sạc', value: '4441 mAh, Sạc nhanh, 15W MagSafe' },
  { label: 'Hệ điều hành', value: 'iOS 17' },
  { label: 'Kết nối', value: 'NFC: Có, Dual SIM (Nano-SIM và eSIM), 5G, Wi-Fi 6E' },
]

function StarRating({ value = 4 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < value ? 'text-orange-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ProductImages() {
  const [selected, setSelected] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative bg-white flex items-center justify-center"
        style={{ height: '380px', border: '1px solid #e5e7eb' }}
      >
        <button
          className="absolute top-3 right-3 p-1.5 bg-white transition-colors cursor-pointer"
          style={{ border: '1px solid #e5e7eb' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#9ca3af'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <img
          src="https://placehold.co/300x360/f8fafc/374151?text=iPhone+15+Pro+Max"
          alt="Apple iPhone 15 Pro Max"
          className="h-80 object-contain"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {THUMBNAILS.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="relative w-20 h-20 overflow-hidden bg-white flex items-center justify-center cursor-pointer"
            style={{
              border: selected === i ? '2px solid var(--accent)' : '1px solid #e5e7eb',
            }}
          >
            <img src={src} alt={`thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            {i === 3 && (
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
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
      {/* Badge + Rating */}
      <div className="flex items-center gap-2.5">
        <span
          className="text-[11px] font-bold px-2 py-0.5 text-white tracking-wider uppercase"
          style={{ backgroundColor: '#111827', borderRadius: '2px' }}
        >
          Mới nhất
        </span>
        <StarRating value={4} />
        <span className="text-sm text-gray-400">128 đánh giá</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 leading-tight">
        Apple iPhone 15 Pro Max
      </h1>

      {/* Short description */}
      <p className="text-sm text-gray-500 leading-relaxed">
        Khung Titanium cao cấp · Chip A17 Pro · Nút tác vụ · Cổng USB-C
      </p>

      {/* Price */}
      <div
        className="flex items-center justify-between py-4"
        style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}
      >
        <div>
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest font-semibold">Giá bán</p>
          <p
            className="text-[34px] font-black leading-none"
            style={{ color: 'var(--accent)' }}
          >
            28.990.000<span className="text-xl ml-1 font-bold">đ</span>
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 text-emerald-700 bg-emerald-50"
          style={{ borderRadius: '2px' }}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Còn hàng
        </span>
      </div>

      {/* Storage */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-2.5 uppercase tracking-widest">Dung lượng lưu trữ</p>
        <div className="flex gap-2">
          {STORAGES.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStorage(s)}
              className="px-4 py-2 text-sm font-medium cursor-pointer bg-white transition-colors"
              style={{
                border: selectedStorage === s
                  ? '2px solid var(--ink)'
                  : '1px solid #d1d5db',
                borderRadius: '3px',
                color: selectedStorage === s ? 'var(--ink)' : '#6b7280',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-2.5 uppercase tracking-widest">RAM</p>
        <div className="flex gap-2">
          {RAMS.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRam(r)}
              className="px-4 py-2 text-sm font-medium cursor-pointer bg-white"
              style={{
                border: selectedRam === r
                  ? '2px solid var(--ink)'
                  : '1px solid #d1d5db',
                borderRadius: '3px',
                color: selectedRam === r ? 'var(--ink)' : '#6b7280',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-2.5 uppercase tracking-widest">
          Màu sắc —{' '}
          <span className="font-normal text-gray-600 normal-case">{COLORS[selectedColor].name}</span>
        </p>
        <div className="flex gap-2">
          {COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelectedColor(i)}
              title={c.name}
              className="w-9 h-9 cursor-pointer transition-all"
              style={{
                backgroundColor: c.hex,
                borderRadius: '3px',
                border: selectedColor === i
                  ? '2px solid var(--accent)'
                  : c.border
                    ? '1px solid #d1d5db'
                    : '1px solid transparent',
                outline: selectedColor === i ? '2px solid var(--accent)' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={() => onNavigate('cart')}
          className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 px-6 text-[15px] cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Thêm vào giỏ hàng
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('cart')}
            className="flex-1 text-white font-semibold py-2.5 px-4 text-sm cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--ink)', borderRadius: '3px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e2430'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--ink)'}
          >
            Mua ngay
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 text-gray-600 font-medium py-2.5 px-4 text-sm cursor-pointer transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #d1d5db', borderRadius: '3px' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Thông báo hàng về
          </button>
        </div>
      </div>

      {/* Trust strip */}
      <div
        className="grid grid-cols-2 mt-1"
        style={{ borderTop: '1px solid #f3f4f6' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-3"
          style={{ borderRight: '1px solid #f3f4f6' }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--ink)', borderRadius: '2px' }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Giao hàng miễn phí</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Đơn từ 500.000đ</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-3">
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--ink)', borderRadius: '2px' }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Bảo hành 12 tháng</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Chính hãng Apple VN</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecsTab() {
  return (
    <div className="flex gap-6 mt-6">
      {/* Spec table */}
      <div className="flex-1 bg-white overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{
            borderBottom: '1px solid #f3f4f6',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800">Thông số chi tiết</h3>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {SPECS.map((spec, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-5 py-3 text-gray-500 w-44 font-medium align-top">{spec.label}</td>
                <td className="px-5 py-3 text-gray-700 align-top">
                  {spec.link ? (
                    <span
                      className="hover:underline cursor-pointer font-medium"
                      style={{ color: 'var(--accent)' }}
                    >
                      {spec.value}
                    </span>
                  ) : (
                    spec.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side cards */}
      <div className="w-64 flex flex-col gap-3 shrink-0">
        {/* Promo card */}
        <div
          className="p-4 bg-white"
          style={{
            border: '1px solid #e5e7eb',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-3">
            Ưu đãi độc quyền
          </h4>
          <div className="space-y-3">
            {[
              'Tặng ốp lưng chính hãng trị giá 1.200.000đ',
              'Giảm 20% khi mua kèm AirPods Pro 2',
              'Trả góp 0% qua thẻ tín dụng, thủ tục nhanh',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TechStore Care+ card */}
        <div
          className="p-4 text-white"
          style={{ backgroundColor: 'var(--ink)' }}
        >
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: 'var(--accent)' }}
          >
            TECHSTORE CARE+
          </p>
          <p className="text-sm font-bold leading-snug mb-3">
            Bảo vệ toàn diện 2 năm
          </p>
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
            Tìm hiểu thêm
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
      <div className="flex" style={{ borderBottom: '1px solid #e5e7eb' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-3 text-sm font-medium cursor-pointer transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : '#6b7280',
              borderBottom: activeTab === tab.id
                ? '2px solid var(--accent)'
                : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'specs' && <SpecsTab />}
      {activeTab === 'desc' && (
        <div className="mt-6 text-sm text-gray-500">Mô tả sản phẩm đang được cập nhật...</div>
      )}
      {activeTab === 'reviews' && (
        <div className="mt-6 text-sm text-gray-500">Đánh giá đang được tải...</div>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const onNavigate = useNav()
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <StoreNavbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <span
            onClick={() => onNavigate('home')}
            className="cursor-pointer hover:text-gray-700 transition-colors"
          >
            Trang chủ
          </span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span
            onClick={() => onNavigate('list')}
            className="cursor-pointer hover:text-gray-700 transition-colors"
          >
            Điện thoại di động
          </span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">Apple iPhone 15 Pro Max</span>
        </nav>

        {/* Main product area */}
        <div className="flex gap-10 items-start">
          <div className="w-[380px] shrink-0">
            <ProductImages />
          </div>
          <div className="flex-1 min-w-0">
            <ProductInfo onNavigate={onNavigate} />
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs />
      </div>
    </div>
  )
}
