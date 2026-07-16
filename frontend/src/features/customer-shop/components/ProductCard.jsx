import { useState, useEffect } from 'react'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + ' đ'
}

const COLOR_SWATCHES = {
  'đỏ': '#EF4444', 'đen': '#18181B', 'trắng': '#F8FAFC', 'xám': '#94A3B8',
  'xanh': '#3B82F6', 'xanh dương': '#3B82F6', 'xanh lá': '#22C55E', 'xanh navy': '#1E3A8A',
  'vàng': '#EAB308', 'hồng': '#EC4899', 'tím': '#A855F7', 'cam': '#F97316', 'bạc': '#CBD5E1', 'vàng gold': '#D4AF37',
}

function colorSwatch(color) {
  if (!color) return null
  return COLOR_SWATCHES[color.trim().toLowerCase()] ?? null
}

export default function ProductCard({ product, onNavigate }) {
  const [wished, setWished] = useState(false)
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => { setImgError(false) }, [product.image])

  const handleAddToCart = (e) => {
    e.stopPropagation()
    setAdding(true)
    setTimeout(() => setAdding(false), 1200)
    onNavigate('cart')
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : null
  const savingsPct = savings && product.originalPrice ? Math.round((savings / product.originalPrice) * 100) : null
  const rating = product.rating ?? 0
  const swatch = colorSwatch(product.color)

  return (
    <div
      onClick={() => onNavigate('detail', { search: '?id=' + product.id })}
      className="product-card group overflow-hidden flex flex-col cursor-pointer relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] hover:border-orange-500/30"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--b1)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      {/* Image Container */}
      <div
        className="relative flex items-center justify-center h-40 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
          borderBottom: '1px solid var(--b1)',
        }}
      >
        <button
          onClick={e => {
            e.stopPropagation()
            setWished(w => !w)
          }}
          aria-label={wished ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          className="absolute top-3 right-3 z-10 w-7.5 h-7.5 flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: wished ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${wished ? 'rgba(239,68,68,0.25)' : 'var(--b1)'}`,
            borderRadius: '50%',
            color: wished ? '#ef4444' : 'var(--t3)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="p-img h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-110"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(15,23,42,0.08))' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1" style={{ color: 'var(--t3)' }}>
            <div
              className="w-12 h-12 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(234,88,12,0.06)', borderRadius: '12px' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 4h10a1 1 0 011 1v14a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10.5 17.5h3" />
              </svg>
            </div>
            <span className="text-[8.5px] font-bold uppercase tracking-wide">Chưa có ảnh</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[10px] leading-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider shrink-0" style={{ color: 'var(--accent)' }}>
              {product.brand}
            </span>
            {product.category && (
              <>
                <span className="w-0.5 h-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--b2)' }} />
                <span className="text-[9.5px] font-semibold truncate text-slate-500">
                  {product.category}
                </span>
              </>
            )}
          </div>
          {product.available ? (
            <span className="flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 shrink-0">
              <span className="w-1.2 h-1.2 rounded-full bg-emerald-500 animate-pulse" />
              Còn hàng
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[9.5px] font-bold text-rose-500 shrink-0">
              <span className="w-1.2 h-1.2 rounded-full bg-rose-500" />
              Hết hàng
            </span>
          )}
        </div>

        <h3
          className="text-[13px] font-bold leading-snug line-clamp-2 min-h-[2.3rem] transition-colors"
          style={{ color: 'var(--t1)' }}
        >
          {product.name}
        </h3>

        {(product.rating != null || (product.salesCount != null && product.salesCount > 0)) && (
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold leading-none" style={{ color: 'var(--t2)' }}>
            {product.rating != null && (
              <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating.toFixed(1)}</span>
                {product.reviews != null && (
                  <span className="font-normal" style={{ color: 'var(--t3)' }}>({product.reviews})</span>
                )}
              </div>
            )}
            {product.rating != null && product.salesCount > 0 && (
              <span className="text-gray-300">|</span>
            )}
            {product.salesCount > 0 && (
              <span className="text-orange-500 font-bold">
                Đã bán {product.salesCount}
              </span>
            )}
          </div>
        )}

        {/* Specs summary (RAM · Storage · Colors) */}
        {(() => {
          const specs = []
          if (product.ram) specs.push(`RAM ${product.ram}GB`)
          if (product.storage) specs.push(`${product.storage}GB`)
          if (product.color) specs.push(product.color)
          const specsText = specs.join(' · ')
          return specsText ? (
            <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5" title={specsText}>
              {specsText}
            </p>
          ) : null
        })()}

        {/* Price & CTA round button */}
        <div className="mt-auto pt-2 border-t border-[var(--b1)] flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            {product.originalPrice && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] leading-none line-through text-slate-400">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-[10px] font-black text-emerald-600">
                  -{savingsPct}%
                </span>
              </div>
            )}
            <span className="text-[16px] font-black leading-tight text-orange-600 font-['Be_Vietnam_Pro',sans-serif] truncate">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.available ? (
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 flex items-center justify-center text-white shrink-0 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              style={{
                background: adding ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, var(--accent-h), var(--accent))',
                borderRadius: '50%',
                border: 'none',
              }}
              title="Thêm vào giỏ hàng"
            >
              {adding ? (
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </button>
          ) : (
            <button
              className="w-9 h-9 flex items-center justify-center border text-slate-400 shrink-0 bg-transparent cursor-pointer"
              style={{
                borderColor: 'var(--b1)',
                borderRadius: '50%',
              }}
              title="Nhận thông báo khi có hàng"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
