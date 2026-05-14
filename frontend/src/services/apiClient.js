import axios from 'axios'

let unauthorizedHandler = null

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401
    const requestUrl = error.config?.url || ''
    const isLoginRequest = requestUrl.includes('/auth/login')

    if (isUnauthorized && !isLoginRequest) {
      const message =
        error.response?.data?.message || 'Your session has expired. Please sign in again.'

      if (unauthorizedHandler) {
        unauthorizedHandler(message)
      } else {
        localStorage.removeItem('token')
        sessionStorage.setItem('auth:error', message)
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
