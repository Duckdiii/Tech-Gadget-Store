export default function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        <span className="block mb-1.5">{label}</span>
        <span className="block font-normal text-sm text-gray-700">{children}</span>
      </label>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
