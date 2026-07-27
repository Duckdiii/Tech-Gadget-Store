import { getToken } from './authToken'

// Giống axiosClient/apiFetch: để trống khi cùng origin qua Nginx, set khi tách domain.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Tải file nhị phân (PDF hoá đơn, CSV báo cáo...) có JWT auth header, rồi kích hoạt download
 * ngay trên trình duyệt. Trước đây mỗi nơi cần tải file tự viết `fetch(path, ...)` với path
 * tương đối, thiếu base URL — khi frontend/backend tách domain, request rơi về chính domain
 * frontend (Vercel trả về index.html thay vì file thật). Gom lại 1 chỗ để tránh lặp lại lỗi này.
 */
export async function downloadFile(path, filename, errorMessage = 'Không thể tải file') {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(errorMessage)
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
