import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createTenant,
  deleteTenant,
  getTenants,
  toggleTenant,
  updateTenantTheme,
} from '../services/tenantService'

export const useTenantStore = defineStore('tenant', () => {
  const tenants = ref([])
  const loading = ref(false)
  const error = ref('')
  const creating = ref(false)
  const processingIds = ref([])

  const isProcessing = computed(() => (id) => processingIds.value.includes(id))

  const setProcessing = (id, active) => {
    if (active) {
      if (!processingIds.value.includes(id)) {
        processingIds.value = [...processingIds.value, id]
      }

      return
    }

    processingIds.value = processingIds.value.filter((entry) => entry !== id)
  }

  const fetchTenants = async () => {
    try {
      loading.value = true
      error.value = ''
      tenants.value = await getTenants()
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load tenants'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addTenant = async (payload) => {
    try {
      creating.value = true
      const response = await createTenant(payload)
      await fetchTenants()
      return response
    } finally {
      creating.value = false
    }
  }

  const toggleTenantStatus = async (id) => {
    try {
      setProcessing(id, true)
      const updatedTenant = await toggleTenant(id)
      const index = tenants.value.findIndex((tenant) => tenant.id === id)

      if (index !== -1) {
        tenants.value[index] = updatedTenant
      }

      return updatedTenant
    } finally {
      setProcessing(id, false)
    }
  }

  const removeTenant = async (id) => {
    try {
      setProcessing(id, true)
      const response = await deleteTenant(id)
      tenants.value = tenants.value.filter((tenant) => tenant.id !== id)
      return response
    } finally {
      setProcessing(id, false)
    }
  }

  const updateTheme = async (id, theme) => {
    try {
      setProcessing(id, true)
      const updatedTenant = await updateTenantTheme(id, theme)
      const index = tenants.value.findIndex((tenant) => tenant.id === id)

      if (index !== -1) {
        tenants.value[index] = updatedTenant
      }

      return updatedTenant
    } finally {
      setProcessing(id, false)
    }
  }

  const applyRealtimeThemeUpdate = (event) => {
    const payload = event?.payload || {}
    const tenantId = event?.tenantId || payload.tenantId || payload.tenant?.id
    const nextTheme = payload.theme || payload.tenant?.theme

    if (!tenantId || !nextTheme) return

    tenants.value = tenants.value.map((tenant) => {
      if (tenant.id !== tenantId) return tenant

      return {
        ...tenant,
        ...(payload.tenant || {}),
        name: payload.tenantName || tenant.name,
        theme: nextTheme,
      }
    })
  }

  return {
    tenants,
    loading,
    error,
    creating,
    processingIds,
    isProcessing,
    fetchTenants,
    addTenant,
    toggleTenantStatus,
    removeTenant,
    updateTheme,
    applyRealtimeThemeUpdate,
  }
})
