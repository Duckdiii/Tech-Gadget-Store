
export default function StatCard({ icon, label, value, valueSuffix, valueClass='text-gray-900', suffixClass='text-gray-500 text-base font-normal', padding='px-4 py-4', onClick, active }) {
  const activeClass = active ? 'border-[#E8420A] ring-1 ring-[#E8420A]/50 bg-orange-50/20' : 'hover:border-gray-300 hover:shadow-sm'
  const cursorClass = onClick ? 'cursor-pointer transition-all' : ''
  return (
    <div 
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? label : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e) } : undefined}
      onClick={onClick}
      className={`bg-white rounded border border-gray-200 ${padding} flex-1 text-left ${activeClass} ${cursorClass}`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className={`text-2.5xl font-black leading-tight ${valueClass}`}>
        {value}
        {valueSuffix && <span className={`ml-1 ${suffixClass}`}>{valueSuffix}</span>}
      </p>
    </div>
  )
}
