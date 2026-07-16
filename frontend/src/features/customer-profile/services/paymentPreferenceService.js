import axiosClient from '../../../config/axiosClient'

export const paymentPreferenceService = {
  async getPreferredMethod() {
    return axiosClient.get('/api/customer/payment/preferred-method')
  },

  async updatePreferredMethod(paymentType) {
    return axiosClient.put('/api/customer/payment/preferred-method', { paymentType })
  },
}
