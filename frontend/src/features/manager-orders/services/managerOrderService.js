import axiosClient from '../../../config/axiosClient'

export const managerOrderService = {
  async getManagerOrders(status, cursor, limit = 20) {
    let url = '/api/manager/orders'
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    if (cursor) params.append('cursor', cursor)
    params.append('limit', limit)
    const queryString = params.toString()
    if (queryString) url += `?${queryString}`
    return axiosClient.get(url)
  },

  async updateOrderStatus(orderId, status) {
    return axiosClient.put(`/api/manager/orders/${orderId}/status`, { status })
  },

  async getManagerPaymentLogs() {
    return axiosClient.get('/api/manager/payment-logs')
  },
}
