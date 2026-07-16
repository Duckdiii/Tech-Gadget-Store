import { useState, useEffect } from 'react'

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

// Gõ tự do (từ khoá, giá) chỉ đẩy lên component cha sau khi ngừng gõ ~450ms, tránh gọi API
// filter thật trên mỗi phím bấm.
function useDebouncedCommit(externalValue, onCommit, delayMs = 450) {
  const [text, setText] = useState(externalValue)
  useEffect(() => { setText(externalValue) }, [externalValue])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== externalValue) onCommit(text)
    }, delayMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
  return [text, setText]
}

const RAM_OPTIONS = [{ value: 4, label: '4 GB' }, { value: 6, label: '6 GB' }, { value: 8, label: '8 GB' }, { value: 12, label: '12 GB' }, { value: 16, label: '16 GB' }, { value: 32, label: '32 GB' }]
const STORAGE_OPTIONS = [{ value: 64, label: '64 GB' }, { value: 128, label: '128 GB' }, { value: 256, label: '256 GB' }, { value: 512, label: '512 GB' }, { value: 1000, label: '1 TB' }]
const COLOR_OPTIONS = [
  { value: 'Đen', hex: '#111' }, { value: 'Trắng', hex: '#f3f4f6' },
  { value: 'Xanh', hex: '#3b82f6' }, { value: 'Tím', hex: '#a855f7' },
  { value: 'Vàng', hex: '#facc15' }, { value: 'Đỏ', hex: '#ef4444' },
  { value: 'Xanh lá', hex: '#22c55e' }, { value: 'Bạc', hex: '#9ca3af' },
]
const PRICE_PRESETS = [
  { value: '', label: 'Tất cả', min: undefined, max: undefined },
  { value: 'u5', label: 'Dưới 5 triệu', min: undefined, max: 5_000_000 },
  { value: '5-10', label: '5 – 10 triệu', min: 5_000_000, max: 10_000_000 },
  { value: '10-20', label: '10 – 20 triệu', min: 10_000_000, max: 20_000_000 },
  { value: '20-30', label: '20 – 30 triệu', min: 20_000_000, max: 30_000_000 },
  { value: 'o30', label: 'Trên 30 triệu', min: 30_000_000, max: undefined },
]

// --- Phone-specific ---
const SIM_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'nano', label: 'Nano SIM' }, { value: 'esim', label: 'eSIM' },
  { value: 'nano+esim', label: 'Nano SIM + eSIM' }, { value: 'dual', label: 'Dual SIM' },
]
const CHIPSET_OPTIONS = [
  { value: 'all', label: 'Tất cả' }, { value: 'apple', label: 'Apple A-series' }, { value: 'snapdragon', label: 'Snapdragon' },
  { value: 'dimensity', label: 'Dimensity' }, { value: 'exynos', label: 'Exynos' }, { value: 'helio', label: 'Helio' },
]
const SCREEN_BUCKETS = [
  { value: 'all', label: 'Tất cả', min: undefined, max: undefined },
  { value: 'small', label: 'Dưới 6.0"', min: undefined, max: 5.99 },
  { value: 'medium', label: '6.0" – 6.5"', min: 6.0, max: 6.5 },
  { value: 'large', label: 'Trên 6.5"', min: 6.51, max: undefined },
]
const BATTERY_BUCKETS = [
  { value: 'all', label: 'Tất cả', min: undefined, max: undefined },
  { value: 'small', label: 'Dưới 3500 mAh', min: undefined, max: 3499 },
  { value: 'medium', label: '3500 – 4500 mAh', min: 3500, max: 4500 },
  { value: 'large', label: '4500 – 5000 mAh', min: 4501, max: 5000 },
  { value: 'xlarge', label: 'Trên 5000 mAh', min: 5001, max: undefined },
]

// --- Monitor-specific ---
const REFRESH_RATE_BUCKETS = [
  { value: 'all', label: 'Tất cả', min: undefined, max: undefined },
  { value: '60', label: '60 Hz', min: 60, max: 60 },
  { value: '100-144', label: '100 – 144 Hz', min: 100, max: 144 },
  { value: '165+', label: '165 Hz trở lên', min: 165, max: undefined },
]
const PANEL_TYPES = ['IPS', 'VA', 'OLED', 'TN', 'Nano IPS', 'Mini-LED']

// Helper: detect category type from names list
function detectCategory(categoryNames) {
  if (!categoryNames || categoryNames.length === 0) return 'all'
  const joined = categoryNames.join(' ').toLowerCase()
  if (joined.includes('điện thoại') || joined.includes('phone')) return 'phone'
  if (joined.includes('laptop')) return 'laptop'
  if (joined.includes('màn hình') || joined.includes('monitor')) return 'monitor'
  if (joined.includes('tai nghe') || joined.includes('headphone')) return 'headphones'
  if (joined.includes('smartwatch') || joined.includes('đồng hồ')) return 'smartwatch'
  return 'mixed'
}

export default function FilterPanel({ filters, onChange, onReset, categories = [], brands = [] }) {
  const [keywordText, setKeywordText] = useDebouncedCommit(
    filters.keyword ?? '', (v) => onChange({ keyword: v }))

  const [cpuText, setCpuText] = useDebouncedCommit(
    filters.cpuKeyword ?? '', (v) => onChange({ cpuKeyword: v || undefined }))

  const [gpuText, setGpuText] = useDebouncedCommit(
    filters.gpuKeyword ?? '', (v) => onChange({ gpuKeyword: v || undefined }))

  const minPriceVnd = filters.minPrice
  const maxPriceVnd = filters.maxPrice
  const [minPriceText, setMinPriceText] = useDebouncedCommit(
    minPriceVnd != null ? String(minPriceVnd / 1_000_000) : '',
    (v) => onChange({ minPrice: v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Math.round(Number(v) * 1_000_000) }))
  const [maxPriceText, setMaxPriceText] = useDebouncedCommit(
    maxPriceVnd != null ? String(maxPriceVnd / 1_000_000) : '',
    (v) => onChange({ maxPrice: v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Math.round(Number(v) * 1_000_000) }))

  const toggleList = (field, value) => {
    const current = filters[field] ?? []
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    onChange({ [field]: next })
  }

  const selectedBrands = filters.brandNames ?? []
  const selectedRam = filters.ramGb ?? []
  const selectedStorage = filters.storageGb ?? []
  const selectedColors = filters.colors ?? []
  const selectedCategories = filters.categoryNames ?? []

  const activePricePreset = PRICE_PRESETS.find(p => p.min === filters.minPrice && p.max === filters.maxPrice)?.value ?? ''
  const activeOs = filters.operatingSystem ?? 'all'
  const activeScreenBucket = SCREEN_BUCKETS.find(b => b.min === filters.minScreenSize && b.max === filters.maxScreenSize)?.value ?? 'all'
  const activeBatteryBucket = BATTERY_BUCKETS.find(b => b.min === filters.minBatteryCapacity && b.max === filters.maxBatteryCapacity)?.value ?? 'all'
  const activeChipset = filters.chipset ?? 'all'
  const activeSim = filters.simType ?? 'all'
  const activeRefreshBucket = REFRESH_RATE_BUCKETS.find(b => b.min === filters.minRefreshRate && b.max === filters.maxRefreshRate)?.value ?? 'all'
  const priceActive = filters.minPrice != null || filters.maxPrice != null

  const categoryType = detectCategory(selectedCategories)
  const isPhoneScope = categoryType === 'all' || categoryType === 'phone' || categoryType === 'mixed'
  const isLaptopScope = categoryType === 'laptop'
  const isMonitorScope = categoryType === 'monitor'
  const isHeadphonesScope = categoryType === 'headphones'
  const isSmartwatchScope = categoryType === 'smartwatch'

  const activeCount = selectedBrands.length + selectedRam.length + selectedStorage.length + selectedColors.length
    + selectedCategories.length
    + (activeOs !== 'all' ? 1 : 0) + (activeScreenBucket !== 'all' ? 1 : 0) + (activeBatteryBucket !== 'all' ? 1 : 0)
    + (activeChipset !== 'all' ? 1 : 0) + (activeSim !== 'all' ? 1 : 0)
    + (filters.nfcSupported ? 1 : 0) + (filters.onlyAvailable ? 1 : 0) + (filters.onPromotion ? 1 : 0)
    + (priceActive ? 1 : 0) + (filters.keyword ? 1 : 0)
    + (filters.cpuKeyword ? 1 : 0) + (filters.gpuKeyword ? 1 : 0)
    + (filters.panelType ? 1 : 0) + (activeRefreshBucket !== 'all' ? 1 : 0)
    + (filters.isWireless != null ? 1 : 0) + (filters.hasNoiseCancelling ? 1 : 0)
    + (filters.hasGps ? 1 : 0) + (filters.isWaterResistant ? 1 : 0)

  const selectPricePreset = (value) => {
    const preset = PRICE_PRESETS.find(p => p.value === value)
    onChange({ minPrice: preset?.min, maxPrice: preset?.max })
  }
  const selectScreenBucket = (value) => {
    const bucket = SCREEN_BUCKETS.find(b => b.value === value)
    onChange({ minScreenSize: bucket?.min, maxScreenSize: bucket?.max })
  }
  const selectBatteryBucket = (value) => {
    const bucket = BATTERY_BUCKETS.find(b => b.value === value)
    onChange({ minBatteryCapacity: bucket?.min, maxBatteryCapacity: bucket?.max })
  }
  const selectRefreshBucket = (value) => {
    const bucket = REFRESH_RATE_BUCKETS.find(b => b.value === value)
    onChange({ minRefreshRate: bucket?.min, maxRefreshRate: bucket?.max })
  }

  // Active filter chips for quick-clear
  const activeChips = []
  selectedCategories.forEach(c => activeChips.push({ label: c, clear: () => toggleList('categoryNames', c) }))
  selectedBrands.forEach(b => activeChips.push({ label: b, clear: () => toggleList('brandNames', b) }))
  if (filters.keyword) activeChips.push({ label: `"${filters.keyword}"`, clear: () => onChange({ keyword: '' }) })
  if (priceActive) activeChips.push({ label: 'Lọc giá', clear: () => onChange({ minPrice: undefined, maxPrice: undefined }) })

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
          <button onClick={onReset} className="text-[11px] font-bold transition-colors cursor-pointer border-none bg-transparent" style={{ color: 'var(--t3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >Xoá bộ lọc</button>
        )}
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.clear}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold cursor-pointer border-none transition-all"
              style={{ backgroundColor: 'rgba(234,88,12,0.08)', color: 'var(--accent)', border: '1px solid rgba(234,88,12,0.2)' }}
            >
              {chip.label}
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex-1 min-w-0 mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={keywordText}
            onChange={e => setKeywordText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[12px] rounded-lg border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] transition-all bg-[var(--s1)]"
          />
        </div>
      </div>

      <div className="space-y-0">

        {/* ===== Danh mục (multi-select từ DB) ===== */}
        {categories.length > 0 && (
          <FilterSection title="Danh mục">
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => {
                      toggleList('categoryNames', cat.name)
                      // Reset phone-specific filters when switching away from phone category
                      if (selectedCategories.includes(cat.name)) {
                        onChange({
                          operatingSystem: undefined, chipset: undefined, simType: undefined,
                          nfcSupported: undefined, minScreenSize: undefined, maxScreenSize: undefined,
                          minBatteryCapacity: undefined, maxBatteryCapacity: undefined,
                          cpuKeyword: undefined, gpuKeyword: undefined, panelType: undefined,
                          minRefreshRate: undefined, maxRefreshRate: undefined,
                          isWireless: undefined, hasNoiseCancelling: undefined,
                          hasGps: undefined, isWaterResistant: undefined,
                        })
                      }
                    }}
                    className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
                  />
                  <span className="text-[12.5px] transition-colors" style={{ color: selectedCategories.includes(cat.name) ? 'var(--t1)' : 'var(--t2)' }}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* ===== Thương hiệu (từ API) ===== */}
        {brands.length > 0 && (
          <FilterSection title="Thương hiệu">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleList('brandNames', brand)}
                    className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
                  />
                  <span className="text-[12.5px] transition-colors" style={{ color: selectedBrands.includes(brand) ? 'var(--t1)' : 'var(--t2)' }}>{brand}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* ===== Mức giá (chung cho mọi loại) ===== */}
        <FilterSection title="Mức giá">
          <RadioGroup name="price" value={activePricePreset} onChange={selectPricePreset} items={PRICE_PRESETS} />
          {activePricePreset === '' && (
            <div className="flex items-center gap-1.5 mt-3">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Từ (triệu)"
                value={minPriceText}
                onChange={e => setMinPriceText(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
              />
              <span className="text-[11px] shrink-0" style={{ color: 'var(--t3)' }}>–</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Đến (triệu)"
                value={maxPriceText}
                onChange={e => setMaxPriceText(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
              />
            </div>
          )}
        </FilterSection>

        {/* ===== RAM & Storage (chung: Phone/Laptop) ===== */}
        {(isPhoneScope || isLaptopScope) && (
          <>
            <FilterSection title="RAM" defaultOpen={false}>
              <CheckGroup items={RAM_OPTIONS} selected={selectedRam} onToggle={v => toggleList('ramGb', v)} />
            </FilterSection>
            <FilterSection title="Bộ nhớ trong" defaultOpen={false}>
              <CheckGroup items={STORAGE_OPTIONS} selected={selectedStorage} onToggle={v => toggleList('storageGb', v)} />
            </FilterSection>
          </>
        )}

        {/* ===== Màu sắc (chung cho mọi loại) ===== */}
        <FilterSection title="Màu sắc" defaultOpen={false}>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {COLOR_OPTIONS.map(({ value, hex }) => (
              <button
                key={value}
                onClick={() => toggleList('colors', value)}
                title={value}
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
              {selectedColors.join(', ')}
            </p>
          )}
        </FilterSection>

        {/* ===== PHONE-specific filters ===== */}
        {isPhoneScope && (
          <>
            <FilterSection title="Hệ điều hành" defaultOpen={false}>
              <RadioGroup name="os" value={activeOs} onChange={v => onChange({ operatingSystem: v === 'all' ? undefined : v })} items={[{ value: 'all', label: 'Tất cả' }, { value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]} />
            </FilterSection>
            <FilterSection title="Kích thước màn hình" defaultOpen={false}>
              <RadioGroup name="screen" value={activeScreenBucket} onChange={selectScreenBucket} items={SCREEN_BUCKETS} />
            </FilterSection>
            <FilterSection title="Dung lượng pin" defaultOpen={false}>
              <RadioGroup name="battery" value={activeBatteryBucket} onChange={selectBatteryBucket} items={BATTERY_BUCKETS} />
            </FilterSection>
            <FilterSection title="Chipset" defaultOpen={false}>
              <RadioGroup name="chipset" value={activeChipset} onChange={v => onChange({ chipset: v === 'all' ? undefined : v })} items={CHIPSET_OPTIONS} />
            </FilterSection>
            <FilterSection title="Loại SIM" defaultOpen={false}>
              <RadioGroup name="sim" value={activeSim} onChange={v => onChange({ simType: v === 'all' ? undefined : v })} items={SIM_OPTIONS} />
            </FilterSection>
            <FilterSection title="Tính năng đặc biệt" defaultOpen={false}>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={!!filters.nfcSupported} onChange={() => onChange({ nfcSupported: !filters.nfcSupported || undefined })} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
                  <span className="text-[12.5px]" style={{ color: filters.nfcSupported ? 'var(--t1)' : 'var(--t2)' }}>Hỗ trợ NFC</span>
                </label>
              </div>
            </FilterSection>
          </>
        )}

        {/* ===== LAPTOP-specific filters ===== */}
        {isLaptopScope && (
          <>
            <FilterSection title="CPU / Bộ xử lý" defaultOpen={true}>
              <input
                type="text"
                placeholder="VD: Core i7, Ryzen 5..."
                value={cpuText}
                onChange={e => setCpuText(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
              />
            </FilterSection>
            <FilterSection title="GPU / Card đồ họa" defaultOpen={false}>
              <input
                type="text"
                placeholder="VD: RTX 4060, Iris Xe..."
                value={gpuText}
                onChange={e => setGpuText(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
              />
            </FilterSection>
            <FilterSection title="Hệ điều hành" defaultOpen={false}>
              <RadioGroup name="laptop-os" value={activeOs} onChange={v => onChange({ operatingSystem: v === 'all' ? undefined : v })} items={[{ value: 'all', label: 'Tất cả' }, { value: 'windows', label: 'Windows' }, { value: 'macos', label: 'macOS' }, { value: 'linux', label: 'Linux' }]} />
            </FilterSection>
          </>
        )}

        {/* ===== MONITOR-specific filters ===== */}
        {isMonitorScope && (
          <>
            <FilterSection title="Tần số quét" defaultOpen={true}>
              <RadioGroup name="refresh" value={activeRefreshBucket} onChange={selectRefreshBucket} items={REFRESH_RATE_BUCKETS} />
            </FilterSection>
            <FilterSection title="Tấm nền (Panel)" defaultOpen={false}>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="radio" name="panel" checked={!filters.panelType} onChange={() => onChange({ panelType: undefined })} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
                  <span className="text-[12.5px]" style={{ color: !filters.panelType ? 'var(--t1)' : 'var(--t2)' }}>Tất cả</span>
                </label>
                {PANEL_TYPES.map(p => (
                  <label key={p} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="panel" checked={filters.panelType === p} onChange={() => onChange({ panelType: p })} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
                    <span className="text-[12.5px]" style={{ color: filters.panelType === p ? 'var(--t1)' : 'var(--t2)' }}>{p}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* ===== HEADPHONES-specific filters ===== */}
        {isHeadphonesScope && (
          <FilterSection title="Kết nối & Tính năng" defaultOpen={true}>
            <div className="space-y-2">
              {[
                [filters.isWireless === true, () => onChange({ isWireless: filters.isWireless === true ? undefined : true }), 'Không dây (Wireless)'],
                [filters.isWireless === false, () => onChange({ isWireless: filters.isWireless === false ? undefined : false }), 'Có dây (Wired)'],
                [!!filters.hasNoiseCancelling, () => onChange({ hasNoiseCancelling: !filters.hasNoiseCancelling || undefined }), 'Chống ồn ANC'],
              ].map(([val, fn, label]) => (
                <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={val} onChange={fn} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
                  <span className="text-[12.5px]" style={{ color: val ? 'var(--t1)' : 'var(--t2)' }}>{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* ===== SMARTWATCH-specific filters ===== */}
        {isSmartwatchScope && (
          <FilterSection title="Tính năng" defaultOpen={true}>
            <div className="space-y-2">
              {[
                [!!filters.hasGps, () => onChange({ hasGps: !filters.hasGps || undefined }), 'Có GPS'],
                [!!filters.isWaterResistant, () => onChange({ isWaterResistant: !filters.isWaterResistant || undefined }), 'Chống nước'],
              ].map(([val, fn, label]) => (
                <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={val} onChange={fn} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
                  <span className="text-[12.5px]" style={{ color: val ? 'var(--t1)' : 'var(--t2)' }}>{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* ===== Khác (chung cho mọi loại) ===== */}
        <FilterSection title="Khác">
          <div className="space-y-2">
            {[
              [!!filters.onlyAvailable, () => onChange({ onlyAvailable: !filters.onlyAvailable || undefined }), 'Chỉ hàng có sẵn'],
              [!!filters.onPromotion, () => onChange({ onPromotion: !filters.onPromotion || undefined }), 'Đang khuyến mãi'],
            ].map(([val, fn, label]) => (
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
