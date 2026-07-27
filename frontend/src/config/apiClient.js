import { getToken } from '../utils/authToken'

// Giống axiosClient: để trống (relative, cùng origin qua Nginx) khi không set
// VITE_API_BASE_URL; set khi frontend/backend deploy tách domain (vd. Vercel + Railway).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = text || `HTTP ${res.status}`
    try {
      const parsed = JSON.parse(text)
      if (parsed && parsed.message) message = parsed.message
    } catch {
      // response body wasn't JSON
    }
    throw new Error(message)
  }
  if (res.status === 204) return null
  return res.json()
}
