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
    originalPrice: p.minPrice ? Number(p.minPrice) * 1.12 : null, // Mock original price for styling discount
    available: p.hasVariants,
    discount: p.hasVariants ? 12 : null, // Mock discount percentage
    rating: 4.8, // Mock rating
    reviews: 142, // Mock reviews count
    ram: p.ramGb != null ? `${p.ramGb}GB` : null,
    storage: p.storageGb != null ? `${p.storageGb}GB` : null,
    color: p.color ?? null,
    tag: p.hasVariants ? 'Mới' : null,
    image: p.imageUrl ?? `https://placehold.co/300x300/EEF1F9/96A3BC?text=${nameSlug}`,
  }
}

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + ' đ'
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

  const savings = product.originalPrice ? product.originalPrice - product.price : null

  return (
    <div
      onClick={() => onNavigate('detail', { search: '?id=' + product.id })}
      className="product-card group overflow-hidden flex flex-col cursor-pointer relative"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--b1)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s, box-shadow 0.25s',
      }}
    >
      {/* Image Container */}
      <div
        className="relative flex items-center justify-center h-52 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
          borderBottom: '1px solid var(--b1)',
        }}
      >
        {product.tag && (
          <span
            className="absolute top-3.5 left-3.5 z-10 text-[10px] font-extrabold px-3 py-1 text-white uppercase tracking-wider"
            style={{
              background: product.tag === 'Mới' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, var(--accent-h), var(--accent))',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {product.tag}
          </span>
        )}
        {product.discount && (
          <span
            className="absolute top-3.5 right-3.5 z-10 text-[10px] font-extrabold px-2.5 py-1 text-white"
            style={{
              background: 'linear-gradient(135deg, var(--accent-h), var(--accent))',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            -{product.discount}%
          </span>
        )}

        <button
          onClick={e => {
            e.stopPropagation()
            setWished(w => !w)
          }}
          className="absolute bottom-3.5 right-3.5 z-10 w-8 h-8 flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: wished ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${wished ? 'rgba(239,68,68,0.25)' : 'var(--b1)'}`,
            borderRadius: '50%',
            color: wished ? '#ef4444' : 'var(--t3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transform: wished ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <svg className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {!product.available && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(241,245,249,0.8)' }}
          >
            <span
              className="text-xs font-bold px-3 py-1 text-white uppercase tracking-wider"
              style={{ backgroundColor: 'var(--t3)', borderRadius: '6px' }}
            >
              Hết hàng
            </span>
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="h-36 w-36 object-contain transition-transform duration-300 group-hover:scale-110"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(15,23,42,0.08))' }}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {product.brand}
          </span>
          {product.available ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Còn hàng
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: 'var(--t3)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--b2)' }} />
              Hết hàng
            </span>
          )}
        </div>

        <h3
          className="text-[13.5px] font-bold leading-snug line-clamp-2 min-h-[2.5rem] transition-colors"
          style={{ color: 'var(--t1)' }}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3.5 h-3.5" style={{ color: i < 5 ? '#F59E0B' : '#e2e8f0' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[11px] font-semibold ml-1" style={{ color: 'var(--t3)' }}>
            ({product.reviews})
          </span>
        </div>

        {(product.ram || product.storage || product.color) && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {product.ram && (
              <span className="text-[9.5px] font-bold px-2 py-0.5" style={{ backgroundColor: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--b1)', borderRadius: '4px' }}>
                RAM {product.ram}
              </span>
            )}
            {product.storage && (
              <span className="text-[9.5px] font-bold px-2 py-0.5" style={{ backgroundColor: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--b1)', borderRadius: '4px' }}>
                {product.storage}
              </span>
            )}
            {product.color && (
              <span className="text-[9.5px] font-bold px-2 py-0.5 truncate max-w-[100px]" style={{ backgroundColor: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--b1)', borderRadius: '4px' }}>
                {product.color}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[18px] font-black leading-none" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[12px] leading-none line-through" style={{ color: 'var(--t3)' }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {!!savings && (
            <p className="text-[10px] font-bold" style={{ color: 'var(--ok)' }}>
              Tiết kiệm {formatPrice(savings)}
            </p>
          )}

          {product.available ? (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 text-[12.5px] font-extrabold py-2.5 text-white transition-all duration-200 cursor-pointer hover:shadow-lg"
              style={{
                background: adding ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, var(--accent-h), var(--accent))',
                borderRadius: '8px',
                border: 'none',
              }}
            >
              {adding ? (
                <>
                  <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <button
              className="w-full flex items-center justify-center gap-2 text-[12.5px] font-extrabold py-2.5 transition-colors cursor-pointer"
              style={{
                border: '1.5px solid var(--b1)',
                color: 'var(--t2)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--b2)'
                e.currentTarget.style.color = 'var(--t1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--b1)'
                e.currentTarget.style.color = 'var(--t2)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Nhận thông báo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="pb-4 mb-4 last:mb-0 last:pb-0" style={{ borderBottom: '1px solid var(--b1)' }}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full mb-3 cursor-pointer">
        <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--t1)' }}>{title}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="animate-fade-in">{children}</div>}
    </div>
  )
}

function CheckGroup({ items, selected, onToggle }) {
  return (
    <div className="space-y-2">
      {items.map(({ value, label }) => (
        <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
            className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
          />
          <span className="text-[12.5px] transition-colors" style={{ color: selected.includes(value) ? 'var(--t1)' : 'var(--t2)' }}>
            {label}
          </span>
        </label>
      ))}
    </div>
  )
}

function RadioGroup({ name, items, value, onChange }) {
  return (
    <div className="space-y-2">
      {items.map(({ value: v, label }) => (
        <label key={v} className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
          />
          <span className="text-[12.5px] transition-colors" style={{ color: value === v ? 'var(--t1)' : 'var(--t2)' }}>
            {label}
          </span>
        </label>
      ))}
    </div>
  )
}

const BRAND_LIST = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'vivo', 'realme', 'OnePlus', 'Nokia']
const RAM_OPTIONS = [{ value: '4', label: '4 GB' }, { value: '6', label: '6 GB' }, { value: '8', label: '8 GB' }, { value: '12', label: '12 GB' }, { value: '16', label: '16 GB trở lên' }]
const STORAGE_OPTIONS = [{ value: '64', label: '64 GB' }, { value: '128', label: '128 GB' }, { value: '256', label: '256 GB' }, { value: '512', label: '512 GB' }, { value: '1000', label: '1 TB' }]
const COLOR_OPTIONS = [
  { value: 'black', label: 'Đen', hex: '#111' }, { value: 'white', label: 'Trắng', hex: '#f3f4f6' },
  { value: 'blue', label: 'Xanh', hex: '#3b82f6' }, { value: 'purple', label: 'Tím', hex: '#a855f7' },
  { value: 'gold', label: 'Vàng', hex: '#facc15' }, { value: 'red', label: 'Đỏ', hex: '#ef4444' },
  { value: 'green', label: 'Xanh lá', hex: '#22c55e' }, { value: 'silver', label: 'Bạc', hex: '#9ca3af' },
]
const SIM_OPTIONS = [{ value: 'nano', label: 'Nano SIM' }, { value: 'esim', label: 'eSIM' }, { value: 'nano+esim', label: 'Nano SIM + eSIM' }, { value: 'dual', label: 'Dual SIM' }]
const PRICE_PRESETS = [
  { value: '', label: 'Tất cả' }, { value: 'u5', label: 'Dưới 5 triệu' }, { value: '5-10', label: '5 – 10 triệu' },
  { value: '10-20', label: '10 – 20 triệu' }, { value: '20-30', label: '20 – 30 triệu' }, { value: 'o30', label: 'Trên 30 triệu' },
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

  const toggle = (setter) => (val) => setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

  const activeCount = [selectedBrands, selectedRam, selectedStorage, selectedColors, selectedSim].reduce((s, a) => s + a.length, 0)
    + (os !== 'all' ? 1 : 0) + (screenSize !== 'all' ? 1 : 0) + (battery !== 'all' ? 1 : 0) + (chipset !== 'all' ? 1 : 0)
    + (nfc ? 1 : 0) + (onlyAvailable ? 1 : 0) + (onPromotion ? 1 : 0) + (minPrice || maxPrice || pricePreset ? 1 : 0)

  const resetAll = () => {
    setKeyword(''); setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); setPricePreset('')
    setSelectedRam([]); setSelectedStorage([]); setSelectedColors([]); setSelectedSim([])
    setOs('all'); setScreenSize('all'); setBattery('all'); setChipset('all')
    setNfc(false); setOnlyAvailable(false); setOnPromotion(false)
  }

  return (
    <aside
      className="w-60 shrink-0 p-5 h-fit sticky top-24"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--b1)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.02)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--b1)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--t1)' }}>Bộ lọc</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 text-white text-[10px] font-black flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', borderRadius: '4px' }}>
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-[11px] font-bold transition-colors cursor-pointer" style={{ color: 'var(--t3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >Xoá bộ lọc</button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[12px] rounded-lg border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] transition-all bg-[var(--s1)]"
          />
        </div>
      </div>

      <div className="space-y-0">
        <FilterSection title="Thương hiệu">
          <div className="space-y-2">
            {BRAND_LIST.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggle(setSelectedBrands)(brand)}
                  className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
                />
                <span className="text-[12.5px] transition-colors" style={{ color: selectedBrands.includes(brand) ? 'var(--t1)' : 'var(--t2)' }}>{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Mức giá">
          <RadioGroup name="price" value={pricePreset} onChange={v => { setPricePreset(v); setMinPrice(''); setMaxPrice('') }} items={PRICE_PRESETS} />
          {pricePreset === '' && (
            <div className="flex items-center gap-1.5 mt-3">
              <input
                type="text"
                placeholder="Từ"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
              />
              <span className="text-[11px] shrink-0" style={{ color: 'var(--t3)' }}>–</span>
              <input
                type="text"
                placeholder="Đến"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
              />
            </div>
          )}
        </FilterSection>

        <FilterSection title="Hệ điều hành">
          <RadioGroup name="os" value={os} onChange={setOs} items={[{ value: 'all', label: 'Tất cả' }, { value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]} />
        </FilterSection>

        <FilterSection title="RAM" defaultOpen={false}>
          <CheckGroup items={RAM_OPTIONS} selected={selectedRam} onToggle={toggle(setSelectedRam)} />
        </FilterSection>

        <FilterSection title="Bộ nhớ trong" defaultOpen={false}>
          <CheckGroup items={STORAGE_OPTIONS} selected={selectedStorage} onToggle={toggle(setSelectedStorage)} />
        </FilterSection>

        <FilterSection title="Kích thước màn hình" defaultOpen={false}>
          <RadioGroup name="screen" value={screenSize} onChange={setScreenSize} items={[
            { value: 'all', label: 'Tất cả' }, { value: 'small', label: 'Dưới 6.0"' },
            { value: 'medium', label: '6.0" – 6.5"' }, { value: 'large', label: 'Trên 6.5"' },
          ]} />
        </FilterSection>

        <FilterSection title="Pin" defaultOpen={false}>
          <RadioGroup name="battery" value={battery} onChange={setBattery} items={[
            { value: 'all', label: 'Tất cả' }, { value: 'small', label: 'Dưới 3500 mAh' },
            { value: 'medium', label: '3500 – 4500 mAh' }, { value: 'large', label: '4500 – 5000 mAh' }, { value: 'xlarge', label: 'Trên 5000 mAh' },
          ]} />
        </FilterSection>

        <FilterSection title="Chipset" defaultOpen={false}>
          <RadioGroup name="chipset" value={chipset} onChange={setChipset} items={[
            { value: 'all', label: 'Tất cả' }, { value: 'apple', label: 'Apple A-series' }, { value: 'snapdragon', label: 'Snapdragon' },
            { value: 'dimensity', label: 'Dimensity' }, { value: 'exynos', label: 'Exynos' }, { value: 'helio', label: 'Helio' },
          ]} />
        </FilterSection>

        <FilterSection title="Màu sắc" defaultOpen={false}>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {COLOR_OPTIONS.map(({ value, label, hex }) => (
              <button
                key={value}
                onClick={() => toggle(setSelectedColors)(value)}
                title={label}
                className="w-6 h-6 transition-all cursor-pointer rounded-full"
                style={{
                  backgroundColor: hex,
                  border: '1px solid var(--b2)',
                  outline: selectedColors.includes(value) ? '2px solid var(--accent)' : 'none',
                  outlineOffset: selectedColors.includes(value) ? '2px' : '0',
                  transform: selectedColors.includes(value) ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          {selectedColors.length > 0 && (
            <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--t3)' }}>
              {selectedColors.map(v => COLOR_OPTIONS.find(c => c.value === v)?.label).join(', ')}
            </p>
          )}
        </FilterSection>

        <FilterSection title="Loại SIM" defaultOpen={false}>
          <CheckGroup items={SIM_OPTIONS} selected={selectedSim} onToggle={toggle(setSelectedSim)} />
        </FilterSection>

        <FilterSection title="Khác">
          <div className="space-y-2">
            {[[nfc, () => setNfc(v => !v), 'Hỗ trợ NFC'], [onlyAvailable, () => setOnlyAvailable(v => !v), 'Chỉ hàng có sẵn'], [onPromotion, () => setOnPromotion(v => !v), 'Đang khuyến mãi']].map(([val, fn, label]) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={val} onChange={fn} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
                <span className="text-[12.5px]" style={{ color: val ? 'var(--t1)' : 'var(--t2)' }}>{label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  )
}

function Pagination({ current, total }) {
  const pages = Array.from({ length: Math.min(total, 3) }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        className="w-10 h-10 flex items-center justify-center transition-all cursor-pointer hover:border-slate-400 hover:text-slate-950"
        style={{ border: '1px solid var(--b1)', borderRadius: '10px', color: 'var(--t3)', backgroundColor: 'var(--card)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map(p => (
        <button
          key={p}
          className="w-10 h-10 flex items-center justify-center text-[13px] font-black transition-all cursor-pointer"
          style={p === current
            ? { background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', color: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }
            : { border: '1px solid var(--b1)', color: 'var(--t2)', borderRadius: '10px', backgroundColor: 'var(--card)' }
          }
        >
          {p}
        </button>
      ))}
      {total > 3 && <span className="w-10 h-10 flex items-center justify-center text-[13px]" style={{ color: 'var(--t3)' }}>…</span>}
      <button
        className="w-10 h-10 flex items-center justify-center transition-all cursor-pointer hover:border-slate-400 hover:text-slate-950"
        style={{ border: '1px solid var(--b1)', borderRadius: '10px', color: 'var(--t3)', backgroundColor: 'var(--card)' }}
      >
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
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then(data => setProducts((data.items ?? []).map(mapApiProduct)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* Category header — premium dark slate gradient */}
      <div
        className="py-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderBottom: '1px solid var(--b1)',
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,66,10,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <p className="text-[11px] font-extrabold tracking-[0.25em] uppercase mb-1.5" style={{ color: 'var(--accent)' }}>
            Danh mục sản phẩm
          </p>
          <h1 className="text-[28px] font-black text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            Điện thoại di động
          </h1>
          <p className="text-sm mt-1.5 text-slate-400">
            Khám phá những mẫu điện thoại mới nhất với các ưu đãi trả góp 0% độc quyền tại TechStore.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] mb-6" style={{ color: 'var(--t3)' }}>
          <button
            onClick={() => onNavigate('home')}
            className="transition-colors cursor-pointer hover:text-slate-900"
          >
            Trang chủ
          </button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span style={{ color: 'var(--t1)' }}>Điện thoại di động</span>
        </nav>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--b1)' }}>
          <p className="text-[13px]" style={{ color: 'var(--t2)' }}>
            {loading ? (
              'Đang tải sản phẩm...'
            ) : (
              <>
                Phân tích{' '}
                <span className="font-extrabold" style={{ color: 'var(--t1)' }}>
                  {products.length}
                </span>{' '}
                sản phẩm có sẵn
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[12.5px] font-medium" style={{ color: 'var(--t3)' }}>Sắp xếp theo:</span>
            <select
              className="px-3.5 py-2 text-[12.5px] font-semibold rounded-lg border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-white cursor-pointer"
            >
              <option>Mới nhất</option>
              <option>Giá thấp đến cao</option>
              <option>Giá cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Filter + Grid */}
        <div className="flex gap-7 items-start">
          <FilterPanel />
          <div className="flex-1 min-w-0">
            {error && (
              <div
                className="text-[13px] mb-6 px-4 py-3 font-semibold"
                style={{
                  color: 'var(--err)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  backgroundColor: 'rgba(239,68,68,0.04)',
                  borderRadius: '10px',
                }}
              >
                Không thể kết nối danh sách sản phẩm: {error}
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse"
                    style={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--b1)',
                      borderRadius: '16px',
                    }}
                  />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="text-center py-20 text-sm font-semibold" style={{ color: 'var(--t3)' }}>
                Rất tiếc! Không có sản phẩm nào đáp ứng bộ lọc của bạn.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>
            )}
            {!loading && products.length > 0 && (
              <Pagination current={1} total={Math.ceil(products.length / 9)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
