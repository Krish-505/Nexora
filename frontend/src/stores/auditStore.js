import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { getAuditLogs } from '../services/auditService'

export const auditActions = [
  'LOGIN_SUCCESS',
  'LOGOUT',
  'TENANT_CREATED',
  'TENANT_DELETED',
  'TENANT_ACTIVATED',
  'TENANT_DEACTIVATED',
  'TENANT_THEME_UPDATED',
  'LOW_STOCK_DETECTED',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_DELETED',
  'CATEGORY_CREATED',
  'CATEGORY_UPDATED',
  'CATEGORY_DELETED',
]

export const useAuditStore = defineStore('audit', () => {
  const logs = ref([])
  const recentLogIds = ref([])
  const loading = ref(false)
  const error = ref('')
  const filters = reactive({
    action: '',
    role: '',
    tenantId: '',
    search: '',
  })

  const filteredLogs = computed(() => {
    const query = filters.search.trim().toLowerCase()

    if (!query) return logs.value

    return logs.value.filter((log) =>
      [log.action, log.message, log.performedBy, log.role, log.tenantId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  })

  const loadLogs = async () => {
    try {
      loading.value = true
      error.value = ''
      logs.value = await getAuditLogs({
        action: filters.action,
        role: filters.role,
        tenantId: filters.tenantId,
      })
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load audit logs.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const matchesActiveServerFilters = (log) => {
    if (!log) return false
    if (filters.action && log.action !== filters.action) return false
    if (filters.role && log.role !== filters.role) return false
    if (filters.tenantId && log.tenantId !== filters.tenantId) return false

    return true
  }

  const markRecent = (id) => {
    recentLogIds.value = [id, ...recentLogIds.value.filter((entry) => entry !== id)].slice(0, 10)

    window.setTimeout(() => {
      recentLogIds.value = recentLogIds.value.filter((entry) => entry !== id)
    }, 3500)
  }

  const receiveRealtimeAuditLog = (log) => {
    if (!matchesActiveServerFilters(log)) return

    const existingIndex = logs.value.findIndex((entry) => entry.id === log.id)

    if (existingIndex !== -1) {
      logs.value[existingIndex] = log
      markRecent(log.id)
      return
    }

    logs.value = [log, ...logs.value].slice(0, 250)
    markRecent(log.id)
  }

  const setFilter = (key, value) => {
    filters[key] = value
  }

  const resetFilters = () => {
    filters.action = ''
    filters.role = ''
    filters.tenantId = ''
    filters.search = ''
  }

  return {
    logs,
    recentLogIds,
    loading,
    error,
    filters,
    filteredLogs,
    loadLogs,
    receiveRealtimeAuditLog,
    setFilter,
    resetFilters,
  }
})
