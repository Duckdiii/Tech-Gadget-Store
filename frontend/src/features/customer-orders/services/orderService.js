import axiosClient from '../../../config/axiosClient'

export const orderService = {
  // Customer APIs
  async getCustomerOrders() {
    return axiosClient.get('/api/customer/orders')
  },

  async cancelCustomerOrder(orderId) {
    return axiosClient.post(`/api/customer/orders/${orderId}/cancel`)
  },
}
