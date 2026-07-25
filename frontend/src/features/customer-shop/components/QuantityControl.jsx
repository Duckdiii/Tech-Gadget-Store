
export default function QuantityControl({ qty, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center" style={{ border: '1px solid var(--b1)', borderRadius: '8px', overflow: 'hidden' }}>
      <button aria-label="Giảm số lượng" type="button" onClick={onDecrease} className="w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border-none bg-transparent"
        style={{ backgroundColor: 'var(--s1)', color: 'var(--t2)', borderRight: '1px solid var(--b1)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--b1)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--s1)'}
      >−</button>
      <span className="w-11 h-9 flex items-center justify-center text-sm font-extrabold" style={{ backgroundColor: 'var(--card)', color: 'var(--t1)' }}>{qty}</span>
      <button aria-label="Tăng số lượng" type="button" onClick={onIncrease} className="w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border-none bg-transparent"
        style={{ backgroundColor: 'var(--s1)', color: 'var(--t2)', borderLeft: '1px solid var(--b1)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--b1)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--s1)'}
      >+</button>
    </div>
  )
}
