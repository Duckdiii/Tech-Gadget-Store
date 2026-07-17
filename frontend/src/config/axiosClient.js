import axios from 'axios'
import { getToken, clearToken, clearPersistedUser, getPersistedUser } from '../utils/authToken'

const axiosClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams()
    for (const key in params) {
      if (params[key] === undefined || params[key] === null) continue
      if (Array.isArray(params[key])) {
        params[key].forEach(val => searchParams.append(key, val))
      } else {
        searchParams.append(key, params[key])
      }
    }
    return searchParams.toString()
  }
})

// Request Interceptor to inject JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor to format response and extract errors
axiosClient.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response.data
  },
  (error) => {
    // A 401 while we believe we're logged in means the token expired or was invalidated
    // server-side. Previously this just rejected silently — callers like useCart() only
    // console.error it, so the UI ended up showing an empty cart with no explanation,
    // looking exactly like "my cart disappeared" instead of "please log in again".
    const isOnAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/portal/login')
    if (error.response?.status === 401 && getToken() && !isOnAuthPage) {
      const role = getPersistedUser()?.role
      const loginPath = (role === 'manager' || role === 'staff') ? '/portal/login' : '/login'
      clearToken()
      clearPersistedUser()
      window.location.href = `${loginPath}?sessionExpired=1`
    }

    // Standardize error message extraction
    const serverMessage = error.response?.data?.message || error.response?.data
    const message = serverMessage || error.message || 'Đã có lỗi xảy ra'
    return Promise.reject(new Error(message))
  }
)

export default axiosClient
