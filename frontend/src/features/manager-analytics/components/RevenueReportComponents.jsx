
import { useState } from 'react'

/* ── Donut Chart Constants & Helpers ── */
const DONUT_CX = 90, DONUT_CY = 90, R_OUT = 74, R_IN = 52

function segPath(start, end) {
  const x1o = DONUT_CX + R_OUT * Math.cos(start)
  const y1o = DONUT_CY + R_OUT * Math.sin(start)
  const x2o = DONUT_CX + R_OUT * Math.cos(end)
  const y2o = DONUT_CY + R_OUT * Math.sin(end)
  const x1i = DONUT_CX + R_IN * Math.cos(start)
  const y1i = DONUT_CY + R_IN * Math.sin(start)
  const x2i = DONUT_CX + R_IN * Math.cos(end)
  const y2i = DONUT_CY + R_IN * Math.sin(end)
  const large = (end - start) > Math.PI ? 1 : 0
  return [
    `M ${x1o.toFixed(2)} ${y1o.toFixed(2)}`,
    `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${x2o.toFixed(2)} ${y2o.toFixed(2)}`,
    `L ${x2i.toFixed(2)} ${y2i.toFixed(2)}`,
    `A ${R_IN} ${R_IN} 0 ${large} 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)}`,
    'Z',
  ].join(' ')
}

export function DonutChart({ segments }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const paths = segments.reduce((acc, seg) => {
    const startAngle = acc.length ? acc[acc.length - 1].endAngle : -Math.PI / 2
    const endAngle = startAngle + (seg.pct || 0) * 2 * Math.PI
    const d = segPath(startAngle, endAngle - 0.01)
    return [...acc, { ...seg, d, endAngle }]
  }, [])

  const majorSeg = segments[0] || { label: 'Trống', pct: 0 }
  const centerSeg = hoveredIndex !== null ? paths[hoveredIndex] : majorSeg

  return (
    <svg viewBox="0 0 180 180" width="170" height="170" className="mx-auto" onMouseLeave={() => setHoveredIndex(null)}>
      {paths.map((seg, i) => (
        <path
          key={i}
          d={seg.d}
          fill={seg.color}
          className="cursor-pointer"
          style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4, transition: 'opacity 150ms' }}
          onMouseEnter={() => setHoveredIndex(i)}
        />
      ))}
      <text x={DONUT_CX} y={DONUT_CY - 5} textAnchor="middle" fontSize="21" fontWeight="bold" fill="#111827" fontFamily="system-ui,sans-serif">{Math.round(centerSeg.pct * 100)}%</text>
      <text x={DONUT_CX} y={DONUT_CY + 16} textAnchor="middle" fontSize="10.5" fill="#6b7280" fontFamily="system-ui,sans-serif" className="truncate max-w-[100px]">{centerSeg.label}</text>
    </svg>
  )
}

/* ── Trend Badge Component ── */
export function TrendBadge({ trend, trendExtra, trendUp }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {trendUp ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      )}
      {trend}{trendExtra}
    </span>
  )
}
