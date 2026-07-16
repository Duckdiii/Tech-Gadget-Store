export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null

  // Generate page list: e.g., 1 ... 4 5 6 ... 10
  const getPages = () => {
    const pages = []
    const range = 1
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - range && i <= current + range)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…')
      }
    }
    return pages
  }

  const pages = getPages()

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Prev Button */}
      <button
        onClick={() => current > 1 && onChange(current - 1)}
        disabled={current === 1}
        className={`w-10 h-10 flex items-center justify-center transition-all rounded-[10px] border border-[var(--b1)] bg-[var(--card)] text-[var(--t3)] hover:border-slate-400 hover:text-slate-950 cursor-pointer ${
          current === 1 ? 'opacity-40 cursor-not-allowed hover:border-[var(--b1)] hover:text-[var(--t3)]' : ''
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Pages */}
      {pages.map((p, idx) => {
        if (p === '…') {
          return (
            <span key={`ell-${idx}`} className="w-10 h-10 flex items-center justify-center text-[13px] text-[var(--t3)] select-none">
              …
            </span>
          )
        }
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="w-10 h-10 flex items-center justify-center text-[13px] font-black transition-all cursor-pointer rounded-[10px]"
            style={p === current
              ? { background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }
              : { border: '1px solid var(--b1)', color: 'var(--t2)', backgroundColor: 'var(--card)' }
            }
          >
            {p}
          </button>
        )
      })}

      {/* Next Button */}
      <button
        onClick={() => current < total && onChange(current + 1)}
        disabled={current === total}
        className={`w-10 h-10 flex items-center justify-center transition-all rounded-[10px] border border-[var(--b1)] bg-[var(--card)] text-[var(--t3)] hover:border-slate-400 hover:text-slate-950 cursor-pointer ${
          current === total ? 'opacity-40 cursor-not-allowed hover:border-[var(--b1)] hover:text-[var(--t3)]' : ''
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
