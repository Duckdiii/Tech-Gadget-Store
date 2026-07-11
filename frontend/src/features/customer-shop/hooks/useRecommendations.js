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

export function useForYouRecommendations(enabled) {
  return useRecommendationFetcher(
    () => shopService.getForYouRecommendations(),
    [enabled],
    enabled
  )
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
