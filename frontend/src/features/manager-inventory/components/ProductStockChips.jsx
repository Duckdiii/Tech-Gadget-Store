const CHIPS = [
  { key: null,          label: 'Tất cả',              active: 'bg-gray-800 text-white border-gray-800',       idle: 'bg-white text-gray-600 border-gray-200 hover:border-gray-400' },
  { key: 'inStock',     label: '🟢 Có hàng',          active: 'bg-emerald-600 text-white border-emerald-600',  idle: 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400' },
  { key: 'outOfStock',  label: '🔴 Hết hàng',         active: 'bg-red-600 text-white border-red-600',         idle: 'bg-white text-red-700 border-red-200 hover:border-red-400' },
  { key: 'noVariants',  label: '🟡 Chưa có phiên bản',active: 'bg-amber-500 text-white border-amber-500',     idle: 'bg-white text-amber-700 border-amber-200 hover:border-amber-400' },
]

export default function ProductStockChips({ activeKpi, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CHIPS.map(chip => {
        const isActive = activeKpi === chip.key
        return (
          <button aria-label="Thao tác" key={chip.label}
            type="button"
            onClick={() => onSelect(chip.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
              isActive ? chip.active : chip.idle
            }`}
          >
            {chip.label}
            {isActive && chip.key !== null && (
              <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
