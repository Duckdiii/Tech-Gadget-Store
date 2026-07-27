import axiosClient from '../../../config/axiosClient'
import { downloadFile } from '../../../utils/downloadFile'
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
    const query = analyticsService.buildExportQuery(filter)
    await downloadFile(`/api/manager/revenue-report/export${query}`, 'revenue_report.csv', 'Lỗi xuất báo cáo')
  },
}
