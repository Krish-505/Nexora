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
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_DELETED',
  'CATEGORY_CREATED',
  'CATEGORY_UPDATED',
  'CATEGORY_DELETED',
]

export const useAuditStore = defineStore('audit', () => {
  const logs = ref([])
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
    loading,
    error,
    filters,
    filteredLogs,
    loadLogs,
    setFilter,
    resetFilters,
  }
})
