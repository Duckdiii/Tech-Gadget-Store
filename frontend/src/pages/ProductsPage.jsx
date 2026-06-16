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
      className="group overflow-hidden flex flex-col transition-shadow duration-200 cursor-pointer"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--cb)', borderRadius: '4px' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#c8d0e4' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--cb)' }}
    >
      {/* Image */}
      <div
        onClick={() => onNavigate('detail')}
        className="relative flex items-center justify-center h-48 overflow-hidden"
        style={{ backgroundColor: 'var(--page)', borderBottom: '1px solid var(--cb)' }}
      >
        {product.tag && (
          <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold px-2 py-0.5 text-white uppercase tracking-wide" style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}>
            {product.tag}
          </span>
        )}
        {product.discount && (
          <span className="absolute top-2.5 right-2.5 z-10 text-[10px] font-extrabold px-2 py-0.5 text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}>
            -{product.discount}%
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); setWished(w => !w) }}
          className="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: wished ? 'rgba(239,68,68,0.1)' : 'var(--card)',
            border: `1px solid ${wished ? 'rgba(239,68,68,0.4)' : 'var(--cb)'}`,
            borderRadius: '3px',
            color: wished ? '#ef4444' : 'var(--ct3)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {!product.available && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'rgba(238,241,249,0.8)' }}>
            <span className="text-xs font-bold px-3 py-1" style={{ backgroundColor: 'var(--ct2)', color: 'white', borderRadius: '2px' }}>Hết hàng</span>
          </div>
        )}
        <img src={product.image} alt={product.name} className="h-36 w-36 object-contain group-hover:scale-[1.03] transition-transform duration-300" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{product.brand}</span>
          {product.available
            ? <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--ok)' }}><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: 'var(--ok)' }} />Còn hàng</span>
            : <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--ct3)' }}><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: 'var(--ct3)' }} />Hết hàng</span>
          }
        </div>

        <p
          onClick={() => onNavigate('detail')}
          className="text-[13px] font-medium leading-snug line-clamp-2 min-h-[2.5rem] transition-colors"
          style={{ color: 'var(--ct1)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ct1)'}
        >
          {product.name}
        </p>

        {product.rating != null && (
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3" style={{ color: i < Math.floor(product.rating) ? '#F59E0B' : '#e5e7eb' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[11px]" style={{ color: 'var(--ct3)' }}>({product.reviews.toLocaleString('vi-VN')})</span>
          </div>
        )}

        {(product.ram || product.storage || product.color) && (
          <div className="flex flex-wrap gap-1">
            {product.ram && <span className="text-[10px] font-medium px-1.5 py-0.5" style={{ backgroundColor: 'var(--page)', color: 'var(--ct2)', border: '1px solid var(--cb)', borderRadius: '2px' }}>RAM {product.ram}</span>}
            {product.storage && <span className="text-[10px] font-medium px-1.5 py-0.5" style={{ backgroundColor: 'var(--page)', color: 'var(--ct2)', border: '1px solid var(--cb)', borderRadius: '2px' }}>{product.storage}</span>}
            {product.color && <span className="text-[10px] font-medium px-1.5 py-0.5 truncate max-w-[100px]" style={{ backgroundColor: 'var(--page)', color: 'var(--ct2)', border: '1px solid var(--cb)', borderRadius: '2px' }}>{product.color}</span>}
          </div>
        )}

        <div className="mt-auto pt-1">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-[16px] font-extrabold leading-none" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-[12px] leading-none line-through" style={{ color: 'var(--ct3)' }}>{formatPrice(product.originalPrice)}</span>}
          </div>
          {!!savings && <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--ok)' }}>Tiết kiệm {formatPrice(savings)}</p>}
        </div>

        {product.available ? (
          <button
            onClick={handleAddToCart}
            className="mt-1 w-full flex items-center justify-center gap-2 text-[13px] font-semibold py-2 text-white transition-colors"
            style={{ backgroundColor: adding ? 'var(--ok)' : 'var(--accent)', borderRadius: '3px' }}
            onMouseEnter={e => { if (!adding) e.currentTarget.style.backgroundColor = 'var(--accent-d)' }}
            onMouseLeave={e => { if (!adding) e.currentTarget.style.backgroundColor = 'var(--accent)' }}
          >
            {adding
              ? <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Đã thêm!</>
              : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Thêm vào giỏ</>
            }
          </button>
        ) : (
          <button
            className="mt-1 w-full flex items-center justify-center gap-2 text-[13px] font-medium py-2 transition-colors"
            style={{ border: '1px solid var(--cb)', color: 'var(--ct3)', borderRadius: '3px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8d0e4'; e.currentTarget.style.color = 'var(--ct2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct3)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Nhận thông báo
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Filter panel ── */

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="pb-3 mb-3 last:mb-0 last:pb-0" style={{ borderBottom: '1px solid var(--cb)' }}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full mb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--ct1)' }}>{title}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--ct3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <label key={value} className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="w-3.5 h-3.5" />
          <span className="text-[12px] transition-colors" style={{ color: selected.includes(value) ? 'var(--ct1)' : 'var(--ct2)' }}>{label}</span>
        </label>
      ))}
    </div>
  )
}

function RadioGroup({ name, items, value, onChange }) {
  return (
    <div className="space-y-1.5">
      {items.map(({ value: v, label }) => (
        <label key={v} className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="w-3.5 h-3.5" />
          <span className="text-[12px] transition-colors" style={{ color: value === v ? 'var(--ct1)' : 'var(--ct2)' }}>{label}</span>
        </label>
      ))}
    </div>
  )
}

const BRAND_LIST = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'vivo', 'realme', 'OnePlus', 'Nokia']
const RAM_OPTIONS = [{ value: '4', label: '4 GB' }, { value: '6', label: '6 GB' }, { value: '8', label: '8 GB' }, { value: '12', label: '12 GB' }, { value: '16', label: '16 GB trở lên' }]
const STORAGE_OPTIONS = [{ value: '64', label: '64 GB' }, { value: '128', label: '128 GB' }, { value: '256', label: '256 GB' }, { value: '512', label: '512 GB' }, { value: '1000', label: '1 TB' }]
const COLOR_OPTIONS = [
  { value: 'black', label: 'Đen', hex: '#111' }, { value: 'white', label: 'Trắng', hex: '#e5e7eb' },
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
      className="w-56 shrink-0 p-4 h-fit sticky top-4"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--cb)', borderRadius: '4px', borderTop: '3px solid var(--accent)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--cb)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>Bộ lọc</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}>
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-[11px] font-medium transition-colors" style={{ color: 'var(--ct3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct3)'}
          >Xoá tất cả</button>
        )}
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--ct3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Tìm sản phẩm..." value={keyword} onChange={e => setKeyword(e.target.value)} className="field-light w-full pl-8 pr-3 py-2 text-[12px]" />
        </div>
      </div>

      <div className="space-y-0">
        <FilterSection title="Thương hiệu">
          <div className="space-y-1.5">
            {BRAND_LIST.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggle(setSelectedBrands)(brand)} className="w-3.5 h-3.5" />
                <span className="text-[12px]" style={{ color: selectedBrands.includes(brand) ? 'var(--ct1)' : 'var(--ct2)' }}>{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Mức giá">
          <RadioGroup name="price" value={pricePreset} onChange={v => { setPricePreset(v); setMinPrice(''); setMaxPrice('') }} items={PRICE_PRESETS} />
          {pricePreset === '' && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <input type="text" placeholder="Từ" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="field-light w-full px-2 py-1.5 text-[12px]" />
              <span className="text-[11px] shrink-0" style={{ color: 'var(--ct3)' }}>–</span>
              <input type="text" placeholder="Đến" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="field-light w-full px-2 py-1.5 text-[12px]" />
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
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(({ value, label, hex }) => (
              <button key={value} onClick={() => toggle(setSelectedColors)(value)} title={label}
                className="w-5 h-5 transition-all"
                style={{
                  backgroundColor: hex, borderRadius: '2px',
                  outline: selectedColors.includes(value) ? '2px solid var(--accent)' : '1px solid var(--cb)',
                  outlineOffset: selectedColors.includes(value) ? '2px' : '0',
                  transform: selectedColors.includes(value) ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          {selectedColors.length > 0 && (
            <p className="text-[10px] mt-2" style={{ color: 'var(--ct3)' }}>
              {selectedColors.map(v => COLOR_OPTIONS.find(c => c.value === v)?.label).join(', ')}
            </p>
          )}
        </FilterSection>

        <FilterSection title="Loại SIM" defaultOpen={false}>
          <CheckGroup items={SIM_OPTIONS} selected={selectedSim} onToggle={toggle(setSelectedSim)} />
        </FilterSection>

        <FilterSection title="Khác">
          <div className="space-y-1.5">
            {[[nfc, () => setNfc(v => !v), 'Hỗ trợ NFC'], [onlyAvailable, () => setOnlyAvailable(v => !v), 'Chỉ hàng có sẵn'], [onPromotion, () => setOnPromotion(v => !v), 'Đang khuyến mãi']].map(([val, fn, label]) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={val} onChange={fn} className="w-3.5 h-3.5" />
                <span className="text-[12px]" style={{ color: val ? 'var(--ct1)' : 'var(--ct2)' }}>{label}</span>
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
    <div className="flex items-center justify-center gap-1 mt-8">
      <button className="w-8 h-8 flex items-center justify-center transition-colors" style={{ border: '1px solid var(--cb)', borderRadius: '3px', color: 'var(--ct3)', backgroundColor: 'var(--card)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8d0e4'; e.currentTarget.style.color = 'var(--ct1)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct3)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      {pages.map(p => (
        <button key={p} className="w-8 h-8 flex items-center justify-center text-[13px] font-semibold transition-colors"
          style={p === current
            ? { backgroundColor: 'var(--accent)', color: 'white', borderRadius: '3px' }
            : { border: '1px solid var(--cb)', color: 'var(--ct2)', borderRadius: '3px', backgroundColor: 'var(--card)' }
          }
        >{p}</button>
      ))}
      {total > 3 && <span className="w-8 h-8 flex items-center justify-center text-[13px]" style={{ color: 'var(--ct3)' }}>…</span>}
      <button className="w-8 h-8 flex items-center justify-center transition-colors" style={{ border: '1px solid var(--cb)', borderRadius: '3px', color: 'var(--ct3)', backgroundColor: 'var(--card)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8d0e4'; e.currentTarget.style.color = 'var(--ct1)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct3)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
      .then(data => setProducts(data.map(mapApiProduct)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* Category header — dark */}
      <div style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }} className="py-5">
        <div className="max-w-screen-2xl mx-auto px-6">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: 'var(--accent)' }}>Danh mục</p>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>Điện thoại di động</h1>
        </div>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] mb-4" style={{ color: 'var(--ct3)' }}>
          <button onClick={() => onNavigate('home')} className="transition-colors" style={{ color: 'var(--ct3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ct1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct3)'}
          >Trang chủ</button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: 'var(--ct1)' }}>Điện thoại di động</span>
        </nav>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px]" style={{ color: 'var(--ct2)' }}>
            {loading ? 'Đang tải...' : <><span className="font-semibold" style={{ color: 'var(--ct1)' }}>{products.length}</span> sản phẩm</>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[12px]" style={{ color: 'var(--ct3)' }}>Sắp xếp:</span>
            <select className="field-light px-3 py-1.5 text-[12px] cursor-pointer">
              <option>Mới nhất</option>
              <option>Giá thấp đến cao</option>
              <option>Giá cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Filter + Grid */}
        <div className="flex gap-5 items-start">
          <FilterPanel />
          <div className="flex-1">
            {error && (
              <div className="text-[13px] mb-4 px-4 py-3" style={{ color: 'var(--err)', border: '1px solid rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: '4px' }}>
                Không thể tải sản phẩm: {error}
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-72" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--cb)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />)}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="text-center py-16 text-[13px]" style={{ color: 'var(--ct3)' }}>Chưa có sản phẩm nào.</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {products.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
              </div>
            )}
            {!loading && products.length > 0 && <Pagination current={1} total={Math.ceil(products.length / 9)} />}
          </div>
        </div>
      </div>
    </div>
  )
}
