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
    return axiosClient.post(`/api/customer/cart/items/${itemId}/bundle-services`, { bundleServiceIds })
  },

  async updateCartItemQuantity(itemId, quantity) {
    return axiosClient.put(`/api/customer/cart/items/${itemId}/quantity`, { quantity })
  },

  async deleteCartItem(itemId) {
    return axiosClient.delete(`/api/customer/cart/items/${itemId}`)
  },

  async addCartItem(productVariantId, quantity = 1) {
    return axiosClient.post('/api/customer/cart/items', { productVariantId, quantity })
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
}
