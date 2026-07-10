import axiosClient from '../../../config/axiosClient'

export const staffInventoryService = {
  getProducts: (page = 0, size = 100) => {
    return axiosClient.get(`/api/products?page=${page}&size=${size}`)
  },

  getProductById: (id) => {
    return axiosClient.get(`/api/products/${id}`)
  },

  getWarehouseLogs: () => {
    return axiosClient.get('/api/manager/warehouse-logs')
  },

  createImportLog: (payload) => {
    return axiosClient.post('/api/import-logs', payload)
  },

  createExportLog: (payload) => {
    return axiosClient.post('/api/export-logs', payload)
  }
}
