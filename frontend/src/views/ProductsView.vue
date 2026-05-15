<template>
  <div class="flex flex-col gap-6 h-full">
    <div v-if="authStore.isSuperadmin" class="superadmin-banner">
      <h3>Superadmin View</h3>

      <p>Viewing products across all tenants.</p>
    </div>
    <!-- ─── Page Header ──────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
        <p class="text-sm text-slate-500 mt-1">
          Manage your tenant's product catalog.
          <span v-if="productStore.products.length" class="font-medium text-slate-700">
            {{ productStore.products.length }} total
          </span>
        </p>
      </div>
      <button
        v-if="!authStore.isSuperadmin"
        id="btn-add-product"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-primary-500/20 transition-all shrink-0"
        @click="openAddModal"
      >
        <PlusIcon class="w-4 h-4" />
        Add Product
      </button>
    </div>

    <!-- ─── Error Banner ─────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="productStore.error"
        class="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
      >
        <AlertCircleIcon class="w-4 h-4 shrink-0 text-red-500" />
        {{ productStore.error }}
        <button
          class="ml-auto text-red-500 hover:text-red-700 transition-colors"
          @click="productStore.error = ''"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- ─── Search & Filters ─────────────────────────────────────────── -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
      <div class="flex flex-col sm:flex-row gap-3 items-center">
        <!-- Search -->
        <div class="relative w-full sm:w-72">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon class="w-4 h-4 text-slate-400" />
          </div>
          <input
            v-model="productStore.searchQuery"
            type="search"
            placeholder="Search by name, SKU or category…"
            class="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors placeholder-slate-400"
          />
        </div>

        <select
          v-if="authStore.isSuperadmin"
          v-model="productStore.tenantFilter"
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 sm:w-56"
        >
          <option value="">All tenants</option>
          <option v-for="tenant in tenantStore.tenants" :key="tenant.id" :value="tenant.id">
            {{ tenant.name }}
          </option>
        </select>

        <select
          v-model="productStore.categoryFilter"
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 sm:w-56"
        >
          <option value="">All categories</option>
          <option
            v-for="category in categoryOptions"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>

        <!-- Refresh -->
        <button
          class="ml-auto flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          :class="{ 'opacity-50 cursor-not-allowed': productStore.loading }"
          :disabled="productStore.loading"
          @click="productStore.loadProducts()"
        >
          <RefreshCwIcon class="w-3.5 h-3.5" :class="{ 'animate-spin': productStore.loading }" />
          Refresh
        </button>
      </div>
    </div>

    <!-- ─── Table ─────────────────────────────────────────────────────── -->
    <div class="flex-1 min-h-0">
      <AppTable
        :columns="columns"
        :data="productStore.filteredProducts"
        :loading="productStore.loading"
      >
        <!-- Empty state -->
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 gap-4">
            <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <PackageIcon class="w-7 h-7 text-slate-400" />
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-slate-700">No products found</p>
              <p class="text-xs text-slate-500 mt-1">
                {{
                  productStore.searchQuery
                    ? 'Try adjusting your search.'
                    : 'Start by adding your first product.'
                }}
              </p>
            </div>
            <button
              v-if="!authStore.isSuperadmin && !productStore.searchQuery && !productStore.categoryFilter"
              class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors"
              @click="openAddModal"
            >
              <PlusIcon class="w-4 h-4" />
              Add Product
            </button>
          </div>
        </template>

        <!-- ID column -->
        <template #cell-id="{ value }">
          <span class="font-mono text-xs text-slate-400">
            #{{ String(value).padStart(4, '0') }}
          </span>
        </template>

        <!-- Name column -->
        <template #cell-name="{ value }">
          <span class="font-medium text-slate-900">{{ value }}</span>
        </template>

        <!-- SKU column -->
        <template #cell-sku="{ value }">
          <span class="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {{ value || '—' }}
          </span>
        </template>

        <!-- Category column -->
        <template #cell-categoryName="{ value }">
          <span
            v-if="value"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100"
          >
            {{ value }}
          </span>
          <span v-else class="text-slate-400">—</span>
        </template>

        <template #cell-tenantId="{ value }">
          <span class="text-sm font-medium text-slate-700">
            {{ tenantName(value) }}
          </span>
        </template>

        <!-- Price column -->
        <template #cell-price="{ value }">
          <span class="font-medium text-slate-800">
            {{ value != null ? `$${Number(value).toFixed(2)}` : '—' }}
          </span>
        </template>

        <!-- Stock column -->
        <template #cell-stock="{ value }">
          <span
            class="inline-flex items-center gap-1.5 text-xs font-semibold"
            :class="
              value == null
                ? 'text-slate-400'
                : value > 10
                  ? 'text-emerald-600'
                  : value > 0
                    ? 'text-amber-600'
                    : 'text-red-600'
            "
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="
                value == null
                  ? 'bg-slate-300'
                  : value > 10
                    ? 'bg-emerald-500'
                    : value > 0
                      ? 'bg-amber-500'
                      : 'bg-red-500'
              "
            />
            {{ value != null ? value : '—' }}
          </span>
        </template>

        <!-- Actions column -->
        <template #cell-actions="{ row }">
          <div v-if="!authStore.isSuperadmin" class="flex items-center justify-end gap-1">
            <button
              class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit product"
              @click="openEditModal(row)"
            >
              <Edit2Icon class="w-3.5 h-3.5" />
            </button>
            <button
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete product"
              @click="openDeleteModal(row)"
            >
              <Trash2Icon class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- ─── Add / Edit Modal ─────────────────────────────────────────── -->
    <AppModal
      v-model="isModalOpen"
      :title="isEditing ? 'Edit Product' : 'Add New Product'"
      max-width="520px"
    >
      <div class="space-y-4">
        <!-- Name -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700">
            Product Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="e.g. Wireless Headphones"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            :class="{ 'border-red-300': formErrors.name }"
            @keyup.enter="handleSave"
          />
          <p v-if="formErrors.name" class="text-xs text-red-600">{{ formErrors.name }}</p>
        </div>

        <!-- SKU + Category row -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700">SKU</label>
            <input
              v-model="formData.sku"
              type="text"
              placeholder="e.g. WH-001"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700">
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.categoryId"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
              :class="{ 'border-red-300': formErrors.categoryId }"
            >
              <option value="">Select category</option>
              <option
                v-for="category in categoryStore.categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="formErrors.categoryId" class="text-xs text-red-600">
              {{ formErrors.categoryId }}
            </p>
          </div>
        </div>

        <!-- Price + Stock row -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700">Price ($)</label>
            <input
              v-model.number="formData.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700">Stock</label>
            <input
              v-model.number="formData.stock"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <button
          class="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-sm shadow-primary-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          :disabled="isSaving"
          @click="handleSave"
        >
          <Loader2Icon v-if="isSaving" class="w-3.5 h-3.5 animate-spin" />
          {{ isEditing ? 'Save Changes' : 'Create Product' }}
        </button>
      </template>
    </AppModal>
  </div>
  <BaseModal
    v-model="showDeleteModal"
    title="Delete Product"
    :description="`Are you sure you want to delete ${selectedProduct?.name || 'this product'}?`"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useTenantStore } from '../stores/tenantStore'
import AppTable from '../components/ui/AppTable.vue'
import AppModal from '../components/ui/AppModal.vue'
import BaseModal from '../components/BaseModal.vue'
import {
  Plus as PlusIcon,
  Search as SearchIcon,
  Edit2 as Edit2Icon,
  Trash2 as Trash2Icon,
  Package as PackageIcon,
  RefreshCw as RefreshCwIcon,
  Loader2 as Loader2Icon,
  AlertCircle as AlertCircleIcon,
  X as XIcon,
} from 'lucide-vue-next'

const productStore = useProductStore()
const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const tenantStore = useTenantStore()
const showDeleteModal = ref(false)
const deleting = ref(false)

const selectedProduct = ref(null)

// ─── Table columns ──────────────────────────────────────────────────────────
const columns = computed(() => {
  const baseColumns = [
    { key: 'id', label: 'ID', class: 'w-20' },
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU', class: 'w-28 hidden md:table-cell' },
    { key: 'categoryName', label: 'Category', class: 'hidden lg:table-cell' },
  ]

  if (authStore.isSuperadmin) {
    baseColumns.push({ key: 'tenantId', label: 'Tenant', class: 'hidden lg:table-cell' })
  }

  return [
    ...baseColumns,
    { key: 'price', label: 'Price', class: 'w-28 hidden sm:table-cell' },
    { key: 'stock', label: 'Stock', class: 'w-24 hidden sm:table-cell' },
    { key: 'actions', label: '', class: 'w-20 text-right' },
  ]
})

const categoryOptions = computed(() => {
  if (!authStore.isSuperadmin || !productStore.tenantFilter) {
    return categoryStore.categories
  }

  return categoryStore.categories.filter(
    (category) => category.tenantId === productStore.tenantFilter
  )
})

const tenantName = (tenantId) =>
  tenantStore.tenants.find((tenant) => tenant.id === tenantId)?.name || tenantId

// ─── Modal state ────────────────────────────────────────────────────────────
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const formErrors = ref({})
const emptyForm = () => ({ id: null, name: '', sku: '', categoryId: '', price: null, stock: null })
const formData = ref(emptyForm())

const openAddModal = () => {
  isEditing.value = false
  formData.value = emptyForm()
  formErrors.value = {}
  isModalOpen.value = true
}

const openEditModal = (product) => {
  isEditing.value = true
  formData.value = {
    id: product.id,
    name: product.name ?? '',
    sku: product.sku ?? '',
    categoryId: product.categoryId ?? '',
    price: product.price ?? null,
    stock: product.stock ?? null,
  }
  formErrors.value = {}
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// ─── Validation ─────────────────────────────────────────────────────────────
const validate = () => {
  const errors = {}
  if (!formData.value.name?.trim()) errors.name = 'Product name is required.'
  if (!formData.value.categoryId) errors.categoryId = 'Select a category.'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

// ─── Save (create or update) ────────────────────────────────────────────────
const handleSave = async () => {
  if (!validate()) return
  isSaving.value = true
  try {
    const payload = {
      name: formData.value.name.trim(),
      sku: formData.value.sku?.trim() || undefined,
      categoryId: formData.value.categoryId,
      price: formData.value.price ?? undefined,
      stock: formData.value.stock ?? undefined,
    }

    if (isEditing.value) {
      await productStore.updateProduct(formData.value.id, payload)
    } else {
      await productStore.addProduct(payload)
    }
    closeModal()
  } finally {
    isSaving.value = false
  }
}

// ─── Delete ─────────────────────────────────────────────────────────────────
const openDeleteModal = (product) => {
  selectedProduct.value = product

  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedProduct.value) return

  try {
    deleting.value = true
    await productStore.deleteProduct(selectedProduct.value.id)

    showDeleteModal.value = false

    selectedProduct.value = null
  }
   
  catch (error) {
    console.error(error)
  } finally {
    deleting.value = false
  }
}

// ─── Init ────────────────────────────────────────────────────────────────────
onMounted(() => {
  productStore.loadProducts()
  categoryStore.loadCategories()
  if (authStore.isSuperadmin) {
    tenantStore.fetchTenants()
  }
})

watch(
  () => productStore.tenantFilter,
  () => {
    if (
      productStore.categoryFilter &&
      !categoryOptions.value.some((category) => category.id === productStore.categoryFilter)
    ) {
      productStore.categoryFilter = ''
    }
  }
)
</script>

<style scoped>
.superadmin-banner {
  margin-bottom: 16px;

  padding: 16px;

  border-radius: 12px;

  background: #1e293b;

  color: white;
}
</style>
