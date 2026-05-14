import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getSuperadminDashboard,
  getTenantDashboard,
} from '../services/dashboardService'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref(null)
  const role = ref('')
  const loading = ref(false)
  const error = ref('')

  const hasData = computed(() => !!data.value)

  const loadDashboard = async (userRole) => {
    try {
      loading.value = true
      error.value = ''
      role.value = userRole

      data.value =
        userRole === 'superadmin'
          ? await getSuperadminDashboard()
          : await getTenantDashboard()

      return data.value
    } catch (err) {
      data.value = null
      error.value =
        err?.response?.data?.message || 'Failed to load dashboard metrics.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    role.value = ''
    loading.value = false
    error.value = ''
  }

  return {
    data,
    role,
    loading,
    error,
    hasData,
    loadDashboard,
    reset,
  }
})
