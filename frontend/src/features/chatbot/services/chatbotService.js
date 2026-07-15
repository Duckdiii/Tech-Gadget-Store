import axiosClient from '../../../config/axiosClient'

export const chatbotService = {
  async getHistory() {
    return axiosClient.get('/api/chatbot/history')
  },
}
