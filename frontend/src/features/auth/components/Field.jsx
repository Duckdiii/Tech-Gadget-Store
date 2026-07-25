export default function Field({ label, error, children, htmlFor }) {
  return (
    <div className="mb-4">
      {label && (
        htmlFor ? (
          <label htmlFor={htmlFor} className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>
            {label}
          </label>
        ) : (
          <span className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>
            {label}
          </span>
        )
      )}
      {children}
      {error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--err)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
