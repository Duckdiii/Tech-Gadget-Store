
export default function Avatar({ initials, bg, size='md', src, alt }) {
  const sz = {
    lg: 'w-14 h-14 text-lg',
    md: 'w-10 h-10 text-sm',
    sm: 'w-8 h-8 text-xs',
    xs: 'w-9 h-9 text-sm'
  }[size] || 'w-10 h-10 text-sm'

  if (src) {
    return <img src={src} alt={alt || 'avatar'} className={`${sz} rounded-full object-cover shrink-0`} />
  }

  return (
    <div className={`${sz} ${bg || 'bg-gray-400'} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {initials || '?'}
    </div>
  )
}
