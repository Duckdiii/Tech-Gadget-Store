
export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-1.5">
          {label} {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full border rounded px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8420A] focus:border-transparent ${
          error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
