import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/useAuth'
import { profileService } from '../features/customer-profile/services/profileService'

/**
 * Shared wishlist-heart state: which products the logged-in customer has favorited, and the
 * toggle handler to pass to <ProductCard onToggleWishlist>. Centralized here because the heart
 * button shows up on every page that renders ProductCard (shop listing, home/detail/cart
 * recommendation rails) — duplicating this per-page is how it silently went unwired on most of
 * them (only the shop listing page had its own copy, and that copy read the wrong localStorage
 * key so it never worked either).
 */
export function useFavorites() {
  const { user } = useAuth()
  const [favoritesMap, setFavoritesMap] = useState({})

  useEffect(() => {
    if (!user) {
      setFavoritesMap({})
      return
    }
    let cancelled = false
    profileService.getFavorites()
      .then(res => {
        if (cancelled) return
        const mapping = {}
        for (const item of res?.items || []) {
          if (item.productId) mapping[item.productId] = true
        }
        setFavoritesMap(mapping)
      })
      .catch(err => console.warn('Không thể tải danh sách sản phẩm yêu thích:', err))
    return () => { cancelled = true }
  }, [user])

  const toggleWishlist = useCallback(async (product, nextWished) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!')
      return
    }
    // The favorite/subscribe endpoint acts on a product *variant*, not the product itself —
    // ProductResponseDto carries the default variant's id for exactly this (see backend
    // ProductMapper). Falling back to product.id would 404 against ProductVariantRepository.
    const variantId = product.variantId || product.id
    try {
      await profileService.toggleFavorite(variantId)
      setFavoritesMap(prev => ({ ...prev, [product.id]: nextWished }))
      window.dispatchEvent(new Event('favorites_changed'))
    } catch (e) {
      console.error('Lỗi lưu sản phẩm yêu thích:', e)
    }
  }, [user])

  return { favoritesMap, toggleWishlist }
}
