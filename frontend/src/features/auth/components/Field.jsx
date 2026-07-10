import React from 'react'

export default function Field({ label, error, children }) {// vd: "Email", error: "Email không hợp lệ", children: <input ... />
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>
          {label}
        </label>
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

export function getFieldCls(error) {
  return `field-dark w-full px-3.5 py-3 text-[13px]${error ? ' field-error' : ''}`
}
