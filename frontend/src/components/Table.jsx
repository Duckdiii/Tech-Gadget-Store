
export default function Table({
  headers = [],
  children,
  className = '',
  gridTemplateColumns = '', // e.g. 'grid-cols-4' or specific styles
}) {
  return (
    <div className={`w-full bg-white rounded border border-gray-200 overflow-hidden ${className}`}>
      {/* Table header */}
      <div
        className={`grid gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50 items-center`}
        style={gridTemplateColumns ? { gridTemplateColumns } : undefined}
      >
        {headers.map((h, i) => (
          <span key={i} className="text-xs font-bold text-gray-400 tracking-wider uppercase truncate">
            {h}
          </span>
        ))}
      </div>

      {/* Table body */}
      <div className="divide-y divide-gray-100">
        {children}
      </div>
    </div>
  )
}
