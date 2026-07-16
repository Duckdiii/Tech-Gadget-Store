export default function Skeleton({ className = '', style }) {
  return <div className={`animate-pulse rounded ${className}`} style={{ backgroundColor: 'var(--s2)', ...style }} />
}
