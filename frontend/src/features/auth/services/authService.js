import axiosClient from '../../../config/axiosClient'

export const authService = {
  async login(email, password) {
    return axiosClient.post('/api/auth/login', { email, password })
  },

  async register(fullName, phone, email, password) {
    return axiosClient.post('/api/auth/register', { fullName, phone, email, password })
  },

  async forgotPassword(email) {
    return axiosClient.post('/api/auth/forgot-password', { email })
  },

  async resetPassword(token, newPassword) {
    return axiosClient.post('/api/auth/reset-password', { token, newPassword })
  },
}
