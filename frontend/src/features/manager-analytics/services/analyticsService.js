import axiosClient from '../../../config/axiosClient'

function buildQuery(filter = {}) {
  const params = new URLSearchParams()
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, value)
    }
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const analyticsService = {
  getRevenueReport: (filter) => {
    return axiosClient.get(`/api/manager/revenue-report${buildQuery(filter)}`)
  },
  buildExportQuery: buildQuery,
}
