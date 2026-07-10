import React from 'react'

export default function Pagination({ current, total }) {
  const pages = Array.from({ length: Math.min(total, 3) }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        className="w-10 h-10 flex items-center justify-center transition-all cursor-pointer hover:border-slate-400 hover:text-slate-950 bg-transparent"
        style={{ border: '1px solid var(--b1)', borderRadius: '10px', color: 'var(--t3)', backgroundColor: 'var(--card)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map(p => (
        <button
          key={p}
          className="w-10 h-10 flex items-center justify-center text-[13px] font-black transition-all cursor-pointer border-none"
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
        className="w-10 h-10 flex items-center justify-center transition-all cursor-pointer hover:border-slate-400 hover:text-slate-950 bg-transparent"
        style={{ border: '1px solid var(--b1)', borderRadius: '10px', color: 'var(--t3)', backgroundColor: 'var(--card)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
