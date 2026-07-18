import axiosClient from '../../../config/axiosClient'

export const managerUsersService = {
  // Accounts
  getAccounts: () => {
    return axiosClient.get('/api/manager/accounts')
  },

  blockAccount: (id) => {
    return axiosClient.patch(`/api/manager/accounts/${id}/block`)
  },

  unblockAccount: (id) => {
    return axiosClient.patch(`/api/manager/accounts/${id}/unblock`)
  },

  deleteAccount: (id) => {
    return axiosClient.delete(`/api/manager/accounts/${id}`)
  },

  // Customers
  getCustomers: ({ search, tier, joinStartDate, joinEndDate, minSpend, maxSpend, onlyRepeat, sortBy, sortDir, page, size } = {}) => {
    return axiosClient.get('/api/manager/customers', { params: { search, tier, joinStartDate, joinEndDate, minSpend, maxSpend, onlyRepeat, sortBy, sortDir, page, size } })
  },

  getCustomerStats: () => {
    return axiosClient.get('/api/manager/customers/stats')
  },

  getCustomerById: (id) => {
    return axiosClient.get(`/api/manager/customers/${id}`)
  },

  // Customer Notes
  addCustomerNote: (customerId, content) => {
    return axiosClient.post(`/api/manager/customers/${customerId}/notes`, { content })
  },

  updateCustomerNote: (noteId, content) => {
    return axiosClient.put(`/api/manager/customers/notes/${noteId}`, { content })
  },

  deleteCustomerNote: (noteId) => {
    return axiosClient.delete(`/api/manager/customers/notes/${noteId}`)
  },

  // Bulk Actions
  bulkUpdateStatus: (accountIds, status) => {
    return axiosClient.post('/api/manager/customers/bulk-status', { accountIds, status })
  },

  bulkSendPromotion: (customerIds, message) => {
    return axiosClient.post('/api/manager/customers/bulk-promotion', { customerIds, message })
  },

  exportCustomers: (customerIds) => {
    return axiosClient.post('/api/manager/customers/export', customerIds, { responseType: 'blob' })
  },

  // Staffs
  getStaffs: () => {
    return axiosClient.get('/api/manager/staffs')
  },

  createStaff: (payload) => {
    return axiosClient.post('/api/manager/staffs', payload)
  },

  updateStaff: (id, payload) => {
    return axiosClient.put(`/api/manager/staffs/${id}`, payload)
  },

  deleteStaff: (id) => {
    return axiosClient.delete(`/api/manager/staffs/${id}`)
  }
}
