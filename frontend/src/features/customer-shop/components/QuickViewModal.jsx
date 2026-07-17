import { useState, useEffect } from 'react'
import { shopService } from '../services/shopService'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + ' đ'
}

export default function QuickViewModal({ productId, onClose, onNavigate }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Selection states
  const [selectedRam, setSelectedRam] = useState(null)
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const [activeImage, setActiveImage] = useState(null)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const data = await shopService.getProductById(productId)
        setProduct(data)
        
        // Initialize default image
        if (data.imageUrls && data.imageUrls.length > 0) {
          setActiveImage(data.imageUrls[0])
        } else if (data.imageUrl) {
          setActiveImage(data.imageUrl)
        }

        // Initialize variant choices
        if (data.variants && data.variants.length > 0) {
          const first = data.variants[0]
          setSelectedRam(first.ramGb)
          setSelectedStorage(first.storageGb)
          setSelectedColor(first.color)
          setSelectedVariant(first)
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  // Recalculate selected variant based on selections
  useEffect(() => {
    if (!product || !product.variants) return
    const match = product.variants.find((v) =>
      (!selectedRam || v.ramGb === selectedRam) &&
      (!selectedStorage || v.storageGb === selectedStorage) &&
      (!selectedColor || v.color === selectedColor)
    )
    setSelectedVariant(match || null)
  }, [selectedRam, selectedStorage, selectedColor, product])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    setAdding(true)
    try {
      await shopService.addCartItem(selectedVariant.id, 1)
      showToast('Đã thêm vào giỏ hàng')
    } catch (e) {
      alert('Lỗi thêm vào giỏ hàng: ' + e.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-[#E8420A] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center flex flex-col items-center gap-4">
          <span className="text-red-500 text-3xl">⚠️</span>
          <h3 className="text-sm font-extrabold text-slate-800">Không thể tải thông tin</h3>
          <p className="text-xs text-slate-500">{error || 'Sản phẩm không khả dụng.'}</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 border-none cursor-pointer">Đóng</button>
        </div>
      </div>
    )
  }

  const rams = [...new Set(product.variants?.map(v => v.ramGb).filter(v => v != null))]
  const storages = [...new Set(product.variants?.map(v => v.storageGb).filter(v => v != null))]
  const colors = [...new Set(product.variants?.map(v => v.color).filter(v => v != null))]

  // Format pricing
  const currentPrice = selectedVariant ? selectedVariant.price : product.minPrice
  const discountPercent = product.discountPercent ?? 0
  const originalPrice = discountPercent > 0 && currentPrice ? Math.round(currentPrice / (1 - discountPercent / 100)) : null

  // Extract detailed specs for display
  const keySpecs = []
  if (product.cpu) keySpecs.push({ label: 'Bộ vi xử lý (CPU)', value: product.cpu })
  if (product.gpu) keySpecs.push({ label: 'Card đồ họa (GPU)', value: product.gpu })
  if (product.screenSize) keySpecs.push({ label: 'Màn hình', value: `${product.screenSize} inch` + (product.screenResolution ? ` (${product.screenResolution})` : '') })
  if (product.chipset) keySpecs.push({ label: 'Vi xử lý (Chipset)', value: product.chipset })
  if (product.batteryCapacity) keySpecs.push({ label: 'Dung lượng pin', value: `${product.batteryCapacity} mAh` })
  if (product.operatingSystem) keySpecs.push({ label: 'Hệ điều hành', value: product.operatingSystem })
  if (product.refreshRate) keySpecs.push({ label: 'Tần số quét', value: `${product.refreshRate} Hz` })
  if (product.panelType) keySpecs.push({ label: 'Tấm nền', value: product.panelType })
  if (product.isWireless !== null && product.isWireless !== undefined) keySpecs.push({ label: 'Kết nối', value: product.isWireless ? 'Không dây' : 'Có dây' })
  if (product.hasNoiseCancelling !== null && product.hasNoiseCancelling !== undefined) keySpecs.push({ label: 'Chống ồn ANC', value: product.hasNoiseCancelling ? 'Có hỗ trợ' : 'Không hỗ trợ' })
  if (product.batteryLifeHours) keySpecs.push({ label: 'Thời lượng pin', value: `${product.batteryLifeHours} giờ` })
  if (product.batteryLifeDays) keySpecs.push({ label: 'Thời lượng pin', value: `${product.batteryLifeDays} ngày` })
  if (product.isWaterResistant !== null && product.isWaterResistant !== undefined) keySpecs.push({ label: 'Kháng nước', value: product.isWaterResistant ? 'Có hỗ trợ' : 'Không' })

  // Determine vector icon placeholder based on category
  const categoryLower = product.categoryName?.toLowerCase() || ''
  let devicePlaceholder = (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
  if (categoryLower.includes('điện thoại') || categoryLower.includes('phone')) {
    devicePlaceholder = (
      <svg className="w-14 h-14 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  } else if (categoryLower.includes('laptop') || categoryLower.includes('máy tính')) {
    devicePlaceholder = (
      <svg className="w-18 h-18 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  } else if (categoryLower.includes('màn hình') || categoryLower.includes('monitor')) {
    devicePlaceholder = (
      <svg className="w-18 h-18 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M8 17l4 4 4-4m-4-5v9M3 4h18a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    )
  } else if (categoryLower.includes('tai nghe') || categoryLower.includes('headphones') || categoryLower.includes('âm thanh')) {
    devicePlaceholder = (
      <svg className="w-14 h-14 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M17 14c.895-1.045.895-2.955 0-4m3.5 7.5c1.865-2.222 1.865-6.278 0-8.5" />
      </svg>
    )
  } else if (categoryLower.includes('đồng hồ') || categoryLower.includes('watch')) {
    devicePlaceholder = (
      <svg className="w-14 h-14 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg animate-bounce">
            {toast}
          </div>
        )}

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all border-none bg-transparent cursor-pointer text-lg font-bold"
        >
          ×
        </button>

        {/* Left Side: Images Gallery */}
        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 border-r border-slate-100 justify-center bg-slate-50/20">
          {/* Main Image Display */}
          <div className="h-64 md:h-80 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative group/img">
            {activeImage && !activeImage.includes('placehold.co') ? (
              <img 
                src={activeImage} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain transition-transform duration-350 group-hover/img:scale-105" 
                style={{ filter: 'drop-shadow(0 8px 20px rgba(15,23,42,0.06))' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center shadow-inner">
                  {devicePlaceholder}
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Hình ảnh mô phỏng</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-center">
              {product.imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(url)}
                  className="w-12 h-12 rounded-lg p-1 bg-white border cursor-pointer shrink-0 transition-all focus:outline-none"
                  style={{
                    borderColor: activeImage === url ? 'var(--accent)' : '#e2e8f0',
                    outline: activeImage === url ? '1.5px solid var(--accent)' : 'none',
                  }}
                >
                  <img src={url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Info & Selectors & Specs */}
        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col gap-1 pr-6">
            <div className="flex items-center gap-1.5 text-[9.5px] leading-none">
              <span className="font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                {product.brandName}
              </span>
              <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
              <span className="font-semibold text-slate-500">{product.categoryName}</span>
            </div>
            <h2 className="text-[17px] font-black text-slate-800 leading-snug mt-1">{product.name}</h2>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-[11.5px] text-slate-500 leading-relaxed line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Spec Summary banner */}
          {product.specSummary && (
            <div className="text-[11px] bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50 text-slate-650 font-semibold leading-relaxed">
              💡 <strong>Điểm nổi bật:</strong> {product.specSummary}
            </div>
          )}

          {/* Spec Table */}
          {keySpecs.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Thông số kĩ thuật</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {keySpecs.map((spec, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-100 pb-1 text-[10.5px]">
                    <span className="text-slate-400 font-bold">{spec.label}</span>
                    <span className="text-slate-800 font-extrabold truncate max-w-[130px]" title={spec.value}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variant pickers */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* RAM picker */}
            {rams.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">RAM</p>
                <div className="flex flex-wrap gap-1.5">
                  {rams.map(ram => (
                    <button
                      key={ram}
                      onClick={() => setSelectedRam(ram)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                        selectedRam === ram
                          ? 'bg-[#E8420A]/5 border-[#E8420A] text-[#E8420A] font-extrabold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {ram} GB
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage picker */}
            {storages.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Dung lượng</p>
                <div className="flex flex-wrap gap-1.5">
                  {storages.map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStorage(st)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                        selectedStorage === st
                          ? 'bg-[#E8420A]/5 border-[#E8420A] text-[#E8420A] font-extrabold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {st >= 1000 ? `${st / 1000} TB` : `${st} GB`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors picker */}
            {colors.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5">Màu sắc</p>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                        selectedColor === color
                          ? 'bg-[#E8420A]/5 border-[#E8420A] text-[#E8420A] font-extrabold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Cart Action */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              {originalPrice && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] line-through text-slate-400 font-semibold">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">
                    -{discountPercent}%
                  </span>
                </div>
              )}
              <span className="text-[19px] font-black text-orange-600 font-['Be_Vietnam_Pro',sans-serif]">
                {currentPrice ? formatPrice(currentPrice) : 'Giá liên hệ'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant}
                className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                  selectedVariant
                    ? 'bg-[#E8420A] text-white hover:bg-[#ff551c] active:scale-95 shadow-md shadow-orange-500/10'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {adding ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang thêm
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Thêm vào giỏ
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onClose()
                  onNavigate('detail', { search: '?id=' + product.id })
                }}
                className="px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all border-none cursor-pointer"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
