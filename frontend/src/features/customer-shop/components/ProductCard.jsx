import { useState, useEffect } from 'react'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + ' đ'
}


export default function ProductCard({ product, onNavigate, viewMode = 'grid', isCompared = false, onToggleCompare, onQuickView, onNotifyBackInStock, isWished = false, onToggleWishlist }) {
  const [wished, setWished] = useState(isWished)
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setWished(isWished)
  }, [isWished])

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

  const isLowStock = product.availableCount > 0 && product.availableCount <= 3
  const isBestSeller = product.salesCount >= 10
  const isHotDeal = product.discountPercent && product.discountPercent >= 15

  const getSpecsList = () => {
    const specs = []
    if (product.cpu) specs.push({ label: 'CPU', value: product.cpu })
    if (product.gpu) specs.push({ label: 'Đồ họa', value: product.gpu })
    if (product.ram) specs.push({ label: 'RAM', value: product.ram })
    if (product.storage) specs.push({ label: 'Bộ nhớ', value: product.storage })
    if (product.screenSize) specs.push({ label: 'Màn hình', value: product.screenSize + '"' })
    if (product.resolution) specs.push({ label: 'Độ phân giải', value: product.resolution })
    if (product.chipset) specs.push({ label: 'Chipset', value: product.chipset })
    if (product.batteryCapacity) specs.push({ label: 'Pin', value: product.batteryCapacity + ' mAh' })
    if (product.operatingSystem) specs.push({ label: 'HĐH', value: product.operatingSystem })
    if (product.refreshRate) specs.push({ label: 'Tần số quét', value: product.refreshRate + 'Hz' })
    if (product.panelType) specs.push({ label: 'Tấm nền', value: product.panelType })
    if (product.isWireless !== null && product.isWireless !== undefined) {
      specs.push({ label: 'Kết nối', value: product.isWireless ? 'Không dây' : 'Có dây' })
    }
    if (product.hasNoiseCancelling) specs.push({ label: 'Chống ồn', value: 'ANC' })
    if (product.batteryLifeHours) specs.push({ label: 'Pin', value: product.batteryLifeHours + ' giờ' })
    if (product.batteryLifeDays) specs.push({ label: 'Pin', value: product.batteryLifeDays + ' ngày' })
    if (product.hasGps) specs.push({ label: 'Định vị', value: 'GPS' })
    if (product.isWaterResistant) specs.push({ label: 'Kháng nước', value: 'Có' })
    return specs
  }

  if (viewMode === 'list') {
    const specsList = getSpecsList()
    return (
      <div
        onClick={() => onNavigate('detail', { search: '?id=' + product.id })}
        className="product-card group overflow-hidden flex flex-row items-stretch cursor-pointer relative transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] hover:border-orange-500/30 h-44"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Left Column: Image */}
        <div
          className="relative flex items-center justify-center w-40 shrink-0 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
            borderRight: '1px solid var(--b1)',
          }}
        >
          {/* Urgency/Marketing Badge */}
          {(() => {
            if (isLowStock) {
              return (
                <div 
                  className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9.5px] font-black text-white flex items-center gap-1 shadow-sm transition-transform duration-200 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    borderRadius: '20px',
                  }}
                >
                  <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Chỉ còn {product.availableCount} sp
                </div>
              )
            }
            if (isHotDeal) {
              return (
                <div 
                  className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9.5px] font-black text-white flex items-center gap-1 shadow-sm transition-transform duration-200 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                    borderRadius: '20px',
                  }}
                >
                  <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Hot Deal
                </div>
              )
            }
            if (isBestSeller) {
              return (
                <div 
                  className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9.5px] font-black text-white flex items-center gap-1 shadow-sm transition-transform duration-200 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    borderRadius: '20px',
                  }}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Bán chạy
                </div>
              )
            }
            return null
          })()}

          <button
            onClick={e => {
              e.stopPropagation()
              const nextWished = !wished
              setWished(nextWished)
              if (onToggleWishlist) onToggleWishlist(product, nextWished)
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
              className="p-img h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-108"
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
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickView(product)
              }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 bg-white/95 backdrop-blur-sm text-slate-850 hover:text-orange-605 font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer whitespace-nowrap transform translate-y-2 group-hover:translate-y-0"
            >
              Xem nhanh
            </button>
          )}
        </div>

        {/* Middle Column: Details & specs */}
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2 justify-center">
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
            {onToggleCompare && (
              <label 
                onClick={e => e.stopPropagation()} 
                className="flex items-center gap-1 text-[9.5px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
              >
                <input 
                  type="checkbox" 
                  checked={isCompared}
                  onChange={() => onToggleCompare(product)}
                  className="w-3 h-3 accent-[var(--accent)] rounded cursor-pointer"
                />
                So sánh
              </label>
            )}
          </div>

          <h3
            className="text-[14px] font-extrabold leading-snug line-clamp-1 truncate"
            style={{ color: 'var(--t1)' }}
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold leading-none" style={{ color: 'var(--t2)' }}>
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{rating.toFixed(1)}</span>
              <span className="font-normal" style={{ color: 'var(--t3)' }}>({product.reviews ?? 0})</span>
            </div>
            {product.salesCount > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-orange-500 font-bold">
                  Đã bán {product.salesCount}
                </span>
              </>
            )}
          </div>

          {/* Technical specifications panel */}
          {specsList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 mt-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/80">
              {specsList.slice(0, 6).map((spec, idx) => (
                <div key={idx} className="text-[11px] leading-tight flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-400 font-medium shrink-0">{spec.label}:</span>
                  <span className="text-slate-700 font-extrabold truncate" style={{ color: 'var(--t1)' }} title={spec.value}>{spec.value}</span>
                </div>
              ))}
            </div>
          ) : product.specSummary ? (
            <p className="text-[11px] text-slate-500 mt-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 leading-tight">
              {product.specSummary}
            </p>
          ) : null}
        </div>

        {/* Right Column: Pricing & Add to cart */}
        <div
          className="w-52 shrink-0 flex flex-col justify-center items-end p-4 gap-3 text-right"
          style={{
            borderLeft: '1px solid var(--b1)',
            backgroundColor: 'rgba(248,250,252,0.4)',
          }}
        >
          {product.available ? (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Còn hàng
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-black text-rose-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Hết hàng
            </span>
          )}

          <div className="flex flex-col items-end min-w-0">
            {product.originalPrice && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] leading-none line-through text-slate-400">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">
                  -{savingsPct}%
                </span>
              </div>
            )}
            <span className="text-[18px] font-black leading-none text-orange-600 font-['Be_Vietnam_Pro',sans-serif] mt-1">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.available ? (
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer w-full transition-all duration-200 active:scale-95 shrink-0"
              style={{
                background: adding ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, var(--accent-h), var(--accent))',
                border: 'none',
                boxShadow: '0 2px 8px rgba(232, 66, 10, 0.15)',
              }}
            >
              {adding ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã thêm
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Mua ngay
                </>
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onNotifyBackInStock) onNotifyBackInStock(product)
              }}
              className="flex items-center justify-center gap-1.5 border text-slate-400 bg-white hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer w-full"
              style={{ borderColor: 'var(--b1)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Báo khi có hàng
            </button>
          )}
        </div>
      </div>
    )
  }

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
        {/* Urgency/Marketing Badge */}
        {(() => {
          if (isLowStock) {
            return (
              <div 
                className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9.5px] font-black text-white flex items-center gap-1 shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  borderRadius: '20px',
                }}
              >
                <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Chỉ còn {product.availableCount} sp
              </div>
            )
          }
          if (isHotDeal) {
            return (
              <div 
                className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9.5px] font-black text-white flex items-center gap-1 shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                  borderRadius: '20px',
                }}
              >
                <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Hot Deal
              </div>
            )
          }
          if (isBestSeller) {
            return (
              <div 
                className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9.5px] font-black text-white flex items-center gap-1 shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  borderRadius: '20px',
                }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Bán chạy
              </div>
            )
          }
          return null
        })()}

        <button
          onClick={e => {
            e.stopPropagation()
            const nextWished = !wished
            setWished(nextWished)
            if (onToggleWishlist) onToggleWishlist(product, nextWished)
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

        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(product)
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 bg-white/95 backdrop-blur-sm text-slate-850 hover:text-orange-605 font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer whitespace-nowrap transform translate-y-2 group-hover:translate-y-0"
          >
            Xem nhanh
          </button>
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
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleCompare && (
              <label 
                onClick={e => e.stopPropagation()} 
                className="flex items-center gap-0.5 text-[9.5px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <input 
                  type="checkbox" 
                  checked={isCompared}
                  onChange={() => onToggleCompare(product)}
                  className="w-3 h-3 accent-[var(--accent)] rounded cursor-pointer"
                />
                So sánh
              </label>
            )}
            {onToggleCompare && <span className="text-slate-350 text-[8px] font-normal">|</span>}
            {product.available ? (
              <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-600">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Còn hàng
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-rose-500">
                <span className="w-1 h-1 rounded-full bg-rose-500" />
                Hết hàng
              </span>
            )}
          </div>
        </div>

        <h3
          className="text-[13px] font-bold leading-snug line-clamp-2 min-h-[2.3rem] transition-colors"
          style={{ color: 'var(--t1)' }}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[10.5px] font-semibold leading-none" style={{ color: 'var(--t2)' }}>
          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{rating.toFixed(1)}</span>
            <span className="font-normal" style={{ color: 'var(--t3)' }}>({product.reviews ?? 0})</span>
          </div>
          {product.salesCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-orange-500 font-bold">
                Đã bán {product.salesCount}
              </span>
            </>
          )}
        </div>

        {/* Specs summary — uses pre-built specSummary from backend per product type */}
        {(() => {
          const specsText = product.specSummary ?? (() => {
            const parts = []
            if (product.ram) parts.push(`RAM ${product.ram}`)
            if (product.storage) parts.push(product.storage)
            if (product.color) parts.push(product.color)
            return parts.join(' · ')
          })()
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
              onClick={(e) => {
                e.stopPropagation()
                if (onNotifyBackInStock) onNotifyBackInStock(product)
              }}
              className="w-9 h-9 flex items-center justify-center border text-slate-450 hover:text-[#E8420A] hover:border-[#E8420A]/30 hover:bg-orange-50/20 shrink-0 bg-transparent cursor-pointer transition-colors"
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
