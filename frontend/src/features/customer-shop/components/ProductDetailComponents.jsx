import React, { useState } from 'react'

function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

export function ProductImages({ product }) {
  const [selected, setSelected] = useState(0)
  const images = (product.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls
    : ['https://placehold.co/300x360/EEF1F9/96A3BC?text=No+Image']

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-[360px] overflow-hidden" style={{ border: '1.5px solid var(--b1)', borderRadius: '20px', backgroundColor: 'var(--card)' }}>
        <img src={images[selected]} alt={product.name} className="w-full h-full object-contain p-4" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto py-1.5 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="w-16 h-16 shrink-0 overflow-hidden cursor-pointer"
              style={{
                border: selected === i ? '2px solid var(--accent)' : '1.5px solid var(--b1)',
                borderRadius: '10px',
                backgroundColor: 'var(--card)'
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductInfo({
  product,
  selectedVariant,
  selectedRam,
  setSelectedRam,
  selectedStorage,
  setSelectedStorage,
  selectedColor,
  setSelectedColor,
  adding,
  handleAddToCart,
  viewerCount = 0
}) {
  // Extract option pools
  const rams = Array.from(new Set(product.variants.map(v => v.ramGb))).filter(Boolean).sort((a, b) => a - b)
  const storages = Array.from(new Set(product.variants.map(v => v.storageGb))).filter(Boolean).sort((a, b) => a - b)
  const colors = Array.from(new Set(product.variants.map(v => v.color))).filter(Boolean)

  const currentPrice = selectedVariant ? selectedVariant.price : product.minPrice
  const originalPrice = currentPrice * 1.12

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-extrabold px-3 py-1 text-white tracking-wider uppercase" style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '6px' }}>{product.categoryName || 'Sản phẩm'}</span>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4" style={{ color: i < 5 ? '#F59E0B' : '#e2e8f0' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>{product.brandName}</span>
        <h1 className="text-2xl font-black mt-1" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{product.name}</h1>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(currentPrice)}</span>
        <span className="text-sm line-through" style={{ color: 'var(--t3)' }}>{fmt(originalPrice)}</span>
        <span className="text-xs font-bold px-2 py-0.5" style={{ color: 'var(--ok)', backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: '4px' }}>Tiết kiệm 12%</span>
      </div>

      {viewerCount >= 2 && (
        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--accent)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {viewerCount} người đang xem sản phẩm này
        </div>
      )}

      {/* Variant RAM selections */}
      {rams.length > 0 && (
        <div>
          <p className="text-[12.5px] font-extrabold mb-2" style={{ color: 'var(--t2)' }}>RAM</p>
          <div className="flex gap-2">
            {rams.map(ram => (
              <button key={ram} onClick={() => setSelectedRam(ram)} className="px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                style={{
                  border: selectedRam === ram ? '2px solid var(--accent)' : '1.5px solid var(--b1)',
                  borderRadius: '8px',
                  backgroundColor: selectedRam === ram ? 'transparent' : 'var(--card)',
                  color: selectedRam === ram ? 'var(--accent)' : 'var(--t2)'
                }}
              >{ram}GB</button>
            ))}
          </div>
        </div>
      )}

      {/* Variant Storage selections */}
      {storages.length > 0 && (
        <div>
          <p className="text-[12.5px] font-extrabold mb-2" style={{ color: 'var(--t2)' }}>Dung lượng bộ nhớ</p>
          <div className="flex gap-2">
            {storages.map(st => (
              <button key={st} onClick={() => setSelectedStorage(st)} className="px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                style={{
                  border: selectedStorage === st ? '2px solid var(--accent)' : '1.5px solid var(--b1)',
                  borderRadius: '8px',
                  backgroundColor: selectedStorage === st ? 'transparent' : 'var(--card)',
                  color: selectedStorage === st ? 'var(--accent)' : 'var(--t2)'
                }}
              >
                {st >= 1024 ? `${st / 1024}TB` : `${st}GB`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Variant Color selections */}
      {colors.length > 0 && (
        <div>
          <p className="text-[12.5px] font-extrabold mb-2" style={{ color: 'var(--t2)' }}>Màu sắc</p>
          <div className="flex gap-2.5">
            {colors.map(col => (
              <button key={col} onClick={() => setSelectedColor(col)} className="px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                style={{
                  border: selectedColor === col ? '2px solid var(--accent)' : '1.5px solid var(--b1)',
                  borderRadius: '8px',
                  backgroundColor: selectedColor === col ? 'transparent' : 'var(--card)',
                  color: selectedColor === col ? 'var(--accent)' : 'var(--t2)'
                }}
              >{col}</button>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-2.5 pt-1">
        <button
          onClick={() => handleAddToCart()}
          disabled={adding || !selectedVariant}
          className="w-full flex items-center justify-center gap-2.5 text-white font-extrabold py-3.5 px-6 text-[14px] cursor-pointer transition-all duration-200 hover:shadow-lg disabled:opacity-50 border-none"
          style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleAddToCart()}
            disabled={adding || !selectedVariant}
            className="flex-1 text-white font-extrabold py-2.5 px-4 text-xs cursor-pointer transition-colors disabled:opacity-50 border-none"
            style={{ backgroundColor: 'var(--t1)', borderRadius: '10px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--t1)'}
          >
            Mua ngay
          </button>
        </div>
      </div>

      {/* Trust mini strip */}
      <div className="grid grid-cols-2 mt-1" style={{ borderTop: '1px solid var(--b1)' }}>
        {[
          [<svg key="1" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, 'Giao hàng miễn phí', 'Đơn từ 500.000đ'],
          [<svg key="2" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, 'Bảo hành 12 tháng', 'Chính hãng Apple VN'],
        ].map(([icon, title, sub], i) => (
          <div key={title} className="flex items-center gap-3 px-3 py-3" style={{ borderRight: i === 0 ? '1px solid var(--b1)' : 'none' }}>
            <div className="w-8 h-8 flex items-center justify-center shrink-0 text-white animate-none" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>
              {icon}
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{title}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SpecsTab({ product }) {
  const specs = [
    { label: 'Màn hình', value: product.screenSize ? `${product.screenSize} inch, ${product.screenResolution || ''}` : 'N/A' },
    { label: 'Vi xử lý', value: product.chipset || 'N/A' },
    { label: 'Rear Camera', value: product.rearCamera || 'N/A' },
    { label: 'Front Camera', value: product.frontCamera || 'N/A' },
    { label: 'Pin & Sạc', value: product.batteryCapacity ? `${product.batteryCapacity} mAh` : 'N/A' },
    { label: 'Hệ điều hành', value: product.operatingSystem || 'N/A' },
    { label: 'Sim', value: product.simType || 'N/A' },
    { label: 'NFC', value: product.nfcSupported ? 'Có hỗ trợ' : 'Không hỗ trợ' }
  ]

  return (
    <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid var(--b1)' }}>
      <h2 className="text-lg font-black mb-5" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Thông số kỹ thuật</h2>
      <div className="divide-y divide-slate-100">
        {specs.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-[160px_1fr] py-3 text-sm">
            <span className="font-semibold text-slate-400">{label}</span>
            <span className="font-bold text-slate-800 pr-2">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
