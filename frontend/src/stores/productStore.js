import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchProducts,
  createProduct,
  updateProductApi,
  deleteProductApi,
} from '../services/productService'
import {
  removeEntitiesWhere,
  removeEntityById,
  upsertEntityById,
} from './entityReconciliation'

export const useProductStore = defineStore('products', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const products = ref([])
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const categoryFilter = ref('')
  const tenantFilter = ref('')

  // ─── Getters ──────────────────────────────────────────────────────────────
  const filteredProducts = computed(() => {
    const q = searchQuery.value.toLowerCase()

    return products.value.filter(
      (product) =>
        (!tenantFilter.value || product.tenantId === tenantFilter.value) &&
        (!categoryFilter.value || product.categoryId === categoryFilter.value) &&
        (!q ||
          product.name?.toLowerCase().includes(q) ||
          product.sku?.toLowerCase().includes(q) ||
          product.categoryName?.toLowerCase().includes(q))
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
      products.value = upsertEntityById(products.value, created)
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
      products.value = upsertEntityById(products.value, updated)
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
      products.value = removeEntityById(products.value, id)
    } catch (err) {
      error.value =
        err?.response?.data?.message || 'Failed to delete product.'
      throw err
    }
  }

  const applyCategoryUpdated = (category) => {
    if (!category?.id) return

    products.value = products.value.map((product) =>
      product.categoryId === category.id
        ? {
            ...product,
            categoryName: category.name,
          }
        : product
    )
  }

  const applyRealtimeEvent = (event) => {
    const payload = event?.payload || {}

    switch (event?.type) {
      case 'PRODUCT_CREATED':
      case 'PRODUCT_UPDATED':
        if (payload.product) {
          products.value = upsertEntityById(products.value, payload.product)
        }
        break
      case 'PRODUCT_DELETED':
        products.value = removeEntityById(products.value, payload.product)
        break
      case 'CATEGORY_UPDATED':
        applyCategoryUpdated(payload.category)
        break
      case 'TENANT_DELETED':
        products.value = removeEntitiesWhere(
          products.value,
          (product) => product.tenantId === (event.tenantId || payload.tenant?.id)
        )
        break
      default:
        break
    }
  }

  return {
    products,
    loading,
    error,
    searchQuery,
    categoryFilter,
    tenantFilter,
    filteredProducts,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    applyRealtimeEvent,
  }
})
