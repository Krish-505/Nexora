import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createCategory,
  deleteCategoryApi,
  fetchCategories,
  updateCategoryApi,
} from '../services/categoryService'
import {
  removeEntitiesWhere,
  removeEntityById,
  upsertEntityById,
} from './entityReconciliation'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const tenantFilter = ref('')

  const filteredCategories = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return categories.value.filter(
      (category) =>
        (!tenantFilter.value || category.tenantId === tenantFilter.value) &&
        (!query ||
          category.name.toLowerCase().includes(query) ||
          category.slug.toLowerCase().includes(query) ||
          category.tenantId?.toLowerCase().includes(query))
    )
  })

  const loadCategories = async () => {
    try {
      loading.value = true
      error.value = ''
      categories.value = await fetchCategories()
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load categories.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (payload) => {
    try {
      error.value = ''
      const created = await createCategory(payload)
      categories.value = upsertEntityById(categories.value, created)
      return created
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to create category.'
      throw err
    }
  }

  const updateCategory = async (id, payload) => {
    try {
      error.value = ''
      const updated = await updateCategoryApi(id, payload)
      categories.value = upsertEntityById(categories.value, updated)

      return updated
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to update category.'
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      error.value = ''
      const response = await deleteCategoryApi(id)
      categories.value = removeEntityById(categories.value, id)
      return response
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to delete category.'
      throw err
    }
  }

  const applyRealtimeEvent = (event) => {
    const payload = event?.payload || {}

    switch (event?.type) {
      case 'CATEGORY_CREATED':
      case 'CATEGORY_UPDATED':
        if (payload.category) {
          categories.value = upsertEntityById(categories.value, payload.category)
        }
        break
      case 'CATEGORY_DELETED':
        categories.value = removeEntityById(categories.value, payload.category)
        break
      case 'TENANT_DELETED':
        categories.value = removeEntitiesWhere(
          categories.value,
          (category) => category.tenantId === (event.tenantId || payload.tenant?.id)
        )
        break
      default:
        break
    }
  }

  return {
    categories,
    loading,
    error,
    searchQuery,
    tenantFilter,
    filteredCategories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    applyRealtimeEvent,
  }
})
