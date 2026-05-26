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
  const realtimeUpdatedAt = ref('')
  const recentMetricKeys = ref([])

  const hasData = computed(() => !!data.value)

  const productContribution = (product = {}) => ({
    activeProducts: Number(product.stock) > 0 ? 1 : 0,
    lowStockProducts: Number(product.stock) < 5 ? 1 : 0,
    totalInventoryValue: Number(product.price || 0) * Number(product.stock || 0),
  })

  const markRealtimeUpdate = (keys = []) => {
    realtimeUpdatedAt.value = new Date().toISOString()
    recentMetricKeys.value = [...new Set([...keys, ...recentMetricKeys.value])].slice(0, 8)

    window.setTimeout(() => {
      recentMetricKeys.value = recentMetricKeys.value.filter((key) => !keys.includes(key))
    }, 3000)
  }

  const patchData = (patch, keys = []) => {
    if (!data.value) return

    data.value = {
      ...data.value,
      ...patch,
    }
    markRealtimeUpdate(keys)
  }

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
    realtimeUpdatedAt.value = ''
    recentMetricKeys.value = []
  }

  const applyProductCreated = (product) => {
    if (!data.value || !product) return

    if (role.value === 'superadmin') {
      patchData(
        { totalProducts: (data.value.totalProducts || 0) + 1 },
        ['totalProducts']
      )
      return
    }

    const contribution = productContribution(product)

    patchData(
      {
        totalProducts: (data.value.totalProducts || 0) + 1,
        activeProducts: (data.value.activeProducts || 0) + contribution.activeProducts,
        lowStockProducts: (data.value.lowStockProducts || 0) + contribution.lowStockProducts,
        totalInventoryValue:
          (data.value.totalInventoryValue || 0) + contribution.totalInventoryValue,
      },
      ['totalProducts', 'activeProducts', 'lowStockProducts', 'totalInventoryValue']
    )
  }

  const applyProductUpdated = (product, previousProduct) => {
    if (!data.value || !product || !previousProduct || role.value === 'superadmin') return

    const next = productContribution(product)
    const previous = productContribution(previousProduct)

    patchData(
      {
        activeProducts:
          (data.value.activeProducts || 0) + next.activeProducts - previous.activeProducts,
        lowStockProducts:
          (data.value.lowStockProducts || 0) + next.lowStockProducts - previous.lowStockProducts,
        totalInventoryValue:
          (data.value.totalInventoryValue || 0) +
          next.totalInventoryValue -
          previous.totalInventoryValue,
      },
      ['activeProducts', 'lowStockProducts', 'totalInventoryValue']
    )
  }

  const applyProductDeleted = (product) => {
    if (!data.value || !product) return

    if (role.value === 'superadmin') {
      patchData(
        { totalProducts: Math.max((data.value.totalProducts || 0) - 1, 0) },
        ['totalProducts']
      )
      return
    }

    const contribution = productContribution(product)

    patchData(
      {
        totalProducts: Math.max((data.value.totalProducts || 0) - 1, 0),
        activeProducts: Math.max(
          (data.value.activeProducts || 0) - contribution.activeProducts,
          0
        ),
        lowStockProducts: Math.max(
          (data.value.lowStockProducts || 0) - contribution.lowStockProducts,
          0
        ),
        totalInventoryValue: Math.max(
          (data.value.totalInventoryValue || 0) - contribution.totalInventoryValue,
          0
        ),
      },
      ['totalProducts', 'activeProducts', 'lowStockProducts', 'totalInventoryValue']
    )
  }

  const applyTenantCreated = () => {
    if (!data.value || role.value !== 'superadmin') return

    patchData(
      {
        totalTenants: (data.value.totalTenants || 0) + 1,
        activeTenants: (data.value.activeTenants || 0) + 1,
        totalTenantAdmins: (data.value.totalTenantAdmins || 0) + 1,
        totalUsers: (data.value.totalUsers || 0) + 1,
      },
      ['totalTenants', 'activeTenants', 'totalTenantAdmins', 'totalUsers']
    )
  }

  const applyTenantLifecycle = (active) => {
    if (!data.value || role.value !== 'superadmin') return

    patchData(
      {
        activeTenants: Math.max((data.value.activeTenants || 0) + (active ? 1 : -1), 0),
        inactiveTenants: Math.max((data.value.inactiveTenants || 0) + (active ? -1 : 1), 0),
      },
      ['activeTenants', 'inactiveTenants']
    )
  }

  const applyTenantDeleted = (payload = {}) => {
    if (!data.value || role.value !== 'superadmin') return

    const deletedTenant = payload.tenant || {}
    const deletedUsers = Number(payload.deletedUsers || 0)
    const deletedTenantAdmins = Number(payload.deletedTenantAdmins ?? deletedUsers)
    const deletedProducts = Number(payload.deletedProducts || 0)
    const wasActive = deletedTenant.active !== false

    patchData(
      {
        totalTenants: Math.max((data.value.totalTenants || 0) - 1, 0),
        activeTenants: Math.max(
          (data.value.activeTenants || 0) - (wasActive ? 1 : 0),
          0
        ),
        inactiveTenants: Math.max(
          (data.value.inactiveTenants || 0) - (wasActive ? 0 : 1),
          0
        ),
        totalProducts: Math.max((data.value.totalProducts || 0) - deletedProducts, 0),
        totalTenantAdmins: Math.max(
          (data.value.totalTenantAdmins || 0) - deletedTenantAdmins,
          0
        ),
        totalUsers: Math.max((data.value.totalUsers || 0) - deletedUsers, 0),
      },
      [
        'totalTenants',
        'activeTenants',
        'inactiveTenants',
        'totalProducts',
        'totalTenantAdmins',
        'totalUsers',
      ]
    )
  }

  const applyRealtimeEvent = (event) => {
    switch (event?.type) {
      case 'PRODUCT_CREATED':
        applyProductCreated(event.payload?.product)
        break
      case 'PRODUCT_UPDATED':
        applyProductUpdated(event.payload?.product, event.payload?.previousProduct)
        break
      case 'PRODUCT_DELETED':
        applyProductDeleted(event.payload?.product)
        break
      case 'TENANT_CREATED':
        applyTenantCreated()
        break
      case 'TENANT_ACTIVATED':
        applyTenantLifecycle(true)
        break
      case 'TENANT_DEACTIVATED':
        applyTenantLifecycle(false)
        break
      case 'TENANT_DELETED':
        applyTenantDeleted(event.payload)
        break
      case 'CATEGORY_CREATED':
      case 'CATEGORY_DELETED':
        markRealtimeUpdate(['catalog'])
        break
      case 'LOW_STOCK_DETECTED':
        markRealtimeUpdate(['lowStockProducts'])
        break
      default:
        break
    }
  }

  return {
    data,
    role,
    loading,
    error,
    realtimeUpdatedAt,
    recentMetricKeys,
    hasData,
    loadDashboard,
    applyRealtimeEvent,
    reset,
  }
})
