import { useState, useEffect, useRef, useCallback } from 'react'

function useClickOutside(ref, onOutside) {
  const onOutsideRef = useRef(onOutside)
  useEffect(() => {
    onOutsideRef.current = onOutside
  }, [onOutside])

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutsideRef.current?.()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref])
}

// Nút mở dropdown filter trên thanh ngang — panel bung xuống khi bấm, tự đóng khi click ra ngoài.
function FilterDropdown({ label, count = 0, children, panelClassName = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const handleClose = useCallback(() => setOpen(false), [])
  useClickOutside(ref, handleClose)
  const active = count > 0

  return (
    <div className="relative" ref={ref}>
      <button aria-label="Thao tác" type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap"
        style={{
          borderColor: active ? 'var(--accent)' : 'var(--b1)',
          backgroundColor: active ? 'rgba(234,88,12,0.06)' : 'var(--card)',
          color: active ? 'var(--accent)' : 'var(--t2)',
        }}
      >
        {label}
        {active && (
          <span className="w-4 h-4 text-[10px] font-black text-white flex items-center justify-center rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
            {count}
          </span>
        )}
        <svg className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute left-0 top-full mt-2 z-20 p-4 min-w-[240px] max-h-[70vh] overflow-y-auto ${panelClassName}`}
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', boxShadow: '0 16px 40px rgba(15,23,42,0.14)' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function FilterGroupLabel({ children }) {
  return <p className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5 first:mt-0 mt-4" style={{ color: 'var(--t3)' }}>{children}</p>
}

function CheckGroup({ items, selected, onToggle, counts = {} }) {
  return (
    <div className="space-y-2">
      {(() => {
        const selectedSet = new Set(selected)
        return items.map(({ value, label }) => {
          const count = counts[value] ?? 0
          const isChecked = selectedSet.has(value)
          return (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(value)}
                className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
              />
              <span className="text-[12.5px] transition-colors" style={{ color: isChecked ? 'var(--t1)' : 'var(--t2)' }}>
                {label} <span className="text-[10.5px] text-slate-400 font-bold">({count})</span>
              </span>
            </label>
          )
        })
      })()}
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
  const [prevExternal, setPrevExternal] = useState(externalValue)

  if (prevExternal !== externalValue) {
    setPrevExternal(externalValue)
    setText(externalValue)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== externalValue) onCommit(text)
    }, delayMs)
    return () => clearTimeout(timer)
    // react-doctor-disable-next-line react-doctor/effect-dependency-recreated-every-render, react-doctor/exhaustive-deps
  }, [text, externalValue, delayMs])

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

export default function FilterPanel({ filters, onChange, onReset, categories = [], brands = [], facetCounts = {} }) {
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

  const [sliderMin, setSliderMin] = useState(() => filters.minPrice != null ? Math.round(filters.minPrice / 1_000_000) : 0)
  const [sliderMax, setSliderMax] = useState(() => filters.maxPrice != null ? Math.round(filters.maxPrice / 1_000_000) : 100)

  useEffect(() => {
    setSliderMin(filters.minPrice != null ? Math.round(filters.minPrice / 1_000_000) : 0)
    setSliderMax(filters.maxPrice != null ? Math.round(filters.maxPrice / 1_000_000) : 100)
  }, [filters.minPrice, filters.maxPrice])

  const handleMinSlider = (val) => {
    const nextMin = Math.min(val, sliderMax - 1)
    setSliderMin(nextMin)
    setMinPriceText(nextMin === 0 ? '' : String(nextMin))
  }

  const handleMaxSlider = (val) => {
    const nextMax = Math.max(val, sliderMin + 1)
    setSliderMax(nextMax)
    setMaxPriceText(nextMax === 100 ? '' : String(nextMax))
  }

  const commitSliderChange = () => {
    onChange({
      minPrice: sliderMin === 0 ? undefined : sliderMin * 1_000_000,
      maxPrice: sliderMax === 100 ? undefined : sliderMax * 1_000_000,
    })
  }

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

  const phoneExtraCount = (activeOs !== 'all' ? 1 : 0) + (activeScreenBucket !== 'all' ? 1 : 0) + (activeBatteryBucket !== 'all' ? 1 : 0)
    + (activeChipset !== 'all' ? 1 : 0) + (activeSim !== 'all' ? 1 : 0) + (filters.nfcSupported ? 1 : 0)
  const laptopExtraCount = (filters.cpuKeyword ? 1 : 0) + (filters.gpuKeyword ? 1 : 0) + (activeOs !== 'all' ? 1 : 0)
  const monitorExtraCount = (activeRefreshBucket !== 'all' ? 1 : 0) + (filters.panelType ? 1 : 0)
  const headphonesExtraCount = (filters.isWireless != null ? 1 : 0) + (filters.hasNoiseCancelling ? 1 : 0)
  const smartwatchExtraCount = (filters.hasGps ? 1 : 0) + (filters.isWaterResistant ? 1 : 0)
  const otherCount = (filters.onlyAvailable ? 1 : 0) + (filters.onPromotion ? 1 : 0)

  const activeCount = selectedBrands.length + selectedRam.length + selectedStorage.length + selectedColors.length
    + selectedCategories.length + (priceActive ? 1 : 0) + (filters.keyword ? 1 : 0)
    + phoneExtraCount + laptopExtraCount + monitorExtraCount + headphonesExtraCount + smartwatchExtraCount + otherCount

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
  const resetCategoryScopedFilters = () => onChange({
    operatingSystem: undefined, chipset: undefined, simType: undefined,
    nfcSupported: undefined, minScreenSize: undefined, maxScreenSize: undefined,
    minBatteryCapacity: undefined, maxBatteryCapacity: undefined,
    cpuKeyword: undefined, gpuKeyword: undefined, panelType: undefined,
    minRefreshRate: undefined, maxRefreshRate: undefined,
    isWireless: undefined, hasNoiseCancelling: undefined,
    hasGps: undefined, isWaterResistant: undefined,
  })

  // Danh sách chip hiển thị MỌI tiêu chí đang chọn, mỗi chip bấm vào để xoá riêng tiêu chí đó.
  const activeChips = []
  selectedCategories.forEach(c => activeChips.push({ label: c, clear: () => toggleList('categoryNames', c) }))
  selectedBrands.forEach(b => activeChips.push({ label: b, clear: () => toggleList('brandNames', b) }))
  if (filters.keyword) activeChips.push({ label: `"${filters.keyword}"`, clear: () => onChange({ keyword: '' }) })
  if (priceActive) {
    const presetLabel = PRICE_PRESETS.find(p => p.value === activePricePreset && p.value !== '')?.label
    activeChips.push({ label: presetLabel ?? 'Khoảng giá tuỳ chỉnh', clear: () => onChange({ minPrice: undefined, maxPrice: undefined }) })
  }
  selectedRam.forEach(r => activeChips.push({ label: `RAM ${r}GB`, clear: () => toggleList('ramGb', r) }))
  selectedStorage.forEach(s => activeChips.push({ label: s >= 1000 ? `${s / 1000}TB` : `${s}GB`, clear: () => toggleList('storageGb', s) }))
  selectedColors.forEach(c => activeChips.push({ label: c, clear: () => toggleList('colors', c) }))
  if (activeOs !== 'all') activeChips.push({ label: activeOs === 'ios' ? 'iOS' : activeOs === 'android' ? 'Android' : activeOs === 'windows' ? 'Windows' : activeOs === 'macos' ? 'macOS' : activeOs === 'linux' ? 'Linux' : activeOs, clear: () => onChange({ operatingSystem: undefined }) })
  if (activeScreenBucket !== 'all') activeChips.push({ label: SCREEN_BUCKETS.find(b => b.value === activeScreenBucket)?.label, clear: () => onChange({ minScreenSize: undefined, maxScreenSize: undefined }) })
  if (activeBatteryBucket !== 'all') activeChips.push({ label: BATTERY_BUCKETS.find(b => b.value === activeBatteryBucket)?.label, clear: () => onChange({ minBatteryCapacity: undefined, maxBatteryCapacity: undefined }) })
  if (activeChipset !== 'all') activeChips.push({ label: CHIPSET_OPTIONS.find(o => o.value === activeChipset)?.label, clear: () => onChange({ chipset: undefined }) })
  if (activeSim !== 'all') activeChips.push({ label: SIM_OPTIONS.find(o => o.value === activeSim)?.label, clear: () => onChange({ simType: undefined }) })
  if (filters.nfcSupported) activeChips.push({ label: 'Hỗ trợ NFC', clear: () => onChange({ nfcSupported: undefined }) })
  if (filters.cpuKeyword) activeChips.push({ label: `CPU: ${filters.cpuKeyword}`, clear: () => onChange({ cpuKeyword: undefined }) })
  if (filters.gpuKeyword) activeChips.push({ label: `GPU: ${filters.gpuKeyword}`, clear: () => onChange({ gpuKeyword: undefined }) })
  if (activeRefreshBucket !== 'all') activeChips.push({ label: REFRESH_RATE_BUCKETS.find(b => b.value === activeRefreshBucket)?.label, clear: () => onChange({ minRefreshRate: undefined, maxRefreshRate: undefined }) })
  if (filters.panelType) activeChips.push({ label: filters.panelType, clear: () => onChange({ panelType: undefined }) })
  if (filters.isWireless === true) activeChips.push({ label: 'Không dây', clear: () => onChange({ isWireless: undefined }) })
  if (filters.isWireless === false) activeChips.push({ label: 'Có dây', clear: () => onChange({ isWireless: undefined }) })
  if (filters.hasNoiseCancelling) activeChips.push({ label: 'Chống ồn ANC', clear: () => onChange({ hasNoiseCancelling: undefined }) })
  if (filters.hasGps) activeChips.push({ label: 'Có GPS', clear: () => onChange({ hasGps: undefined }) })
  if (filters.isWaterResistant) activeChips.push({ label: 'Chống nước', clear: () => onChange({ isWaterResistant: undefined }) })
  if (filters.onlyAvailable) activeChips.push({ label: 'Chỉ hàng có sẵn', clear: () => onChange({ onlyAvailable: undefined }) })
  if (filters.onPromotion) activeChips.push({ label: 'Đang khuyến mãi', clear: () => onChange({ onPromotion: undefined }) })

  return (
    <div className="w-full mb-6">
      {/* Thanh lọc ngang */}
      <div className="flex items-center gap-2.5 flex-wrap p-3" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          <svg className="w-4 h-4" style={{ color: 'var(--t2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M10 12h4" />
          </svg>
          <span className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--t1)' }}>Bộ lọc</span>
        </div>

        {/* Tìm kiếm */}
        <div className="relative shrink-0">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input aria-label="Tìm sản phẩm..."
            type="text"
            placeholder="Tìm sản phẩm..."
            value={keywordText}
            onChange={e => setKeywordText(e.target.value)}
            className="w-40 sm:w-48 pl-8 pr-3 py-2 text-[12px] rounded-lg border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] transition-colors bg-[var(--s1)]"
          />
        </div>

        {categories.length > 0 && (
          <FilterDropdown label="Danh mục" count={selectedCategories.length}>
            <div className="space-y-2">
              {(() => {
                const catSet = new Set(selectedCategories)
                return categories.map(cat => {
                  const isCatSelected = catSet.has(cat.name)
                  return (
                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isCatSelected}
                        onChange={() => {
                          toggleList('categoryNames', cat.name)
                          if (isCatSelected) resetCategoryScopedFilters()
                        }}
                        className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
                      />
                      <span className="text-[12.5px] transition-colors" style={{ color: isCatSelected ? 'var(--t1)' : 'var(--t2)' }}>
                        {cat.name} <span className="text-[10.5px] text-slate-400 font-bold">({facetCounts.categories?.[cat.name] ?? 0})</span>
                      </span>
                    </label>
                  )
                })
              })()}
            </div>
          </FilterDropdown>
        )}

        {brands.length > 0 && (
          <FilterDropdown label="Thương hiệu" count={selectedBrands.length}>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {(() => {
                const brandSet = new Set(selectedBrands)
                return brands.map(brand => {
                  const isBrandSelected = brandSet.has(brand)
                  return (
                    <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isBrandSelected}
                        onChange={() => toggleList('brandNames', brand)}
                        className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
                      />
                      <span className="text-[12.5px] transition-colors" style={{ color: isBrandSelected ? 'var(--t1)' : 'var(--t2)' }}>
                        {brand} <span className="text-[10.5px] text-slate-400 font-bold">({facetCounts.brands?.[brand] ?? 0})</span>
                      </span>
                    </label>
                  )
                })
              })()}
            </div>
          </FilterDropdown>
        )}

        <FilterDropdown label="Mức giá" count={priceActive ? 1 : 0} panelClassName="min-w-[280px]">
          <div className="space-y-4">
            <div>
              <FilterGroupLabel>Khoảng giá nhanh</FilterGroupLabel>
              <RadioGroup name="price" value={activePricePreset} onChange={selectPricePreset} items={PRICE_PRESETS} />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <FilterGroupLabel>Khoảng giá tự chọn</FilterGroupLabel>

              <style>{`
                .dual-range-input::-webkit-slider-thumb {
                  pointer-events: auto;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #FFFFFF;
                  border: 2.5px solid var(--accent);
                  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                  cursor: pointer;
                  -webkit-appearance: none;
                  transition: transform 0.1s;
                }
                .dual-range-input::-webkit-slider-thumb:hover {
                  transform: scale(1.15);
                }
                .dual-range-input::-webkit-slider-thumb:active {
                  background: var(--accent);
                  transform: scale(1.2);
                }
                .dual-range-input::-moz-range-thumb {
                  pointer-events: auto;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #FFFFFF;
                  border: 2.5px solid var(--accent);
                  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                  cursor: pointer;
                  transition: transform 0.1s;
                }
                .dual-range-input::-moz-range-thumb:hover {
                  transform: scale(1.15);
                }
                .dual-range-input::-moz-range-thumb:active {
                  background: var(--accent);
                  transform: scale(1.2);
                }
              `}</style>

              <div className="px-1 py-1">
                {/* Track lines */}
                <div className="relative w-full h-5 flex items-center mb-2">
                  <div className="absolute left-0 right-0 h-1 bg-slate-200 rounded-full pointer-events-none" />
                  <div
                    className="absolute h-1 rounded-full pointer-events-none"
                    style={{
                      left: `${sliderMin}%`,
                      right: `${100 - sliderMax}%`,
                      backgroundColor: 'var(--accent)',
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderMin}
                    onChange={(e) => handleMinSlider(Number(e.target.value))}
                    onMouseUp={commitSliderChange}
                    onTouchEnd={commitSliderChange}
                    className="dual-range-input absolute w-full h-0 pointer-events-none appearance-none outline-none"
                    style={{ WebkitAppearance: 'none', background: 'none', zIndex: sliderMin > 50 ? 25 : 15 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderMax}
                    onChange={(e) => handleMaxSlider(Number(e.target.value))}
                    onMouseUp={commitSliderChange}
                    onTouchEnd={commitSliderChange}
                    className="dual-range-input absolute w-full h-0 pointer-events-none appearance-none outline-none"
                    style={{ WebkitAppearance: 'none', background: 'none', zIndex: sliderMin > 50 ? 15 : 25 }}
                  />
                </div>

                {/* Slider values */}
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-3">
                  <span>{sliderMin} triệu</span>
                  <span>{sliderMax === 100 ? '100+ triệu' : `${sliderMax} triệu`}</span>
                </div>

                {/* Text boxes */}
                <div className="flex items-center gap-1.5">
                  <input aria-label="Từ (triệu)"
                    type="text"
                    inputMode="decimal"
                    placeholder="Từ (triệu)"
                    value={minPriceText}
                    onChange={e => setMinPriceText(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] font-semibold rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)] text-center"
                  />
                  <span className="text-[11px] shrink-0" style={{ color: 'var(--t3)' }}>–</span>
                  <input aria-label="Đến (triệu)"
                    type="text"
                    inputMode="decimal"
                    placeholder="Đến (triệu)"
                    value={maxPriceText}
                    onChange={e => setMaxPriceText(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] font-semibold rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)] text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </FilterDropdown>

        {(isPhoneScope || isLaptopScope) && (
          <FilterDropdown label="RAM / Bộ nhớ" count={selectedRam.length + selectedStorage.length}>
            <FilterGroupLabel>RAM</FilterGroupLabel>
            <CheckGroup items={RAM_OPTIONS} selected={selectedRam} onToggle={v => toggleList('ramGb', v)} counts={facetCounts.ram} />
            <FilterGroupLabel>Bộ nhớ trong</FilterGroupLabel>
            <CheckGroup items={STORAGE_OPTIONS} selected={selectedStorage} onToggle={v => toggleList('storageGb', v)} counts={facetCounts.storage} />
          </FilterDropdown>
        )}

        <FilterDropdown label="Màu sắc" count={selectedColors.length}>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(({ value, hex }) => (
              <button aria-label="Thao tác" type="button"
                key={value}
                onClick={() => toggleList('colors', value)}
                title={`${value} (${facetCounts.colors?.[value] ?? 0})`}
                className="w-6 h-6 transition-transform cursor-pointer rounded-full border-none"
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
              {selectedColors.map(c => `${c} (${facetCounts.colors?.[c] ?? 0})`).join(', ')}
            </p>
          )}
        </FilterDropdown>

        {isPhoneScope && (
          <FilterDropdown label="Bộ lọc điện thoại" count={phoneExtraCount}>
            <FilterGroupLabel>Hệ điều hành</FilterGroupLabel>
            <RadioGroup name="os" value={activeOs} onChange={v => onChange({ operatingSystem: v === 'all' ? undefined : v })} items={[{ value: 'all', label: 'Tất cả' }, { value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]} />
            <FilterGroupLabel>Kích thước màn hình</FilterGroupLabel>
            <RadioGroup name="screen" value={activeScreenBucket} onChange={selectScreenBucket} items={SCREEN_BUCKETS} />
            <FilterGroupLabel>Dung lượng pin</FilterGroupLabel>
            <RadioGroup name="battery" value={activeBatteryBucket} onChange={selectBatteryBucket} items={BATTERY_BUCKETS} />
            <FilterGroupLabel>Chipset</FilterGroupLabel>
            <RadioGroup name="chipset" value={activeChipset} onChange={v => onChange({ chipset: v === 'all' ? undefined : v })} items={CHIPSET_OPTIONS} />
            <FilterGroupLabel>Loại SIM</FilterGroupLabel>
            <RadioGroup name="sim" value={activeSim} onChange={v => onChange({ simType: v === 'all' ? undefined : v })} items={SIM_OPTIONS} />
            <FilterGroupLabel>Tính năng đặc biệt</FilterGroupLabel>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={!!filters.nfcSupported} onChange={() => onChange({ nfcSupported: !filters.nfcSupported || undefined })} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
              <span className="text-[12.5px]" style={{ color: filters.nfcSupported ? 'var(--t1)' : 'var(--t2)' }}>Hỗ trợ NFC</span>
            </label>
          </FilterDropdown>
        )}

        {isLaptopScope && (
          <FilterDropdown label="Bộ lọc laptop" count={laptopExtraCount}>
            <FilterGroupLabel>CPU / Bộ xử lý</FilterGroupLabel>
            <input aria-label="VD: Core i7, Ryzen 5..."
              type="text"
              placeholder="VD: Core i7, Ryzen 5..."
              value={cpuText}
              onChange={e => setCpuText(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
            />
            <FilterGroupLabel>GPU / Card đồ họa</FilterGroupLabel>
            <input aria-label="VD: RTX 4060, Iris Xe..."
              type="text"
              placeholder="VD: RTX 4060, Iris Xe..."
              value={gpuText}
              onChange={e => setGpuText(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
            />
            <FilterGroupLabel>Hệ điều hành</FilterGroupLabel>
            <RadioGroup name="laptop-os" value={activeOs} onChange={v => onChange({ operatingSystem: v === 'all' ? undefined : v })} items={[{ value: 'all', label: 'Tất cả' }, { value: 'windows', label: 'Windows' }, { value: 'macos', label: 'macOS' }, { value: 'linux', label: 'Linux' }]} />
          </FilterDropdown>
        )}

        {isMonitorScope && (
          <FilterDropdown label="Bộ lọc màn hình" count={monitorExtraCount}>
            <FilterGroupLabel>Tần số quét</FilterGroupLabel>
            <RadioGroup name="refresh" value={activeRefreshBucket} onChange={selectRefreshBucket} items={REFRESH_RATE_BUCKETS} />
            <FilterGroupLabel>Tấm nền (Panel)</FilterGroupLabel>
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
          </FilterDropdown>
        )}

        {isHeadphonesScope && (
          <FilterDropdown label="Kết nối & Tính năng" count={headphonesExtraCount}>
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
          </FilterDropdown>
        )}

        {isSmartwatchScope && (
          <FilterDropdown label="Tính năng" count={smartwatchExtraCount}>
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
          </FilterDropdown>
        )}

        <FilterDropdown label="Khác" count={otherCount}>
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
        </FilterDropdown>

        {activeCount > 0 && (
          <button aria-label="Thao tác" type="button"
            onClick={onReset}
            className="ml-auto flex items-center gap-1 text-[12px] font-bold transition-colors cursor-pointer border-none bg-transparent shrink-0"
            style={{ color: 'var(--t3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >
            Xoá tất cả ({activeCount})
          </button>
        )}
      </div>

      {/* Chip hiển thị các tiêu chí đang được chọn */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {activeChips.map((chip) => (
            <button aria-label="Quay lại" type="button"
              key={chip.label}
              onClick={chip.clear}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border-none transition-colors"
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
    </div>
  )
}
