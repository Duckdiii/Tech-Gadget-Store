import axiosClient from '../../../config/axiosClient'
import { getToken } from '../../../utils/authToken'
import { analyticsService } from './analyticsService'

export const dashboardService = {
  getRevenueReport: (filter) => analyticsService.getRevenueReport(filter),

  getCustomerStats: ({ startDate, endDate }) =>
    axiosClient.get('/api/manager/customer-stats', { params: { startDate, endDate } }),

  getOrderCount: ({ startDate, endDate }) =>
    axiosClient.get('/api/manager/orders/count', { params: { startDate, endDate } }),

  getPendingOrdersCount: () =>
    axiosClient.get('/api/manager/orders/pending-count'),

  getRecentOrders: (limit = 5, cursor = null) =>
    axiosClient.get('/api/manager/orders', { params: { limit, cursor } }),

  async exportReport(filter) {
    const token = getToken()
    const query = analyticsService.buildExportQuery(filter)
    const res = await fetch(`/api/manager/revenue-report/export${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error('Lỗi xuất báo cáo')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'revenue_report.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },
}
