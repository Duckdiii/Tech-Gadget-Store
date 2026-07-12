import QuantityControl from './QuantityControl'

function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

export default function CartItem({ item, onToggleItem, onToggleBundle, onQtyChange, onRemove }) {
  const bundleFee = item.bundles.filter(b => b.checked).reduce((s, b) => s + b.price, 0)
  const lineTotal = (item.price + bundleFee) * item.qty
  const lineSavings = item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0

  return (
    <div
      className={`overflow-hidden transition-opacity duration-200 ${!item.checked ? 'opacity-65' : ''}`}
      style={{
        backgroundColor: 'var(--card)',
        borderTop: '1px solid var(--b1)',
        borderRight: '1px solid var(--b1)',
        borderBottom: '1px solid var(--b1)',
        borderLeft: item.checked ? '4.5px solid var(--accent)' : '1px solid var(--b1)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
      }}
    >
      {/* Main row */}
      <div className="flex gap-4 p-5">
        <div className="flex items-center shrink-0">
          <input type="checkbox" checked={item.checked} onChange={() => onToggleItem(item.id)} className="w-5 h-5 cursor-pointer accent-[var(--accent)]" />
        </div>
        <div className="w-28 h-24 shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '10px' }}>
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{item.brand}</span>
              <h3 className="text-[15px] font-bold leading-snug mt-0.5" style={{ color: 'var(--t1)' }}>{item.name}</h3>
              <p className="text-[12.5px] mt-1" style={{ color: 'var(--t3)' }}>{item.variant}</p>
            </div>
            <button onClick={() => onRemove(item.id)}
              className="shrink-0 w-8 h-8 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--err)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderRadius = '8px' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(item.price)}</span>
                {item.originalPrice && <span className="text-xs line-through" style={{ color: 'var(--t3)' }}>{fmt(item.originalPrice)}</span>}
              </div>
              {lineSavings > 0 && <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--ok)' }}>Tiết kiệm {fmt(lineSavings)}</p>}
            </div>
            <QuantityControl qty={item.qty} onIncrease={() => onQtyChange(item.id, item.qty + 1)} onDecrease={() => item.qty > 1 && onQtyChange(item.id, item.qty - 1)} />
          </div>
        </div>
      </div>

      {/* Bundles */}
      {item.bundles && item.bundles.length > 0 && (
        <div style={{ borderTop: '1px solid var(--b1)' }}>
          <div className="px-5 py-2 flex items-center gap-1.5" style={{ backgroundColor: 'var(--s1)' }}>
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Dịch vụ kèm theo mua kèm</span>
          </div>
          {item.bundles.map(bundle => (
            <label key={bundle.id}
              className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer transition-colors"
              style={{ borderTop: '1px solid var(--b1)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--s1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={bundle.checked} onChange={() => onToggleBundle(item.id, bundle.id)} className="w-4 h-4 cursor-pointer shrink-0 accent-[var(--accent)]" />
                <span className="text-[12.5px] font-medium" style={{ color: bundle.checked ? 'var(--t1)' : 'var(--t3)' }}>{bundle.label}</span>
              </div>
              <span className="text-[12.5px] font-bold shrink-0" style={{ color: bundle.checked ? 'var(--accent)' : 'var(--t3)' }}>+{fmt(bundle.price)}</span>
            </label>
          ))}
        </div>
      )}

      {/* Line total */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid var(--b1)', backgroundColor: 'var(--s1)' }}>
        <span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>Thành tiền ({item.qty} sp{bundleFee > 0 ? ' + dịch vụ' : ''})</span>
        <span className="text-[15px] font-extrabold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(lineTotal)}</span>
      </div>
    </div>
  )
}
