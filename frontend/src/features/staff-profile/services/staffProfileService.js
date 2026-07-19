import axiosClient from '../../../config/axiosClient'

export const staffProfileService = {
  async getMyProfile() {
    return axiosClient.get('/api/account/me')
  },
  async changePassword({ current, next }) {
    return axiosClient.put('/api/account/me/password', {
      currentPassword: current,
      newPassword: next,
    })
  },
}
