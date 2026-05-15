import apiClient from './apiClient'

const compactFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value != null)
  )

export const getAuditLogs = async (filters = {}) => {
  const response = await apiClient.get('/audit', {
    params: compactFilters(filters),
  })

  return response.data
}
