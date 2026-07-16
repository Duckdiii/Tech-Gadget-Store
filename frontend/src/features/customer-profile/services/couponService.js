import axiosClient from '../../../config/axiosClient'

export const couponService = {
  async getAvailableCoupons() {
    return axiosClient.get('/api/customer/coupons/available')
  },

  async getMyCoupons() {
    return axiosClient.get('/api/customer/coupons/mine')
  },

  async claimCoupon(couponId) {
    return axiosClient.post(`/api/customer/coupons/${couponId}/claim`)
  },
}
