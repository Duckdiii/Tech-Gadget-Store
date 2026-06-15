import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

function mapApiProduct(p) {
  const nameSlug = encodeURIComponent(p.name.replace(/\s+/g, '+'))
  return {
    id: p.id,
    brand: p.brandName ?? '',
    name: p.name,
    price: p.minPrice ? Number(p.minPrice) : 0,
    originalPrice: null,
    available: p.hasVariants,
    discount: null,
    rating: null,
    reviews: 0,
    ram: p.ramGb != null ? `${p.ramGb}GB` : null,
    storage: p.storageGb != null ? `${p.storageGb}GB` : null,
    color: p.color ?? null,
    tag: null,
    image: p.imageUrl ?? `https://placehold.co/300x300/f3f4f6/374151?text=${nameSlug}`,
  }
}

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + ' đ'
}

const TAG_COLOR = {
  'Bán chạy': 'var(--accent)',
  'Mới nhất': '#111827',
  'Giảm sâu': '#f43f5e',
}

function StarRating({ rating }) {
  if (rating == null) return null
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= Math.floor(rating)
        const half = !filled && i - 0.5 <= rating
        return (
          <svg key={i} className={`w-3 h-3 ${filled || half ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      })}
    </div>
  )
}

function ProductCard({ product, onNavigate }) {
  const [wished, setWished] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    setAdding(true)
    setTimeout(() => setAdding(false), 1200)
    onNavigate('cart')
  }

  const savings = product.originalPrice
    ? product.originalPrice - product.price
    : null

  return (
    <div className="group bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">

      {/* ── Image zone ── */}
      <div
        onClick={() => onNavigate('detail')}
        className="relative bg-gray-50 flex items-center justify-center h-52 cursor-pointer overflow-hidden"
      >
        {/* Tag badge */}
        {product.tag && (
          <span
            className="absolute top-3 left-3 z-10 text-[11px] font-bold px-2.5 py-0.5 text-white"
            style={{ backgroundColor: TAG_COLOR[product.tag] ?? '#374151', borderRadius: '3px' }}
          >
            {product.tag}
          </span>
        )}

        {/* Discount badge */}
        {product.discount && (
          <span
            className="absolute top-3 right-3 z-10 text-white text-[11px] font-extrabold px-2 py-0.5"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}
          >
            -{product.discount}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setWished(w => !w) }}
          className={`absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200
            ${wished ? 'border-rose-400 text-rose-500 bg-white' : 'bg-white border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-rose-400'}`}
        >
          <svg className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Unavailable overlay */}
        {!product.available && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1" style={{ borderRadius: '3px' }}>Hết hàng</span>
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="h-40 w-40 object-contain group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>

      {/* ── Info zone ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* Brand + availability */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
          {product.available
            ? <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Còn hàng</span>
            : <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />Hết hàng</span>
          }
        </div>

        {/* Name */}
        <p
          onClick={() => onNavigate('detail')}
          className="text-sm font-semibold text-gray-800 leading-snug cursor-pointer hover:text-gray-900 transition-colors line-clamp-2 min-h-[2.6rem]"
        >
          {product.name}
        </p>

        {/* Rating */}
        {product.rating != null && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} />
            <span className="text-[12px] font-semibold text-amber-500">{product.rating}</span>
            <span className="text-[12px] text-gray-400">({product.reviews.toLocaleString('vi-VN')} đánh giá)</span>
          </div>
        )}

        {/* Specs chips */}
        {(product.ram || product.storage || product.color) && (
          <div className="flex flex-wrap gap-1.5">
            {product.ram && <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5" style={{ borderRadius: '3px' }}>RAM {product.ram}</span>}
            {product.storage && <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5" style={{ borderRadius: '3px' }}>{product.storage}</span>}
            {product.color && <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 truncate max-w-[100px]" style={{ borderRadius: '3px' }}>{product.color}</span>}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-1">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-lg font-extrabold text-gray-900 leading-none">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through leading-none">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {!!savings && (
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>Tiết kiệm {formatPrice(savings)}</p>
          )}
        </div>

        {/* CTA */}
        {product.available ? (
          <button
            onClick={handleAddToCart}
            className={`mt-1 w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 text-white transition-all duration-200 ${adding ? 'bg-green-500 scale-95' : ''}`}
            style={!adding ? { backgroundColor: 'var(--accent)', borderRadius: '4px' } : { borderRadius: '4px' }}
            onMouseEnter={e => { if (!adding) e.currentTarget.style.backgroundColor = 'var(--accent-d)' }}
            onMouseLeave={e => { if (!adding) e.currentTarget.style.backgroundColor = 'var(--accent)' }}
          >
            {adding ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Đã thêm!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ
              </>
            )}
          </button>
        ) : (
          <button className="mt-1 w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 bg-gray-50 text-sm font-medium py-2.5 cursor-pointer hover:bg-gray-100 transition-colors" style={{ borderRadius: '4px' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Nhận thông báo
          </button>
        )}
      </div>
    </div>
  )
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-2.5 group"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && children}
    </div>
  )
}

function CheckGroup({ items, selected, onToggle }) {
  return (
    <div className="space-y-1.5">
      {items.map(({ value, label }) => (
        <label key={value} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
            className="w-3.5 h-3.5 rounded accent-blue-600"
          />
          <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{label}</span>
        </label>
      ))}
    </div>
  )
}

function RadioGroup({ name, items, value, onChange }) {
  return (
    <div className="space-y-1.5">
      {items.map(({ value: v, label }) => (
        <label key={v} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="w-3.5 h-3.5 accent-blue-600"
          />
          <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{label}</span>
        </label>
      ))}
    </div>
  )
}

const BRAND_LIST = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'vivo', 'realme', 'OnePlus', 'Nokia']
const RAM_OPTIONS = [
  { value: '4', label: '4 GB' },
  { value: '6', label: '6 GB' },
  { value: '8', label: '8 GB' },
  { value: '12', label: '12 GB' },
  { value: '16', label: '16 GB trở lên' },
]
const STORAGE_OPTIONS = [
  { value: '64', label: '64 GB' },
  { value: '128', label: '128 GB' },
  { value: '256', label: '256 GB' },
  { value: '512', label: '512 GB' },
  { value: '1000', label: '1 TB' },
]
const COLOR_OPTIONS = [
  { value: 'black',  label: 'Đen',   bg: 'bg-gray-900' },
  { value: 'white',  label: 'Trắng', bg: 'bg-gray-100 border border-gray-300' },
  { value: 'blue',   label: 'Xanh',  bg: 'bg-blue-500' },
  { value: 'purple', label: 'Tím',   bg: 'bg-purple-500' },
  { value: 'gold',   label: 'Vàng',  bg: 'bg-yellow-400' },
  { value: 'red',    label: 'Đỏ',    bg: 'bg-red-500' },
  { value: 'green',  label: 'Xanh lá', bg: 'bg-green-500' },
  { value: 'silver', label: 'Bạc',   bg: 'bg-gray-300' },
]
const SIM_OPTIONS = [
  { value: 'nano', label: 'Nano SIM' },
  { value: 'esim', label: 'eSIM' },
  { value: 'nano+esim', label: 'Nano SIM + eSIM' },
  { value: 'dual', label: 'Dual SIM' },
]

function FilterPanel() {
  const [keyword, setKeyword] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [pricePreset, setPricePreset] = useState('')
  const [selectedRam, setSelectedRam] = useState([])
  const [selectedStorage, setSelectedStorage] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSim, setSelectedSim] = useState([])
  const [os, setOs] = useState('all')
  const [screenSize, setScreenSize] = useState('all')
  const [battery, setBattery] = useState('all')
  const [chipset, setChipset] = useState('all')
  const [nfc, setNfc] = useState(false)
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [onPromotion, setOnPromotion] = useState(false)

  const toggle = (setter) => (val) =>
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

  const PRICE_PRESETS = [
    { value: 'u5', label: 'Dưới 5 triệu' },
    { value: '5-10', label: '5 – 10 triệu' },
    { value: '10-20', label: '10 – 20 triệu' },
    { value: '20-30', label: '20 – 30 triệu' },
    { value: 'o30', label: 'Trên 30 triệu' },
  ]

  const activeCount = [
    selectedBrands, selectedRam, selectedStorage, selectedColors, selectedSim,
  ].reduce((s, a) => s + a.length, 0)
    + (os !== 'all' ? 1 : 0)
    + (screenSize !== 'all' ? 1 : 0)
    + (battery !== 'all' ? 1 : 0)
    + (chipset !== 'all' ? 1 : 0)
    + (nfc ? 1 : 0) + (onlyAvailable ? 1 : 0) + (onPromotion ? 1 : 0)
    + (minPrice || maxPrice || pricePreset ? 1 : 0)

  const resetAll = () => {
    setKeyword(''); setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); setPricePreset('')
    setSelectedRam([]); setSelectedStorage([]); setSelectedColors([]); setSelectedSim([])
    setOs('all'); setScreenSize('all'); setBattery('all'); setChipset('all')
    setNfc(false); setOnlyAvailable(false); setOnPromotion(false)
  }

  return (
    <aside className="w-64 shrink-0 bg-white border border-gray-100 p-5 h-fit" style={{ borderLeft: '2px solid var(--accent)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-800">Bộ lọc</h2>
          {activeCount > 0 && (
            <span
              className="w-5 h-5 text-white text-[11px] font-bold rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>Xoá tất cả</button>
        )}
      </div>

      {/* Keyword */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full border border-gray-200 pl-8 pr-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-gray-50"
            style={{ borderRadius: '4px' }}
          />
        </div>
      </div>

      <div className="space-y-0">

        {/* Brand */}
        <FilterSection title="Thương hiệu">
          <div className="space-y-1.5">
            {BRAND_LIST.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggle(setSelectedBrands)(brand)}
                  className="w-3.5 h-3.5 rounded accent-blue-600"
                />
                <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Mức giá">
          <RadioGroup
            name="price"
            value={pricePreset}
            onChange={v => { setPricePreset(v); setMinPrice(''); setMaxPrice('') }}
            items={[{ value: '', label: 'Tất cả' }, ...PRICE_PRESETS]}
          />
          {pricePreset === '' && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <input
                type="text"
                placeholder="Từ"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full border border-gray-200 px-2.5 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-gray-50"
                style={{ borderRadius: '4px' }}
              />
              <span className="text-gray-400 text-xs shrink-0">–</span>
              <input
                type="text"
                placeholder="Đến"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full border border-gray-200 px-2.5 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-gray-50"
                style={{ borderRadius: '4px' }}
              />
            </div>
          )}
        </FilterSection>

        {/* Hệ điều hành */}
        <FilterSection title="Hệ điều hành">
          <RadioGroup
            name="os"
            value={os}
            onChange={setOs}
            items={[
              { value: 'all', label: 'Tất cả' },
              { value: 'ios', label: 'iOS (iPhone)' },
              { value: 'android', label: 'Android' },
            ]}
          />
        </FilterSection>

        {/* RAM */}
        <FilterSection title="RAM" defaultOpen={false}>
          <CheckGroup items={RAM_OPTIONS} selected={selectedRam} onToggle={toggle(setSelectedRam)} />
        </FilterSection>

        {/* Storage */}
        <FilterSection title="Bộ nhớ trong" defaultOpen={false}>
          <CheckGroup items={STORAGE_OPTIONS} selected={selectedStorage} onToggle={toggle(setSelectedStorage)} />
        </FilterSection>

        {/* Screen size */}
        <FilterSection title="Kích thước màn hình" defaultOpen={false}>
          <RadioGroup
            name="screen"
            value={screenSize}
            onChange={setScreenSize}
            items={[
              { value: 'all', label: 'Tất cả' },
              { value: 'small', label: 'Dưới 6.0"' },
              { value: 'medium', label: '6.0" – 6.5"' },
              { value: 'large', label: 'Trên 6.5"' },
            ]}
          />
        </FilterSection>

        {/* Battery */}
        <FilterSection title="Pin" defaultOpen={false}>
          <RadioGroup
            name="battery"
            value={battery}
            onChange={setBattery}
            items={[
              { value: 'all', label: 'Tất cả' },
              { value: 'small', label: 'Dưới 3500 mAh' },
              { value: 'medium', label: '3500 – 4500 mAh' },
              { value: 'large', label: '4500 – 5000 mAh' },
              { value: 'xlarge', label: 'Trên 5000 mAh' },
            ]}
          />
        </FilterSection>

        {/* Chipset */}
        <FilterSection title="Chipset" defaultOpen={false}>
          <RadioGroup
            name="chipset"
            value={chipset}
            onChange={setChipset}
            items={[
              { value: 'all', label: 'Tất cả' },
              { value: 'apple', label: 'Apple A-series' },
              { value: 'snapdragon', label: 'Snapdragon' },
              { value: 'dimensity', label: 'Dimensity' },
              { value: 'exynos', label: 'Exynos' },
              { value: 'helio', label: 'Helio' },
            ]}
          />
        </FilterSection>

        {/* Color */}
        <FilterSection title="Màu sắc" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(({ value, label, bg }) => (
              <button
                key={value}
                onClick={() => toggle(setSelectedColors)(value)}
                title={label}
                className={`w-6 h-6 rounded-full ${bg} transition-all ${
                  selectedColors.includes(value) ? 'ring-2 ring-offset-1 scale-110' : 'hover:scale-105'
                }`}
                style={selectedColors.includes(value) ? { outline: '2px solid var(--accent)', outlineOffset: '2px' } : {}}
              />
            ))}
          </div>
          {selectedColors.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-2">
              {selectedColors.map(v => COLOR_OPTIONS.find(c => c.value === v)?.label).join(', ')}
            </p>
          )}
        </FilterSection>

        {/* SIM */}
        <FilterSection title="Loại SIM" defaultOpen={false}>
          <CheckGroup items={SIM_OPTIONS} selected={selectedSim} onToggle={toggle(setSelectedSim)} />
        </FilterSection>

        {/* Extra */}
        <FilterSection title="Khác" defaultOpen={true}>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={nfc}
                onChange={() => setNfc(v => !v)}
                className="w-3.5 h-3.5 rounded accent-blue-600"
              />
              <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Hỗ trợ NFC</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={() => setOnlyAvailable(v => !v)}
                className="w-3.5 h-3.5 rounded accent-blue-600"
              />
              <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Chỉ hàng có sẵn</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={onPromotion}
                onChange={() => setOnPromotion(v => !v)}
                className="w-3.5 h-3.5 rounded accent-blue-600"
              />
              <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Đang khuyến mãi</span>
            </label>
          </div>
        </FilterSection>

      </div>
    </aside>
  )
}

function Pagination({ current, total }) {
  const pages = [1, 2, 3]
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            p === current ? 'text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          style={p === current ? { backgroundColor: 'var(--accent)' } : {}}
        >
          {p}
        </button>
      ))}
      <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>
      <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default function ProductsPage() {
  const onNavigate = useNav()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setProducts(data.map(mapApiProduct)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <StoreNavbar />

      {/* ── Category header ── */}
      <div style={{ backgroundColor: 'var(--ink)' }} className="py-5">
        <div className="max-w-screen-2xl mx-auto px-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: 'var(--accent)' }}>Danh mục</p>
            <h1 className="text-xl font-bold text-white">Điện thoại di động</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-5">
          <button onClick={() => onNavigate('home')} className="cursor-pointer hover:text-gray-700 transition-colors bg-transparent border-0 p-0 text-sm text-gray-400">Trang chủ</button>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">Điện thoại di động</span>
        </nav>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading
              ? <span className="text-gray-400">Đang tải...</span>
              : <><span className="font-semibold text-gray-800">{products.length}</span> sản phẩm</>
            }
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-400">Sắp xếp:</span>
            <select
              className="border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer bg-white"
              style={{ borderRadius: '4px' }}
            >
              <option>Mới nhất</option>
              <option>Giá thấp đến cao</option>
              <option>Giá cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Filter + Grid */}
        <div className="flex gap-6 items-start">
          <FilterPanel />
          <div className="flex-1">
            {error && (
              <div className="text-sm text-red-500 border border-red-200 bg-red-50 px-4 py-3 mb-4" style={{ borderRadius: '4px' }}>
                Không thể tải sản phẩm: {error}
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 animate-pulse h-80" style={{ borderRadius: '4px' }} />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="text-center py-16 text-gray-400 text-sm">Chưa có sản phẩm nào.</div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>
            )}
            {!loading && products.length > 0 && <Pagination current={1} total={Math.ceil(products.length / 9)} />}
          </div>
        </div>
      </div>
    </div>
  )
}
