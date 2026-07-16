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
      className="product-card group overflow-hidden flex flex-col cursor-pointer relative"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--b1)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s, box-shadow 0.25s',
      }}
    >
      {/* Image Container */}
      <div
        className="relative flex items-center justify-center h-52 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
          borderBottom: '1px solid var(--b1)',
        }}
      >
        {product.tag && (
          <span
            className="absolute top-3.5 left-3.5 z-10 text-[10px] font-extrabold px-3 py-1 text-white uppercase tracking-wider"
            style={{
              background: product.tag === 'Mới' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, var(--accent-h), var(--accent))',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {product.tag}
          </span>
        )}
        {product.discount && (
          <span
            className="absolute top-3.5 right-3.5 z-10 text-[10px] font-extrabold px-2.5 py-1 text-white"
            style={{
              background: 'linear-gradient(135deg, var(--accent-h), var(--accent))',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            -{product.discount}%
          </span>
        )}

        <button
          onClick={e => {
            e.stopPropagation()
            setWished(w => !w)
          }}
          aria-label={wished ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          aria-pressed={wished}
          title={wished ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          className="absolute bottom-3.5 right-3.5 z-10 w-8 h-8 flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: wished ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${wished ? 'rgba(239,68,68,0.25)' : 'var(--b1)'}`,
            borderRadius: '50%',
            color: wished ? '#ef4444' : 'var(--t3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transform: wished ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <svg className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {!product.available && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(241,245,249,0.8)' }}
          >
            <span
              className="text-xs font-bold px-3 py-1 text-white uppercase tracking-wider"
              style={{ backgroundColor: 'var(--t3)', borderRadius: '6px' }}
            >
              Hết hàng
            </span>
          </div>
        )}

        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="p-img h-36 w-36 object-contain transition-transform duration-300 group-hover:scale-110"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(15,23,42,0.08))' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5" style={{ color: 'var(--t3)' }}>
            <div
              className="w-16 h-16 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(234,88,12,0.08)', borderRadius: '14px' }}
            >
              <svg className="w-7 h-7" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 4h10a1 1 0 011 1v14a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10.5 17.5h3" />
              </svg>
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wide">Chưa có ảnh</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider shrink-0" style={{ color: 'var(--accent)' }}>
              {product.brand}
            </span>
            {product.category && (
              <>
                <span className="w-0.5 h-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--b2)' }} />
                <span className="text-[10px] font-semibold truncate" style={{ color: 'var(--t3)' }}>
                  {product.category}
                </span>
              </>
            )}
          </div>
          {product.available ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Còn hàng
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold shrink-0" style={{ color: 'var(--t3)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--b2)' }} />
              Hết hàng
            </span>
          )}
        </div>

        <h3
          className="text-[13.5px] font-bold leading-snug line-clamp-2 min-h-[2.5rem] transition-colors"
          style={{ color: 'var(--t1)' }}
        >
          {product.name}
        </h3>

        {(product.rating != null || (product.salesCount != null && product.salesCount > 0)) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.rating != null && (
              <>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => {
                    const fill = Math.max(0, Math.min(1, rating - i))
                    return (
                      <span key={i} className="relative w-3.5 h-3.5 inline-block">
                        <svg className="absolute inset-0 w-3.5 h-3.5" style={{ color: '#e2e8f0' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {fill > 0 && (
                          <svg className="absolute inset-0 w-3.5 h-3.5" style={{ color: '#F59E0B', clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </span>
                    )
                  })}
                </div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--t2)' }}>
                  {rating.toFixed(1)}
                </span>
                {product.reviews != null && (
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--t3)' }}>
                    ({product.reviews} đánh giá)
                  </span>
                )}
                {product.salesCount > 0 && <span className="text-[11px]" style={{ color: 'var(--t3)' }}>|</span>}
              </>
            )}
            {product.salesCount > 0 && (
              <span className="text-[11px] font-bold text-orange-500">
                Đã bán {product.salesCount}
              </span>
            )}
          </div>
        )}

        {(product.ram || product.storage || product.color) && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {product.ram && (
              <span className="text-[9.5px] font-bold px-2 py-0.5" style={{ backgroundColor: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--b1)', borderRadius: '4px' }}>
                RAM {product.ram}
              </span>
            )}
            {product.storage && (
              <span className="text-[9.5px] font-bold px-2 py-0.5" style={{ backgroundColor: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--b1)', borderRadius: '4px' }}>
                {product.storage}
              </span>
            )}
            {product.color && (
              <span className="flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 truncate max-w-[110px]" style={{ backgroundColor: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--b1)', borderRadius: '4px' }}>
                {swatch && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: swatch, border: '1px solid rgba(0,0,0,0.12)' }} />
                )}
                {product.color}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[18px] font-black leading-none" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[12px] leading-none line-through" style={{ color: 'var(--t3)' }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {!!savingsPct && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 leading-none" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--ok)', borderRadius: '4px' }}>
                -{savingsPct}%
              </span>
            )}
          </div>
          {!!savings && (
            <p className="text-[10px] font-bold" style={{ color: 'var(--ok)' }}>
              Tiết kiệm {formatPrice(savings)}
            </p>
          )}

          {product.available ? (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 text-[12.5px] font-extrabold py-2.5 text-white transition-all duration-200 cursor-pointer hover:shadow-lg"
              style={{
                background: adding ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, var(--accent-h), var(--accent))',
                borderRadius: '8px',
                border: 'none',
              }}
            >
              {adding ? (
                <>
                  <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã thêm!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Thêm vào giỏ
                </>
              )}
            </button>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-2 text-[12.5px] font-extrabold py-2.5 transition-colors cursor-pointer"
              style={{
                border: '1.5px solid var(--b1)',
                color: 'var(--t2)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Nhận thông báo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
