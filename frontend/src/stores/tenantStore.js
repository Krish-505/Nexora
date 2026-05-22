import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createTenant,
  deleteTenant,
  getTenants,
  toggleTenant,
  updateTenantTheme,
} from '../services/tenantService'
import { removeEntityById, upsertEntityById } from './entityReconciliation'

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
      tenants.value = upsertEntityById(tenants.value, updatedTenant)

      return updatedTenant
    } finally {
      setProcessing(id, false)
    }
  }

  const removeTenant = async (id) => {
    try {
      setProcessing(id, true)
      const response = await deleteTenant(id)
      tenants.value = removeEntityById(tenants.value, id)
      return response
    } finally {
      setProcessing(id, false)
    }
  }

  const updateTheme = async (id, theme) => {
    try {
      setProcessing(id, true)
      const updatedTenant = await updateTenantTheme(id, theme)
      tenants.value = upsertEntityById(tenants.value, updatedTenant)

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

    tenants.value = upsertEntityById(tenants.value, {
      id: tenantId,
      ...(payload.tenant || {}),
      name: payload.tenantName || payload.tenant?.name,
      theme: nextTheme,
    })
  }

  const applyRealtimeEvent = (event) => {
    const payload = event?.payload || {}

    switch (event?.type) {
      case 'TENANT_CREATED':
      case 'TENANT_ACTIVATED':
      case 'TENANT_DEACTIVATED':
        if (payload.tenant) {
          tenants.value = upsertEntityById(tenants.value, payload.tenant)
        }
        break
      case 'TENANT_THEME_UPDATED':
        applyRealtimeThemeUpdate(event)
        break
      case 'TENANT_DELETED':
        tenants.value = removeEntityById(
          tenants.value,
          event.tenantId || payload.tenant?.id
        )
        break
      default:
        break
    }
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
    applyRealtimeEvent,
  }
})
