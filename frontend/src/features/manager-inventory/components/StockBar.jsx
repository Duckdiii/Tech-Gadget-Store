import React from 'react'

export default function StockBar({ stock, maxStock, barColor }) {
  const pct = maxStock > 0 ? Math.round((stock / maxStock) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{stock}/{maxStock}</span>
    </div>
  )
}
