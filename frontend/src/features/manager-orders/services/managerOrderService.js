import axiosClient from '../../../config/axiosClient'

export const managerOrderService = {
  async getManagerOrders(status) {
    const url = status && status !== 'all' 
      ? `/api/manager/orders?status=${status}` 
      : '/api/manager/orders'
    return axiosClient.get(url)
  },

  async updateOrderStatus(orderId, status) {
    return axiosClient.put(`/api/manager/orders/${orderId}/status`, { status })
  },

  async getManagerPaymentLogs() {
    return axiosClient.get('/api/manager/payment-logs')
  },
}
