import { apiFetch } from './api'

export const getPromotions = () => apiFetch('/api/manager/promotions')
export const getPromotionSummary = () => apiFetch('/api/manager/promotions/summary')
export const createPromotion = (data) =>
  apiFetch('/api/manager/promotions', { method: 'POST', body: JSON.stringify(data) })
export const updatePromotion = (id, data) =>
  apiFetch(`/api/manager/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePromotion = (id) =>
  apiFetch(`/api/manager/promotions/${id}`, { method: 'DELETE' })
export const getPromotionPerformance = (id) =>
  apiFetch(`/api/manager/promotions/${id}/performance`)
export const getProductsForPromotion = () =>
  apiFetch('/api/products?size=200')
