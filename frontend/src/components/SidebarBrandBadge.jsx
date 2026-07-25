export default function SidebarBrandBadge({ badgeColorClass, title, subtitle, subtitleClassName = 'text-gray-500' }) {
  return (
    <div className="px-5 pt-5 pb-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded ${badgeColorClass} flex items-center justify-center shrink-0`}>
        <span className="text-white font-black text-sm tracking-tight">TS</span>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
        <p className={`text-xs ${subtitleClassName}`}>{subtitle}</p>
      </div>
    </div>
  )
}
