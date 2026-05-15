import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createCategory,
  deleteCategoryApi,
  fetchCategories,
  updateCategoryApi,
} from '../services/categoryService'

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
      categories.value.unshift(created)
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
      const index = categories.value.findIndex((category) => category.id === id)

      if (index !== -1) {
        categories.value[index] = updated
      }

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
      categories.value = categories.value.filter((category) => category.id !== id)
      return response
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to delete category.'
      throw err
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
  }
})
