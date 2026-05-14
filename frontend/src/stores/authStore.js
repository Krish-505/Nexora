import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getProfile, login as loginService } from '../services/authService'

const getStoredAuthError = () => {
  const message = sessionStorage.getItem('auth:error') || ''
  sessionStorage.removeItem('auth:error')
  return message
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(getStoredAuthError())

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isSuperadmin = computed(() => user.value?.role === 'superadmin')

  const tenantName = computed(() => {
    if (!user.value) return ''
    if (user.value.role === 'superadmin') return 'Superadmin'
    return user.value.tenantName || ''
  })

  const userInitials = computed(() => {
    if (!user.value) return '?'

    const name = user.value.name || user.value.email || ''

    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  const clearSession = ({ preserveError = false } = {}) => {
    user.value = null
    token.value = null

    if (!preserveError) {
      error.value = ''
      sessionStorage.removeItem('auth:error')
    }

    localStorage.removeItem('token')
  }

  const initAuth = async () => {
    if (!token.value) return

    try {
      loading.value = true
      user.value = await getProfile()
    } catch {
      if (token.value) {
        clearSession()
      }
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    error.value = ''
    sessionStorage.removeItem('auth:error')

    try {
      const response = await loginService(credentials)

      token.value = response.accessToken
      user.value = response.user
      localStorage.setItem('token', response.accessToken)

      return response
    } catch (err) {
      clearSession({ preserveError: true })
      error.value = err?.response?.data?.message || 'Invalid email or password'

      throw err
    } finally {
      loading.value = false
    }
  }

  const handleUnauthorized = (message) => {
    const normalizedMessage =
      message || 'Your session has expired. Please sign in again.'

    clearSession({ preserveError: true })
    error.value = normalizedMessage
    sessionStorage.setItem('auth:error', normalizedMessage)
  }

  const logout = () => {
    clearSession()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    tenantName,
    isSuperadmin,
    userInitials,
    initAuth,
    login,
    logout,
    handleUnauthorized,
  }
})
