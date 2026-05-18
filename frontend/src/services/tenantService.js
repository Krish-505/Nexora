import apiClient from './apiClient'
import { updateTenantThemeApi } from './themeService'

export const getTenants = async () => {
  const response = await apiClient.get('/tenants')

  return response.data
}

export const createTenant = async (payload) => {
  const response = await apiClient.post('/tenants', payload)

  return response.data
}

export const toggleTenant = async (id) => {
  const response = await apiClient.patch(`/tenants/${id}/toggle`)

  return response.data
}

export const deleteTenant = async (id) => {
  const response = await apiClient.delete(`/tenants/${id}`)

  return response.data
}

export const updateTenantTheme = updateTenantThemeApi
