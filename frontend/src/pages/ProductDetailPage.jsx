import { useState } from 'react'
import { useNav } from '../hooks/useNav'

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
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center h-96">
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="flex gap-3">
        {THUMBNAILS.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`relative w-20 h-20 rounded-lg border-2 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer transition-all ${
              selected === i ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
            }`}
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
    <div className="flex flex-col gap-4">
      {/* Badge + Rating */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded tracking-wide uppercase">
          Mới nhất
        </span>
        <StarRating value={4} />
        <span className="text-sm text-gray-500">(128)</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
        Apple iPhone 15 Pro Max
      </h1>

      {/* Short description */}
      <p className="text-sm text-gray-500">
        Titanium frame, A17 Pro chip, Action button, USB-C.
      </p>

      {/* Price box */}
      <div className="bg-gray-100 rounded-xl px-5 py-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">Giá bán chính thức</p>
          <p className="text-4xl font-black text-gray-900 leading-none">
            28.990.000
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">đ</p>
        </div>
        <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Còn hàng
        </span>
      </div>

      {/* Storage */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Dung lượng lưu trữ</p>
        <div className="flex gap-2">
          {STORAGES.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStorage(s)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                selectedStorage === s
                  ? 'border-gray-800 text-gray-900 bg-white'
                  : 'border-gray-300 text-gray-600 bg-white hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">RAM</p>
        <div className="flex gap-2">
          {RAMS.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRam(r)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                selectedRam === r
                  ? 'border-gray-800 text-gray-900 bg-white'
                  : 'border-gray-300 text-gray-600 bg-white hover:border-gray-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Màu sắc:{' '}
          <span className="font-normal text-gray-600">{COLORS[selectedColor].name}</span>
        </p>
        <div className="flex gap-3">
          {COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelectedColor(i)}
              title={c.name}
              className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                selectedColor === i ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              } ${c.border ? 'border border-gray-300' : ''}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 mt-1">
        <button onClick={() => onNavigate('cart')} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors cursor-pointer text-base">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Thêm vào giỏ hàng
        </button>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('cart')} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm">
            Mua ngay
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Đăng ký nhận thông báo
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-gray-700">Giao hàng miễn phí</p>
            <p className="text-xs text-gray-400">Cho đơn hàng trên 500k</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-gray-700">Bảo hành 12 tháng</p>
            <p className="text-xs text-gray-400">Chính hãng Apple VN</p>
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
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="text-blue-600 hover:underline cursor-pointer">{spec.value}</span>
                  ) : (
                    spec.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Promo cards */}
      <div className="w-64 flex flex-col gap-4 shrink-0">
        {/* Ưu đãi card */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-700 mb-3">Ưu đãi độc quyền</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-red-400 mt-0.5 shrink-0">🎁</span>
              <p className="text-xs text-gray-700">
                Tặng ốp lưng chính hãng trị giá <span className="font-semibold">1.200.000đ</span>
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-gray-400 mt-0.5 shrink-0">🎧</span>
              <p className="text-xs text-gray-700">
                Giảm 20% khi mua kèm AirPods Pro 2
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-blue-400 mt-0.5 shrink-0">💳</span>
              <p className="text-xs text-gray-700">
                Trả góp 0% qua thẻ tín dụng, thủ tục nhanh chóng
              </p>
            </div>
          </div>
        </div>

        {/* TechStore Care+ card */}
        <div className="bg-blue-800 rounded-xl p-4 text-white">
          <p className="text-xs font-semibold tracking-widest text-blue-300 uppercase mb-1">
            TECHSTORE CARE+
          </p>
          <p className="text-base font-bold leading-snug mb-2">
            Bảo vệ toàn diện 2 năm
          </p>
          <button className="text-xs text-blue-300 hover:text-white transition-colors cursor-pointer">
            Tìm hiểu thêm →
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
    <div className="mt-8">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'specs' && <SpecsTab />}
      {activeTab === 'desc' && (
        <div className="mt-6 text-sm text-gray-600">Mô tả sản phẩm đang được cập nhật...</div>
      )}
      {activeTab === 'reviews' && (
        <div className="mt-6 text-sm text-gray-600">Đánh giá đang được tải...</div>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const onNavigate = useNav()
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          <button className="text-sm text-gray-600 hover:text-blue-600 font-medium cursor-pointer">Categories</button>
          <button className="text-sm text-gray-600 hover:text-blue-600 font-medium cursor-pointer">Deals</button>
          <button className="text-sm text-gray-600 hover:text-blue-600 font-medium cursor-pointer">Support</button>
        </nav>

        <div className="flex items-center gap-3">
          {/* Cart */}
          <button onClick={() => onNavigate('cart')} className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
          </button>

          {/* Bell */}
          <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Avatar */}
          <img
            src="https://placehold.co/32x32/dbeafe/1d4ed8?text=A"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <span onClick={() => onNavigate('list')} className="hover:text-blue-600 cursor-pointer">Home</span>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span onClick={() => onNavigate('list')} className="hover:text-blue-600 cursor-pointer">Products</span>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">Apple iPhone 15 Pro Max</span>
        </nav>

        {/* Main product area */}
        <div className="flex gap-8 items-start">
          {/* Left: Images */}
          <div className="w-96 shrink-0">
            <ProductImages />
          </div>

          {/* Right: Info */}
          <div className="flex-1">
            <ProductInfo onNavigate={onNavigate} />
          </div>
        </div>

        {/* Tabs + specs */}
        <ProductTabs />
      </div>
    </div>
  )
}
