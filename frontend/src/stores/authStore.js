import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginService, getProfile } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref('')

  // ─── Getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * Returns the display label for the current tenant.
   * - Superadmin  → "Superadmin"
   * - Tenant user → tenant name from JWT payload
   */
  const tenantName = computed(() => {
    if (!user.value) return ''
    if (user.value.role === 'superadmin') return 'Superadmin'
    return user.value.tenantName || user.value.tenant || ''
  })

  const isSuperadmin = computed(() => user.value?.role === 'superadmin')

  /** User's display initials for the avatar */
  const userInitials = computed(() => {
    if (!user.value) return '?'
    const name = user.value.name || user.value.email || ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Restore session from localStorage token on app boot.
   * Fetches the user profile from the backend using the stored JWT.
   */
  const initAuth = async () => {
    if (!token.value) return
    try {
      loading.value = true
      user.value = await getProfile()
    } catch {
      // Token invalid / expired → clear session
      logout()
    } finally {
      loading.value = false
    }
  }

  /** Authenticate with credentials; stores JWT + user in state */
  const login = async (credentials) => {
    loading.value = true

    error.value = ''

    try {
      const response = await loginService(credentials)

      token.value = response.accessToken

      user.value = response.user

      localStorage.setItem('token', response.accessToken)

      return response
    } catch (err) {
      console.error(err)

      error.value = err?.response?.data?.message || 'Invalid email or password'
      user.value = null
      token.value = null
      localStorage.removeItem('token')

      throw err

    } finally {
      loading.value = false
    }
  }

  /** Clear all auth state and remove JWT from storage */
  const logout = () => {
    user.value = null
    token.value = null
    error.value = ''
    localStorage.removeItem('token')
  }

  return {
    // state
    user,
    token,
    loading,
    error,
    // getters
    isAuthenticated,
    tenantName,
    isSuperadmin,
    userInitials,
    // actions
    initAuth,
    login,
    logout,
  }
})
