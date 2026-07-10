import axiosClient from '../../../config/axiosClient'

export const managerInventoryService = {
  // Products (public/general catalog and manager specific)
  getProducts: (page = 0, size = 100) => {
    return axiosClient.get(`/api/products?page=${page}&size=${size}`)
  },

  getProductById: (id) => {
    return axiosClient.get(`/api/products/${id}`)
  },

  createProduct: (payload) => {
    return axiosClient.post('/api/manager/products', payload)
  },

  updateProduct: (id, payload) => {
    return axiosClient.put(`/api/manager/products/${id}`, payload)
  },

  discontinueProduct: (id) => {
    return axiosClient.patch(`/api/manager/products/${id}/discontinue`)
  },

  // Variants
  addVariant: (productId, payload) => {
    return axiosClient.post(`/api/manager/products/${productId}/variants`, payload)
  },

  deleteVariant: (productId, variantId) => {
    return axiosClient.delete(`/api/manager/products/${productId}/variants/${variantId}`)
  },

  // Images
  addImage: (productId, payload) => {
    return axiosClient.post(`/api/manager/products/${productId}/images`, payload)
  },

  deleteImage: (productId, imageId) => {
    return axiosClient.delete(`/api/manager/products/${productId}/images/${imageId}`)
  },

  // Suppliers
  getSuppliers: () => {
    return axiosClient.get('/api/manager/suppliers')
  },

  createSupplier: (payload) => {
    return axiosClient.post('/api/manager/suppliers', payload)
  },

  updateSupplier: (id, payload) => {
    return axiosClient.put(`/api/manager/suppliers/${id}`, payload)
  },

  deleteSupplier: (id) => {
    return axiosClient.delete(`/api/manager/suppliers/${id}`)
  },

  // Supply Orders
  getSupplyOrders: () => {
    return axiosClient.get('/api/manager/supply-orders')
  },

  getSupplyOrderById: (id) => {
    return axiosClient.get(`/api/manager/supply-orders/${id}`)
  },

  createSupplyOrder: (payload) => {
    return axiosClient.post('/api/manager/supply-orders', payload)
  },

  updateSupplyOrderStatus: (id, status) => {
    return axiosClient.put(`/api/manager/supply-orders/${id}/status`, { status })
  },

  // Warehouse & Staff Logs
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
