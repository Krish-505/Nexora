import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchProducts,
  createProduct,
  updateProductApi,
  deleteProductApi,
} from '../services/productService'

export const useProductStore = defineStore('products', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const products = ref([])
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')

  // ─── Getters ──────────────────────────────────────────────────────────────
  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    const q = searchQuery.value.toLowerCase()
    return products.value.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    )
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Load all products from the real backend /products endpoint */
  const loadProducts = async () => {
    try {
      loading.value = true
      error.value = ''
      products.value = await fetchProducts()
    } catch (err) {
      error.value =
        err?.response?.data?.message || 'Failed to load products.'
    } finally {
      loading.value = false
    }
  }

  /** Create a new product via backend and prepend to list */
  const addProduct = async (payload) => {
    try {
      error.value = ''
      const created = await createProduct(payload)
      products.value.unshift(created)
      return created
    } catch (err) {
      error.value =
        err?.response?.data?.message || 'Failed to create product.'
      throw err
    }
  }

  /** Update an existing product via backend */
  const updateProduct = async (id, payload) => {
    try {
      error.value = ''
      const updated = await updateProductApi(id, payload)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) products.value[index] = updated
      return updated
    } catch (err) {
      error.value =
        err?.response?.data?.message || 'Failed to update product.'
      throw err
    }
  }

  /** Delete a product via backend and remove from list */
  const deleteProduct = async (id) => {
    try {
      error.value = ''
      await deleteProductApi(id)
      products.value = products.value.filter((p) => p.id !== id)
    } catch (err) {
      error.value =
        err?.response?.data?.message || 'Failed to delete product.'
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    searchQuery,
    filteredProducts,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  }
})