import axiosClient from '../../../config/axiosClient'

export const reviewService = {
  async getProductReviews(productId, page = 0, size = 10) {
    return axiosClient.get(`/api/reviews/product/${productId}`, { params: { page, size } })
  },

  async createReview(productId, content, rating) {
    return axiosClient.post('/api/reviews', { productId, content, rating })
  },

  async deleteReview(reviewId) {
    return axiosClient.delete(`/api/reviews/${reviewId}`)
  },
}
