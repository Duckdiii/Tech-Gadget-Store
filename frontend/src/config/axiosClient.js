import axios from 'axios'
import { getToken } from '../utils/authToken'

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
    // Standardize error message extraction
    const serverMessage = error.response?.data?.message || error.response?.data
    const message = serverMessage || error.message || 'Đã có lỗi xảy ra'
    return Promise.reject(new Error(message))
  }
)

export default axiosClient
