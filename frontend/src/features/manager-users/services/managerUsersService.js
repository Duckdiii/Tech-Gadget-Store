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
  getCustomers: () => {
    return axiosClient.get('/api/manager/customers')
  },

  getCustomerById: (id) => {
    return axiosClient.get(`/api/manager/customers/${id}`)
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
