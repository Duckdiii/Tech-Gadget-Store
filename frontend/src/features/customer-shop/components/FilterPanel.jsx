import { useState } from 'react'

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="pb-4 mb-4 last:mb-0 last:pb-0" style={{ borderBottom: '1px solid var(--b1)' }}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full mb-3 cursor-pointer border-none bg-transparent">
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

export default function FilterPanel() {
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
          <button onClick={resetAll} className="text-[11px] font-bold transition-colors cursor-pointer border-none bg-transparent" style={{ color: 'var(--t3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >Xoá bộ lọc</button>
        )}
      </div>

      {/* Search */}
      <div className="flex-1 min-w-0 mb-4">
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
                className="w-6 h-6 transition-all cursor-pointer rounded-full border-none"
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
