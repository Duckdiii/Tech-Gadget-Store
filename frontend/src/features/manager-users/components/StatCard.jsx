
export default function StatCard({ icon, label, value, valueSuffix, valueClass='text-gray-900', suffixClass='text-gray-500 text-base font-normal', padding='px-4 py-4' }) {
  return (
    <div className={`bg-white rounded border border-gray-200 ${padding} flex-1 text-left`}>
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
