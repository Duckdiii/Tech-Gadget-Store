
export default function StatCard({ icon, label, value, sub, color, action, onClick }) {
  const cls = {
    teal:  ['bg-teal-500',  'text-teal-600'  ],
    blue:  ['bg-[#E8420A]',  'text-[#E8420A]'  ],
    red:   ['bg-red-500',   'text-red-600'   ],
    amber: ['bg-amber-400', 'text-amber-600' ],
  }[color] || ['bg-gray-50', 'text-gray-500']

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded border border-gray-200 p-5 flex items-center gap-4 text-left ${action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <span className={`w-12 h-12 ${cls[0]} rounded flex items-center justify-center text-white shrink-0`}>{icon}</span>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold ${cls[1]}`}>{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
