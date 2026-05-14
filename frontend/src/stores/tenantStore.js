import { defineStore } from 'pinia'

import { ref } from 'vue'

import { getTenants, createTenant, toggleTenant } from '../services/tenantService'

export const useTenantStore = defineStore('tenant', () => {
  // ─── STATE ────────────────────────
  const tenants = ref([])

  const loading = ref(false)

  const error = ref('')

  // ─── GET TENANTS ──────────────────
  const fetchTenants = async () => {
    try {
      loading.value = true

      error.value = ''

      tenants.value = await getTenants()
    } catch (err) {
      console.error(err)

      error.value = 'Failed to load tenants'
    } finally {
      loading.value = false
    }
  }

  // ─── CREATE TENANT ────────────────
  const addTenant = async (payload) => {
    try {
      const tenant = await createTenant(payload)

      tenants.value.unshift(tenant)
    } catch (err) {
      console.error(err)

      throw err
    }
  }

  // ─── TOGGLE TENANT ────────────────
  const toggleTenantStatus = async (id) => {
    try {
      const updatedTenant = await toggleTenant(id)

      const index = tenants.value.findIndex((tenant) => tenant.id === id)

      if (index !== -1) {
        tenants.value[index] = updatedTenant
      }
    } catch (err) {
      console.error(err)
    }
  }

  return {
    tenants,
    loading,
    error,

    fetchTenants,
    addTenant,
    toggleTenantStatus,
  }
})
