import axiosClient from '../../../config/axiosClient'

export const supportService = {
  async createTicket(subject, category, message) {
    return axiosClient.post('/api/customer/support/tickets', { subject, category, message })
  },

  async getMyTickets() {
    return axiosClient.get('/api/customer/support/tickets')
  },
}
