import { useState } from 'react'
import StoreNavbar from '../../../components/StoreNavbar'
import { useProductDetail } from '../hooks/useProductDetail'
import { useViewerCount } from '../hooks/useViewerCount'
import { useProductReviews } from '../hooks/useProductReviews'
import RecommendationSection from '../components/RecommendationSection'
import ReviewsSection from '../components/ReviewsSection'
import { useSimilarProducts, useFrequentlyBoughtTogether } from '../hooks/useRecommendations'

import { ProductImages, ProductInfo, SpecsTab } from '../components/ProductDetailComponents'

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('desc')
  const tabs = [
    { id: 'desc', label: 'Mô tả sản phẩm' },
    { id: 'specs', label: 'Thông số kỹ thuật' },
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
  const {
    product,
    loading,
    selectedRam,
    setSelectedRam,
    selectedStorage,
    setSelectedStorage,
    selectedColor,
    setSelectedColor,
    selectedVariant,
    adding,
    toast,
    handleAddToCart,
    onNavigate,
  } = useProductDetail()

  const { products: similarProducts, loading: similarLoading } = useSimilarProducts(product?.id)
  const { products: boughtTogetherProducts, loading: boughtTogetherLoading } = useFrequentlyBoughtTogether(product?.id)
  const { viewerCount } = useViewerCount(product?.id)
  const reviewsState = useProductReviews(product?.id)

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
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-3 rounded shadow-2xl">
          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.28 7.22a.75.75 0 00-1.06-1.06l-4.72 4.72-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}
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
              adding={adding}
              handleAddToCart={handleAddToCart}
              viewerCount={viewerCount}
              averageRating={reviewsState.averageRating}
              reviewCount={reviewsState.reviews.length}
            />
          </div>
        </div>

        <ProductTabs product={product} />

        <ReviewsSection {...reviewsState} />

        <RecommendationSection
          title="Sản phẩm tương tự"
          products={similarProducts}
          loading={similarLoading}
          onNavigate={onNavigate}
        />
        <RecommendationSection
          title="Khách hàng cũng mua"
          products={boughtTogetherProducts}
          loading={boughtTogetherLoading}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}
