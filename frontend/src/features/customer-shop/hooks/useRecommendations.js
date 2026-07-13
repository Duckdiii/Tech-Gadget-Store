import { useState, useEffect } from 'react'
import { shopService } from '../services/shopService'
import { mapApiProduct } from '../utils/mapApiProduct'

function useRecommendationFetcher(fetcher, deps, enabled = true) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setProducts([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetcher()
      .then(data => { if (!cancelled) setProducts((data ?? []).map(mapApiProduct)) })
      .catch(err => { if (!cancelled) console.error('Lỗi tải gợi ý sản phẩm:', err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { products, loading }
}

export function useSimilarProducts(productId) {
  return useRecommendationFetcher(
    () => shopService.getSimilarProducts(productId),
    [productId],
    !!productId
  )
}

export function useFrequentlyBoughtTogether(productId) {
  return useRecommendationFetcher(
    () => shopService.getFrequentlyBoughtTogether(productId),
    [productId],
    !!productId
  )
}

// Không dùng chung useRecommendationFetcher — /api/products/for-you trả về
// {variant, items:[{impressionId, product}]} (phục vụ A/B test MF vs rule-based, xem
// RecommendationExperimentLog ở backend), khác shape mảng phẳng của các loại gợi ý khác.
// Gắn __impressionId vào từng sản phẩm đã map để HomePage dùng lại khi báo cáo click.
export function useForYouRecommendations(enabled) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setProducts([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    shopService.getForYouRecommendations()
      .then(data => {
        if (cancelled) return
        const items = data?.items ?? []
        setProducts(items.map(item => ({ ...mapApiProduct(item.product), __impressionId: item.impressionId })))
      })
      .catch(err => { if (!cancelled) console.error('Lỗi tải gợi ý sản phẩm:', err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [enabled])

  return { products, loading }
}

export function useCartRecommendations(productIds) {
  const key = (productIds || []).join(',')
  return useRecommendationFetcher(
    () => shopService.getCartRecommendations(productIds),
    [key],
    productIds && productIds.length > 0
  )
}

export function useRecentlyViewed(enabled) {
  return useRecommendationFetcher(
    () => shopService.getRecentlyViewed(),
    [enabled],
    enabled
  )
}

export function useSuggestionsFromHistory(enabled) {
  return useRecommendationFetcher(
    () => shopService.getSuggestionsFromHistory(),
    [enabled],
    enabled
  )
}
