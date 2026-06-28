import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'

function fmt(price) { return (price || 0).toLocaleString('vi-VN') + ' đ' }

function ProductImages({ product }) {
  const [selected, setSelected] = useState(0)
  const images = (product.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls
    : ['https://placehold.co/300x360/EEF1F9/96A3BC?text=No+Image']

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-center transition-all duration-300"
        style={{
          height: '380px',
          backgroundColor: 'var(--s1)',
          border: '1px solid var(--b1)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
      >
        <img
          src={images[selected]}
          alt={product.name}
          className="h-80 object-contain hover:scale-105 transition-transform duration-300"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(15,23,42,0.08))' }}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button key={i} onClick={() => setSelected(i)} className="relative w-20 h-20 overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: 'var(--s1)',
                border: selected === i ? '2.5px solid var(--accent)' : '1px solid var(--b1)',
                borderRadius: '10px',
                transform: selected === i ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <img src={src} alt={`thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductInfo({ product, selectedVariant, selectedRam, setSelectedRam, selectedStorage, setSelectedStorage, selectedColor, setSelectedColor, onNavigate }) {
  const [adding, setAdding] = useState(false)

  // Extract option pools
  const rams = Array.from(new Set(product.variants.map(v => v.ramGb))).filter(Boolean).sort((a, b) => a - b)
  const storages = Array.from(new Set(product.variants.map(v => v.storageGb))).filter(Boolean).sort((a, b) => a - b)
  const colors = Array.from(new Set(product.variants.map(v => v.color))).filter(Boolean)

  const handleAddToCart = async (buyNow = false) => {
    if (!selectedVariant) return
    setAdding(true)
    try {
      await apiFetch('/api/customer/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          productVariantId: selectedVariant.id,
          quantity: 1
        })
      })
      onNavigate('cart')
    } catch (e) {
      alert("Lỗi thêm vào giỏ hàng: " + e.message)
    } finally {
      setAdding(false)
    }
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.minPrice
  const originalPrice = currentPrice * 1.12

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-extrabold px-3 py-1 text-white tracking-wider uppercase" style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '6px' }}>{product.categoryName || 'Sản phẩm'}</span>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4" style={{ color: i < 5 ? '#F59E0B' : '#e2e8f0' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
          onClick={() => handleAddToCart(false)}
          disabled={adding || !selectedVariant}
          className="w-full flex items-center justify-center gap-2.5 text-white font-extrabold py-3.5 px-6 text-[14px] cursor-pointer transition-all duration-200 hover:shadow-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleAddToCart(true)}
            disabled={adding || !selectedVariant}
            className="flex-1 text-white font-extrabold py-2.5 px-4 text-xs cursor-pointer transition-colors disabled:opacity-50"
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
          [<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, 'Giao hàng miễn phí', 'Đơn từ 500.000đ'],
          [<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, 'Bảo hành 12 tháng', 'Chính hãng Apple VN'],
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

function SpecsTab({ product }) {
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
    <div className="flex gap-6 mt-6">
      <div className="flex-1 overflow-hidden" style={{ border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--b1)', backgroundColor: 'var(--s1)' }}>
          <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-bold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Thông số chi tiết</h3>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {specs.map((spec, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'var(--card)' : 'var(--s1)' }}>
                <td className="px-5 py-3.5 w-44 font-extrabold align-top" style={{ color: 'var(--t2)', borderBottom: '1px solid var(--b1)' }}>{spec.label}</td>
                <td className="px-5 py-3.5 align-top" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--b1)' }}>
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-64 flex flex-col gap-4 shrink-0">
        <div className="p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Ưu đãi độc quyền</h4>
          <div className="space-y-3">
            {['Giao hàng nhanh trong 2h', 'Miễn phí bảo hành vàng', 'Trả góp 0% cực nhanh'].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--t2)', fontWeight: '500' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 text-white" style={{ backgroundColor: 'var(--ink)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p className="text-[10px] font-extrabold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>TECHSTORE CARE+</p>
          <p className="text-sm font-bold leading-snug mb-3">Bảo vệ toàn diện 2 năm</p>
          <button className="flex items-center gap-1 text-xs transition-colors cursor-pointer" style={{ color: 'var(--t3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >
            Tìm hiểu thêm
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('specs')
  const tabs = [
    { id: 'specs', label: 'Thông số kỹ thuật' },
    { id: 'desc', label: 'Mô tả sản phẩm' },
  ]
  return (
    <div className="mt-10">
      <div className="flex" style={{ borderBottom: '2px solid var(--b1)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`featured-tab px-5 py-3.5 text-sm font-extrabold cursor-pointer transition-all duration-200 ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--t3)',
              marginBottom: '-2px',
            }}
          >{tab.label}</button>
        ))}
      </div>
      {activeTab === 'specs' && <SpecsTab product={product} />}
      {activeTab === 'desc' && (
        <div className="mt-6 text-sm leading-relaxed p-5 bg-white border border-gray-100 rounded-xl" style={{ color: 'var(--t2)' }}>
          {product.description || 'Mô tả sản phẩm đang được cập nhật...'}
        </div>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const onNavigate = useNav()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('id')

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  // Variant States
  const [selectedRam, setSelectedRam] = useState(null)
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return
      try {
        setLoading(true)
        const data = await apiFetch(`/api/products/${productId}`)
        setProduct(data)

        // Initialize variant options
        if (data.variants && data.variants.length > 0) {
          const first = data.variants[0]
          setSelectedRam(first.ramGb)
          setSelectedStorage(first.storageGb)
          setSelectedColor(first.color)
          setSelectedVariant(first)
        }
      } catch (e) {
        console.error("Lỗi tải thông tin sản phẩm:", e)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  // Recalculate selected variant when selections change
  useEffect(() => {
    if (!product || !product.variants) return
    const match = product.variants.find(v =>
      (!selectedRam || v.ramGb === selectedRam) &&
      (!selectedStorage || v.storageGb === selectedStorage) &&
      (!selectedColor || v.color === selectedColor)
    )
    if (match) {
      setSelectedVariant(match)
    }
  }, [selectedRam, selectedStorage, selectedColor, product])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <StoreNavbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-gray-500">Không tìm thấy sản phẩm</p>
          <button onClick={() => onNavigate('list')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg">Quay lại cửa hàng</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] mb-8" style={{ color: 'var(--t3)' }}>
          <span onClick={() => onNavigate('home')} className="cursor-pointer transition-colors hover:text-slate-900">Trang chủ</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span onClick={() => onNavigate('list')} className="cursor-pointer transition-colors hover:text-slate-900">{product.categoryName || 'Sản phẩm'}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: 'var(--t1)', fontWeight: 700 }}>{product.name}</span>
        </nav>

        {/* Main */}
        <div className="flex gap-10 items-start">
          <div className="w-[380px] shrink-0"><ProductImages product={product} /></div>
          <div className="flex-1 min-w-0">
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              selectedRam={selectedRam}
              setSelectedRam={setSelectedRam}
              selectedStorage={selectedStorage}
              setSelectedStorage={setSelectedStorage}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              onNavigate={onNavigate}
            />
          </div>
        </div>

        <ProductTabs product={product} />
      </div>
    </div>
  )
}
