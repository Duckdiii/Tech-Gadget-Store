import axiosClient from '../../../config/axiosClient'

export const getPromotions = () => axiosClient.get('/api/manager/promotions')
export const getPromotionSummary = () => axiosClient.get('/api/manager/promotions/summary')
export const createPromotion = (data) =>
  axiosClient.post('/api/manager/promotions', data)
export const updatePromotion = (id, data) =>
  axiosClient.put(`/api/manager/promotions/${id}`, data)
export const deletePromotion = (id) =>
  axiosClient.delete(`/api/manager/promotions/${id}`)
export const getPromotionPerformance = (id) =>
  axiosClient.get(`/api/manager/promotions/${id}/performance`)
export const getProductsForPromotion = () =>
  axiosClient.get('/api/products?size=200')
