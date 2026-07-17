
const CW = 700, CH = 180, CPAD_B = 36

function formatLabel(label) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, m, d] = label.split('-')
    return `${d}/${m}`
  }
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [, m] = label.split('-')
    return `T${Number(m)}`
  }
  return label // already "HH:00" (hourly trend)
}

function catmullPath(pts) {
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

/** data: [{ label, revenue }] — real revenue-report trend points from the backend. */
export default function RevenueChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-[180px] flex items-center justify-center text-sm text-gray-400">
        Không có dữ liệu doanh thu trong khoảng thời gian này
      </div>
    )
  }

  const revenues = data.map((d) => Number(d.revenue) || 0)
  const maxRevenue = Math.max(...revenues, 0)

  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * CW : CW / 2,
    y: 8 + CH * (1 - (maxRevenue > 0 ? revenues[i] / maxRevenue : 0)),
    label: formatLabel(d.label),
    revenue: revenues[i],
  }))

  const linePath = pts.length > 1 ? catmullPath(pts) : `M 0 ${pts[0].y.toFixed(1)} L ${CW} ${pts[0].y.toFixed(1)}`
  const areaPath = `${linePath} L ${CW} ${CH + 8} L 0 ${CH + 8} Z`
  const gridYs = [CH * 0.25 + 8, CH * 0.5 + 8, CH * 0.75 + 8]

  // Thin out x-axis labels when there are many points (e.g. one per day for a month) to avoid overlap.
  const labelStep = Math.max(1, Math.ceil(pts.length / 12))

  return (
    <svg viewBox={`0 0 ${CW} ${CH + CPAD_B}`} className="w-full h-auto">
      <defs>
        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8420A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E8420A" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {gridYs.map((y, i) => (
        <line key={i} x1="0" y1={y} x2={CW} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
      ))}

      <path d={areaPath} fill="url(#dashGrad)" />
      <path d={linePath} fill="none" stroke="#E8420A" strokeWidth="2.5" strokeLinejoin="round" />

      {pts.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="5" fill="#E8420A" />
          <circle cx={pt.x} cy={pt.y} r="2.5" fill="white" />
          <title>{`${pt.label}: ${pt.revenue.toLocaleString('vi-VN')} đ`}</title>
        </g>
      ))}

      {pts.map((pt, i) => (i % labelStep === 0) && (
        <text key={i} x={pt.x} y={CH + CPAD_B - 4} textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="system-ui,sans-serif">
          {pt.label}
        </text>
      ))}
    </svg>
  )
}
