
export default function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      ) : (
        <span className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</span>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
