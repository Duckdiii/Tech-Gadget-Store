import axiosClient from '../../../config/axiosClient'

export const settingsService = {
  // Brands
  getBrands: () => {
    return axiosClient.get('/api/manager/brands')
  },

  createBrand: (payload) => {
    return axiosClient.post('/api/manager/brands', payload)
  },

  updateBrand: (id, payload) => {
    return axiosClient.put(`/api/manager/brands/${id}`, payload)
  },

  deleteBrand: (id) => {
    return axiosClient.delete(`/api/manager/brands/${id}`)
  },

  // Categories
  getCategories: () => {
    return axiosClient.get('/api/manager/categories')
  },

  createCategory: (payload) => {
    return axiosClient.post('/api/manager/categories', payload)
  },

  updateCategory: (id, payload) => {
    return axiosClient.put(`/api/manager/categories/${id}`, payload)
  },

  deleteCategory: (id) => {
    return axiosClient.delete(`/api/manager/categories/${id}`)
  },

  // Bundle Services
  getBundleServices: () => {
    return axiosClient.get('/api/manager/bundle-services')
  },

  createBundleService: (payload) => {
    return axiosClient.post('/api/manager/bundle-services', payload)
  },

  updateBundleService: (id, payload) => {
    return axiosClient.put(`/api/manager/bundle-services/${id}`, payload)
  },

  deleteBundleService: (id) => {
    return axiosClient.delete(`/api/manager/bundle-services/${id}`)
  },

  // Memberships
  getMemberships: () => {
    return axiosClient.get('/api/manager/memberships')
  },

  createMembership: (payload) => {
    return axiosClient.post('/api/manager/memberships', payload)
  },

  updateMembership: (id, payload) => {
    return axiosClient.put(`/api/manager/memberships/${id}`, payload)
  },

  deleteMembership: (id) => {
    return axiosClient.delete(`/api/manager/memberships/${id}`)
  },

  // Backup & Recovery
  getBackupRecoveryPoints: () => {
    return axiosClient.get('/api/manager/backup-restore/recovery-points')
  },

  restoreBackup: (pointId) => {
    return axiosClient.post('/api/manager/backup-restore/restores', { recoveryPointId: pointId })
  },

  createBackup: (reason = 'Manual Backup') => {
    return axiosClient.post(`/api/manager/backup-restore/backups?reason=${encodeURIComponent(reason)}`)
  }
}
