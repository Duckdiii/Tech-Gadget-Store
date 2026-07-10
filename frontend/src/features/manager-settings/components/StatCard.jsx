import React from 'react'

export default function StatCard({ icon, label, value, sub, color }) {
  const clr = {
    blue:   ['bg-orange-50',  'bg-[#E8420A]',   'text-[#C4350A]'],
    green:  ['bg-green-50', 'bg-green-500',  'text-green-700'],
    purple: ['bg-purple-50','bg-purple-500', 'text-purple-700'],
    amber:  ['bg-amber-50', 'bg-amber-500',  'text-amber-700'],
  }[color] || ['bg-gray-50', 'bg-gray-500', 'text-gray-700']
  
  return (
    <div className={`${clr[0]} rounded p-5 flex items-center gap-4 text-gray-800`}>
      <div className={`w-11 h-11 ${clr[1]} rounded flex items-center justify-center text-white shrink-0`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-xl font-bold ${clr[2]}`}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
