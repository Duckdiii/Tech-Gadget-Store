import { getToken } from '../context/AuthContext'

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
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
