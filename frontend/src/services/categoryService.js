import apiClient from './apiClient'

export const fetchCategories = async () => {
  const response = await apiClient.get('/categories')

  return response.data
}

export const createCategory = async (payload) => {
  const response = await apiClient.post('/categories', payload)

  return response.data
}

export const updateCategoryApi = async (id, payload) => {
  const response = await apiClient.patch(`/categories/${id}`, payload)

  return response.data
}

export const deleteCategoryApi = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`)

  return response.data
}
