import { useState, useEffect, useRef } from 'react'

const CW = 700, CH = 180, CPAD_B = 36
const CHART_TOP_Y = 8
const GRID_YS = [CH * 0.25 + CHART_TOP_Y, CH * 0.5 + CHART_TOP_Y, CH * 0.75 + CHART_TOP_Y]

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

const EMPTY_DATA = []

/** data: [{ label, revenue }] — real revenue-report trend points from the backend. */
export default function RevenueChart({ data = EMPTY_DATA, metric = 'revenue' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [pathLength, setPathLength] = useState(0)
  const pathRef = useRef(null)

  useEffect(() => {
    if (pathRef.current) {
      try {
        setPathLength(pathRef.current.getTotalLength())
      } catch (err) {
        console.error('Failed to measure SVG path length:', err)
      }
    }
  }, [data, metric])

  if (data.length === 0) {
    return (
      <div className="w-full h-[180px] flex items-center justify-center text-sm text-gray-400">
        Không có dữ liệu trong khoảng thời gian này
      </div>
    )
  }

  const isRevenue = metric === 'revenue'
  const values = data.map((d) => Number(isRevenue ? d.revenue : (d.orderCount || 0)) || 0)
  const maxValue = Math.max(...values, 0)

  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * CW : CW / 2,
    y: CHART_TOP_Y + CH * (1 - (maxValue > 0 ? values[i] / maxValue : 0)),
    label: formatLabel(d.label),
    value: values[i],
  }))

  const linePath = pts.length > 1 ? catmullPath(pts) : `M 0 ${pts[0].y.toFixed(1)} L ${CW} ${pts[0].y.toFixed(1)}`
  const areaPath = `${linePath} L ${CW} ${CH + CHART_TOP_Y} L 0 ${CH + CHART_TOP_Y} Z`
  const gridYs = GRID_YS

  // Thin out x-axis labels when there are many points (e.g. one per day for a month) to avoid overlap.
  const labelStep = Math.max(1, Math.ceil(pts.length / 12))

  const handleMouseMove = (e) => {
    if (!pts.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    // convert browser pixel coordinate to SVG standard coordinate CW
    const svgX = (x / rect.width) * CW

    let closestIdx = 0
    let minDiff = Math.abs(pts[0].x - svgX)
    for (let i = 1; i < pts.length; i++) {
      const diff = Math.abs(pts[i].x - svgX)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    }
    setHoveredIndex(closestIdx)
  }

  const activePt = hoveredIndex !== null ? pts[hoveredIndex] : null

  return (
    <div className="relative w-full" onMouseLeave={() => setHoveredIndex(null)}>
      <style>{`
        .chart-line-draw {
          stroke-dasharray: ${pathLength || 1000};
          stroke-dashoffset: ${pathLength || 1000};
          animation: drawChartLine 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .chart-fade-in {
          opacity: 0;
          animation: fadeChartIn 0.8s ease-out 0.8s forwards;
        }
        @keyframes drawChartLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeChartIn {
          to {
            opacity: 1;
          }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${CW} ${CH + CPAD_B}`}
        className="w-full h-auto overflow-visible select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8420A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E8420A" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {gridYs.map((y, i) => (
          <line key={y?.id ?? y?.code ?? y?.name ?? i} x1="0" y1={y} x2={CW} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
        ))}

        {/* Shaded Area Under Spline - Fades In */}
        <path d={areaPath} fill="url(#dashGrad)" className="chart-fade-in" />

        {/* Spline Curve Line - Draws In */}
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke="#E8420A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="chart-line-draw"
        />

        {/* Hover Guideline */}
        {activePt && (
          <line
            x1={activePt.x}
            y1={CHART_TOP_Y}
            x2={activePt.x}
            y2={CH + CHART_TOP_Y}
            stroke="#E8420A"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="pointer-events-none animate-fade-in"
          />
        )}

        {/* Data Circles - Fade In */}
        <g className="chart-fade-in">
          {pts.map((pt, i) => {
            const isActive = hoveredIndex === i
            return (
              <g key={pt?.id ?? pt?.code ?? pt?.name ?? i} className="transition-colors duration-150">
                {/* Outermost shadow ring on hover */}
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill="#E8420A"
                    fillOpacity="0.15"
                    className="pointer-events-none"
                  />
                )}
                {/* Secondary ring on hover or default circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 6 : 4.5}
                  fill="#E8420A"
                  className="transition-colors duration-150 pointer-events-none"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 3 : 2}
                  fill="white"
                  className="transition-colors duration-150 pointer-events-none"
                />
              </g>
            )
          })}
        </g>

        {/* X-axis Labels */}
        {pts.map((pt, i) => (i % labelStep === 0) && (
          <text
            key={pt?.id ?? pt?.code ?? pt?.name ?? pt?.key ?? pt?.val ?? pt}
            x={pt.x}
            y={CH + CPAD_B - 4}
            textAnchor="middle"
            fontSize="11"
            fill="#9ca3af"
            fontFamily="system-ui,sans-serif"
            className="pointer-events-none"
          >
            {pt.label}
          </text>
        ))}
      </svg>

      {/* Floating HTML Custom Tooltip */}
      {activePt && (
        <div
          className="absolute bg-slate-900/95 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none transition-colors duration-100 flex flex-col gap-0.5 z-30 min-w-[140px]"
          style={{
            left: `${(activePt.x / CW) * 100}%`,
            top: `${(activePt.y / (CH + CPAD_B)) * 100}%`,
            transform: 'translate(-50%, -125%)',
          }}
        >
          {/* Small triangular pointer under the tooltip */}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
          
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Thời gian: {activePt.label}
          </div>
          <div className="text-xs font-semibold text-slate-200">
            {isRevenue ? 'Doanh thu' : 'Số đơn hàng'}
          </div>
          <div className="text-sm font-bold text-[#FF7A45] font-mono">
            {isRevenue ? `${activePt.value.toLocaleString('vi-VN')} đ` : `${activePt.value.toLocaleString('vi-VN')} đơn`}
          </div>
        </div>
      )}
    </div>
  )
}
