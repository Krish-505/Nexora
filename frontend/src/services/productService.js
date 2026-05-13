import apiClient from './apiClient'

/**
 * Fetch all products for the authenticated tenant.
 * GET /products — tenant resolved from JWT by the backend.
 */
export const fetchProducts = async () => {
  const response = await apiClient.get('/products')
  return response.data
}

/**
 * Create a new product.
 * POST /products
 */
export const createProduct = async (payload) => {
  const response = await apiClient.post('/products', payload)
  return response.data
}

/**
 * Update an existing product.
 * PATCH /products/:id
 */
export const updateProductApi = async (id, payload) => {
  const response = await apiClient.patch(`/products/${id}`, payload)
  return response.data
}

/**
 * Delete a product by ID.
 * DELETE /products/:id
 */
export const deleteProductApi = async (id) => {
  await apiClient.delete(`/products/${id}`)
  return id
}