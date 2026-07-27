import axiosClient from '../../../config/axiosClient'

export const shopService = {
  // Cart APIs
  async getCart() {
    return axiosClient.get('/api/customer/cart')
  },

  async getCartItemBundles(cartItemId) {
    return axiosClient.get(`/api/customer/cart/items/${cartItemId}/bundle-services`)
  },

  async updateCartItemBundles(itemId, bundleServiceIds) {
    return axiosClient.put(`/api/customer/cart/items/${itemId}/bundle-services`, { bundleServicesIds: bundleServiceIds })
  },

  async updateCartItemQuantity(itemId, quantity) {
    const res = await axiosClient.put(`/api/customer/cart/items/${itemId}/quantity`, { quantity })
    window.dispatchEvent(new Event('cart_changed'))
    return res
  },

  async deleteCartItem(itemId) {
    const res = await axiosClient.delete(`/api/customer/cart/items/${itemId}`)
    window.dispatchEvent(new Event('cart_changed'))
    return res
  },

  async addCartItem(productVariantId, quantity = 1) {
    const res = await axiosClient.post('/api/customer/cart/items', { productVariantId, quantity })
    window.dispatchEvent(new Event('cart_changed'))
    return res
  },

  // Checkout APIs
  async getCheckoutSummary(cartItemIds) {
    return axiosClient.get(`/api/customer/payment/checkout-summary?cartItemIds=${cartItemIds.join(',')}`)
  },

  async confirmPayment(payload) {
    return axiosClient.post('/api/customer/payment/confirm', payload)
  },

  // Invoice APIs
  async getInvoiceByOrderId(orderId) {
    return axiosClient.get(`/api/customer/invoices/order/${orderId}`)
  },

  // Product APIs
  async getProductById(productId) {
    return axiosClient.get(`/api/products/${productId}`)
  },

  async getProductsByFilter(params) {
    return axiosClient.get('/api/products/filter', { params })
  },

  async getFlashSaleProducts() {
    return axiosClient.get('/api/products/flash-sale-today')
  },

  async getBestsellers(limit = 4) {
    return axiosClient.get('/api/products/bestsellers', { params: { limit } })
  },

  async getBrandNames() {
    return axiosClient.get('/api/brands')
  },

  async getCategories() {
    return axiosClient.get('/api/categories')
  },

  async getHomeStats() {
    return axiosClient.get('/api/stats/homepage')
  },

  async getReviewHighlights(limit = 6) {
    return axiosClient.get('/api/reviews/highlights', { params: { limit } })
  },

  async searchNaturalLanguage(query) {
    return axiosClient.get('/api/products/search-nl', { params: { q: query } })
  },

  // Recommendation APIs
  async getForYouRecommendations() {
    return axiosClient.get('/api/products/for-you')
  },

  // Ghi nhận khách bấm vào 1 gợi ý "Dành cho bạn" — dùng cho A/B test MF vs rule-based
  // (xem RecommendationExperimentLog ở backend). Không throw nếu lỗi — không được làm gián
  // đoạn việc khách điều hướng sang trang chi tiết sản phẩm.
  async trackForYouClick(impressionId) {
    return axiosClient.post(`/api/products/for-you/impressions/${impressionId}/click`)
  },

  async getSimilarProducts(productId) {
    return axiosClient.get(`/api/products/${productId}/similar`)
  },

  async getFrequentlyBoughtTogether(productId) {
    return axiosClient.get(`/api/products/${productId}/frequently-bought-together`)
  },

  async getCartRecommendations(productIds) {
    return axiosClient.get(`/api/products/cart-recommendations?productIds=${productIds.join(',')}`)
  },

  async getRecentlyViewed() {
    return axiosClient.get('/api/products/recently-viewed')
  },

  async getSuggestionsFromHistory() {
    return axiosClient.get('/api/products/suggestions-from-history')
  },

  async getViewerCount(productId, visitorId) {
    return axiosClient.get(`/api/products/${productId}/viewers?visitorId=${visitorId}`)
  },

  // Toggle favorite (wishlist heart) on a product for the logged-in customer
  async toggleFavorite(productId) {
    return axiosClient.post(`/api/customer/products/${productId}/favorite`)
  },

  // Toggle "notify me when back in stock" for a product for the logged-in customer
  async toggleStockSubscription(productId) {
    return axiosClient.post(`/api/customer/products/${productId}/subscription`)
  },

  // Retry payment for an unpaid order
  async retryPayment(endpoint, payload) {
    return axiosClient.post(endpoint, payload)
  },
}
