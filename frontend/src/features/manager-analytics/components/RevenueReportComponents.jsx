
/* ── Area Chart Constants & Helpers ── */
const CW = 560, CH = 190, CPAD_B = 40

function catmullPath(pts) {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  const ext = [
    { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
    ...pts,
    { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x, y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y },
  ]
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = ext[i], p1 = ext[i + 1], p2 = ext[i + 2], p3 = ext[i + 3]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

export function AreaChart({ trend }) {
  const maxRevenue = Math.max(...trend.map(t => t.revenue || 0), 1)
  const pts = trend.map((d, i) => {
    const val = maxRevenue > 0 ? (d.revenue || 0) / maxRevenue : 0
    return {
      x: trend.length > 1 ? (i / (trend.length - 1)) * CW : CW / 2,
      y: 8 + CH * (1 - val),
      label: d.label,
    }
  })

  if (pts.length === 0) {
    return <p className="text-sm text-gray-400 py-10 text-center">Không có dữ liệu xu hướng</p>
  }

  const linePath = catmullPath(pts)
  const areaPath = trend.length > 1 ? `${linePath} L ${CW} ${CH + 8} L 0 ${CH + 8} Z` : ''
  const gridYs = [CH * 0.25 + 8, CH * 0.5 + 8, CH * 0.75 + 8]

  return (
    <svg viewBox={`0 0 ${CW} ${CH + CPAD_B}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#374151" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridYs.map((y, i) => (
        <line key={i} x1="0" y1={y} x2={CW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
      ))}

      {/* Area fill */}
      {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

      {/* Line */}
      <path d={linePath} fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Dots */}
      {pts.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="5.5" fill="#111827" />
          <circle cx={pt.x} cy={pt.y} r="2.5" fill="white" />
        </g>
      ))}

      {/* X-axis labels */}
      {pts.map((pt, i) => (
        <text key={i} x={pt.x} y={CH + CPAD_B - 6} textAnchor="middle" fontSize="13" fill="#9ca3af" fontFamily="system-ui,sans-serif">
          {pt.label}
        </text>
      ))}
    </svg>
  )
}

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
  const paths = segments.reduce((acc, seg) => {
    const startAngle = acc.length ? acc[acc.length - 1].endAngle : -Math.PI / 2
    const endAngle = startAngle + (seg.pct || 0) * 2 * Math.PI
    const d = segPath(startAngle, endAngle - 0.01)
    return [...acc, { ...seg, d, endAngle }]
  }, [])

  const majorSeg = segments[0] || { label: 'Trống', pct: 0 }

  return (
    <svg viewBox="0 0 180 180" width="170" height="170" className="mx-auto">
      {paths.map((seg, i) => (
        <path key={i} d={seg.d} fill={seg.color} />
      ))}
      <text x={DONUT_CX} y={DONUT_CY - 5} textAnchor="middle" fontSize="21" fontWeight="bold" fill="#111827" fontFamily="system-ui,sans-serif">{Math.round(majorSeg.pct * 100)}%</text>
      <text x={DONUT_CX} y={DONUT_CY + 16} textAnchor="middle" fontSize="10.5" fill="#6b7280" fontFamily="system-ui,sans-serif" className="truncate max-w-[100px]">{majorSeg.label}</text>
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
