import apiClient from './apiClient'

export const getSuperadminDashboard = async () => {
  const response = await apiClient.get('/dashboard/superadmin')

  return response.data
}

export const getTenantDashboard = async () => {
  const response = await apiClient.get('/dashboard/tenant')

  return response.data
}
