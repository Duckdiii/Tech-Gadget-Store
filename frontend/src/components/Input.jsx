
export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || props.name || (typeof label === 'string' ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined)

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-1.5">
          {label} {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-label={props['aria-label'] || (typeof label === 'string' ? label : undefined)}
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
