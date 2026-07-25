function getPageWindow(page, totalPages, size = 5) {
  const windowStart = Math.max(0, Math.min(page - 2, totalPages - size))
  const windowEnd = Math.min(totalPages, windowStart + size)
  const pages = []
  for (let p = Math.max(0, windowStart); p < windowEnd; p++) pages.push(p)
  return pages
}

export default function Pagination({ page, totalPages, onPageChange, variant = 'icon' }) {
  const pageButtons = getPageWindow(page, totalPages)

  if (variant === 'text') {
    return (
      <div className="flex items-center gap-1">
        <button type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >‹</button>

        {pageButtons.map((p) => (
          <button type="button"
            key={`elem_${p}`}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent ${
              page === p ? 'bg-[#E8420A] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >{p + 1}</button>
        ))}

        <button type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="w-8 h-8 rounded text-sm font-medium cursor-pointer border-none bg-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >›</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button type="button"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        aria-label="Trang trước"
        className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pageButtons.map((p) => (
        <button type="button"
          key={`elem_${p}`}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium cursor-pointer transition-colors ${
            page === p ? 'bg-[#E8420A] text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button type="button"
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        aria-label="Trang sau"
        className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
