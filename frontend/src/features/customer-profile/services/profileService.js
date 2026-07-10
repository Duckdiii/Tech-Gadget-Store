import axiosClient from '../../../config/axiosClient'

export const profileService = {
  // Profile info
  async getProfile() {
    return axiosClient.get('/api/customer/profile')
  },

  async updateProfile(fullName, phone) {
    return axiosClient.put('/api/customer/profile', { fullName, phone })
  },

  // Addresses
  async getAddresses() {
    return axiosClient.get('/api/customer/addresses')
  },

  async addAddress(payload) {
    return axiosClient.post('/api/customer/addresses', payload)
  },

  async updateAddress(id, payload) {
    return axiosClient.put(`/api/customer/addresses/${id}`, payload)
  },

  async deleteAddress(id) {
    return axiosClient.delete(`/api/customer/addresses/${id}`)
  },

  // Membership
  async getMembership() {
    return axiosClient.get('/api/customer/membership')
  },

  async getMembershipTiers() {
    return axiosClient.get('/api/customer/membership/tiers')
  },

  // Favorites
  async getFavorites() {
    return axiosClient.get('/api/customer/favorites')
  },

  async toggleFavorite(productId) {
    return axiosClient.post(`/api/customer/products/${productId}/favorite`)
  },
}
