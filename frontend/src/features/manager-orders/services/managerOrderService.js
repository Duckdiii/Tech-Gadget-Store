import axiosClient from '../../../config/axiosClient'

export const managerOrderService = {
  async getManagerOrders({ status, cursor, limit = 20, search, startDate, endDate, paymentMethod } = {}) {
    let url = '/api/manager/orders'
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    if (cursor) params.append('cursor', cursor)
    if (limit) params.append('limit', limit)
    if (search) params.append('search', search)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (paymentMethod && paymentMethod !== 'all') params.append('paymentMethod', paymentMethod)
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

  async getManagerOrderStats() {
    return axiosClient.get('/api/manager/orders/stats')
  },

  async bulkConfirmOrders(orderIds) {
    return axiosClient.post('/api/manager/orders/bulk-confirm', orderIds)
  },

  async exportOrders(orderIds) {
    return axiosClient.post('/api/manager/orders/export', orderIds, {
      responseType: 'blob'
    })
  },
}
