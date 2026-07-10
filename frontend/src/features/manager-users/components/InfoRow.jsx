import React from 'react'

export default function InfoRow({ label, value, labelWidth='w-36' }) {
  return (
    <div className="flex items-start py-3 border-b border-gray-50 last:border-0 text-left">
      <span className={`${labelWidth} text-xs text-gray-400 font-medium shrink-0 pt-0.5`}>{label}</span>
      <span className="text-sm text-gray-700 font-medium break-all">{value || '—'}</span>
    </div>
  )
}
