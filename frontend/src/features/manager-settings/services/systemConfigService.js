import axiosClient from '../../../config/axiosClient'

export const systemConfigService = {
  getSettings: () => axiosClient.get('/api/manager/store-settings'),
  updateSettings: (payload) => axiosClient.put('/api/manager/store-settings', payload),
}
