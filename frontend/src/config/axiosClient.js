import axios from 'axios'
import { getToken } from '../context/AuthContext'

const axiosClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
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
