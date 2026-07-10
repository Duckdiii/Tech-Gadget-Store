import React from 'react'

export default function FormLabel({ children, required }) {
  return (
    <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}
