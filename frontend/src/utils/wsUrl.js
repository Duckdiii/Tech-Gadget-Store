// Dựng broker URL cho STOMP WebSocket. Nếu VITE_API_BASE_URL được set (deploy tách domain,
// vd. frontend Vercel + backend Render), suy ra ws(s):// từ chính domain đó. Nếu không (cùng
// origin qua Nginx / Vite dev proxy), dùng domain hiện tại như trước.
export function getWsBrokerUrl(path = '/ws') {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return apiBaseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + path
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}${path}`
}
