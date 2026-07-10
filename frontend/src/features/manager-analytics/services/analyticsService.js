import axiosClient from '../../../config/axiosClient'

export const analyticsService = {
  getRevenueReport: () => {
    return axiosClient.get('/api/manager/revenue-report')
  }
}
