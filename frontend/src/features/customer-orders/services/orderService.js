import axiosClient from '../../../config/axiosClient'

export const orderService = {
  // Customer APIs
  async getCustomerOrders() {
    return axiosClient.get('/api/customer/orders')
  },

  async cancelCustomerOrder(orderId) {
    return axiosClient.post(`/api/customer/orders/${orderId}/cancel`)
  },

  // Manager APIs
  async getManagerOrders(status) {
    const url = status && status !== 'all' 
      ? `/api/manager/orders?status=${status}` 
      : '/api/manager/orders'
    return axiosClient.get(url)
  },

  async updateManagerOrderStatus(orderId, status) {
    return axiosClient.put(`/api/manager/orders/${orderId}/status`, { status })
  },

  async getManagerPaymentLogs() {
    return axiosClient.get('/api/manager/payment-logs')
  },
}
