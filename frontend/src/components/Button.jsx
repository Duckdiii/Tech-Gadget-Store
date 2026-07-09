import React from 'react'

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline'
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded text-sm transition-colors cursor-pointer focus:outline-none'
  
  const variants = {
    primary: 'bg-[#E8420A] hover:bg-[#C4350A] text-white font-semibold py-2 px-4',
    secondary: 'bg-[#0D0F14] hover:bg-[#1a1e26] text-white font-semibold py-2 px-4',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4',
  }

  const disabledStyles = 'opacity-50 cursor-not-allowed'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${disabled ? disabledStyles : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
