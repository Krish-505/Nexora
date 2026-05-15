<template>
  <div>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="authStore.isSuperadmin ? 'Platform Catalog' : authStore.tenantName"
      title="Categories"
      description="Organize inventory into tenant-scoped category entities used by products."
    >
      <template #actions>
        <AppButton variant="outline" :loading="categoryStore.loading" @click="refreshCategories">
          <RefreshCwIcon class="mr-2 h-4 w-4" />
          Refresh
        </AppButton>
        <AppButton v-if="!authStore.isSuperadmin" @click="openCreateModal">
          <PlusIcon class="mr-2 h-4 w-4" />
          Create Category
        </AppButton>
      </template>
    </PageHeader>

    <section
      v-if="authStore.isSuperadmin"
      class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Superadmin can review platform categories, while tenant admins manage category changes for
      their own inventory.
    </section>

    <SectionCard body-class="p-4">
      <div class="flex flex-col gap-3 md:flex-row">
      <div class="relative w-full md:max-w-md">
        <SearchIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="categoryStore.searchQuery"
          type="search"
          placeholder="Search categories..."
          class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <AppSelect
        v-if="authStore.isSuperadmin"
        v-model="categoryStore.tenantFilter"
        class="md:w-64"
      >
        <option value="">All tenants</option>
        <option v-for="tenant in tenantStore.tenants" :key="tenant.id" :value="tenant.id">
          {{ tenant.name }}
        </option>
      </AppSelect>
      </div>
    </SectionCard>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="categoryStore.error"
        class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div>
          <p class="font-semibold">Category operation failed</p>
          <p class="mt-1">{{ categoryStore.error }}</p>
        </div>
      </div>
    </Transition>

    <div v-if="categoryStore.loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="index in 6"
        :key="index"
        class="h-36 animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="h-4 w-32 rounded bg-slate-200"></div>
        <div class="mt-6 h-3 w-40 rounded bg-slate-100"></div>
        <div class="mt-5 h-8 w-24 rounded bg-slate-100"></div>
      </div>
    </div>

    <div
      v-else-if="!categoryStore.filteredCategories.length"
      class="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
    >
      <TagsIcon class="h-10 w-10 text-slate-300" />
      <p class="mt-4 text-sm font-semibold text-slate-700">No categories found</p>
      <p class="mt-1 max-w-md text-sm text-slate-500">
        {{
          categoryStore.searchQuery
            ? 'Try a different search term.'
            : 'Create categories before assigning products to them.'
        }}
      </p>
      <AppButton v-if="!authStore.isSuperadmin" class="mt-5" @click="openCreateModal">
        Create Category
      </AppButton>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="category in categoryStore.filteredCategories"
        :key="category.id"
        class="nx-surface-strong nx-card-hover rounded-2xl p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <span class="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
              {{ category.name }}
            </span>
            <p class="mt-3 truncate font-mono text-xs text-slate-400">{{ category.slug }}</p>
          </div>

          <div class="rounded-lg bg-slate-100 p-2 text-slate-600">
            <TagsIcon class="h-4 w-4" />
          </div>
        </div>

        <div class="mt-5 grid gap-3" :class="authStore.isSuperadmin ? 'grid-cols-2' : 'grid-cols-1'">
          <div class="rounded-lg border border-slate-200 p-3">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Products</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">
              {{ productCount(category.id) }}
            </p>
          </div>
          <div v-if="authStore.isSuperadmin" class="rounded-lg border border-slate-200 p-3">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Tenant</p>
            <p class="mt-2 truncate text-sm font-semibold text-slate-900">
              {{ tenantName(category.tenantId) }}
            </p>
          </div>
        </div>

        <div v-if="!authStore.isSuperadmin" class="mt-5 flex justify-end gap-2">
          <AppButton size="sm" variant="outline" @click="openEditModal(category)">
            <PencilIcon class="mr-2 h-3.5 w-3.5" />
            Edit
          </AppButton>
          <AppButton size="sm" variant="danger" @click="openDeleteModal(category)">
            <Trash2Icon class="mr-2 h-3.5 w-3.5" />
            Delete
          </AppButton>
        </div>
      </article>
    </div>
  </div>

  <AppModal
    v-model="categoryModalOpen"
    :title="isEditing ? 'Edit Category' : 'Create Category'"
    max-width="480px"
  >
    <div class="space-y-4">
      <AppInput
        v-model="form.name"
        label="Category Name"
        placeholder="Accessories"
        :error="formErrors.name"
      />
      <AppInput
        v-model="form.slug"
        label="Slug"
        placeholder="accessories"
        :error="formErrors.slug"
      />
      <p class="text-xs text-slate-500">
        Slugs must be unique inside your tenant workspace.
      </p>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="closeCategoryModal">Cancel</AppButton>
      <AppButton :loading="saving" @click="saveCategory">
        {{ isEditing ? 'Save Changes' : 'Create Category' }}
      </AppButton>
    </template>
  </AppModal>

  <BaseModal
    v-model="deleteModalOpen"
    title="Delete Category"
    :description="`Delete ${selectedCategory?.name || 'this category'}? Categories with products cannot be deleted.`"
    @confirm="confirmDelete"
  />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppModal from '../components/ui/AppModal.vue'
import AppSelect from '../components/ui/AppSelect.vue'
import BaseModal from '../components/BaseModal.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import SectionCard from '../components/ui/SectionCard.vue'
import { useAuthStore } from '../stores/authStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useProductStore } from '../stores/productStore'
import { useTenantStore } from '../stores/tenantStore'
import {
  AlertTriangle as AlertTriangleIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Search as SearchIcon,
  Tags as TagsIcon,
  Trash2 as Trash2Icon,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const productStore = useProductStore()
const tenantStore = useTenantStore()
const notificationStore = useNotificationStore()

const categoryModalOpen = ref(false)
const deleteModalOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const selectedCategory = ref(null)

const form = reactive({
  name: '',
  slug: '',
})

const formErrors = reactive({
  name: '',
  slug: '',
})

const normalizeSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const resetForm = () => {
  form.name = ''
  form.slug = ''
  formErrors.name = ''
  formErrors.slug = ''
  selectedCategory.value = null
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  categoryModalOpen.value = true
}

const openEditModal = (category) => {
  isEditing.value = true
  selectedCategory.value = category
  form.name = category.name
  form.slug = category.slug
  formErrors.name = ''
  formErrors.slug = ''
  categoryModalOpen.value = true
}

const closeCategoryModal = () => {
  categoryModalOpen.value = false
  resetForm()
}

const validate = () => {
  formErrors.name = ''
  formErrors.slug = ''

  if (!form.name.trim()) {
    formErrors.name = 'Category name is required.'
  }

  if (form.slug.trim() && !/^[a-z0-9-]+$/i.test(form.slug.trim())) {
    formErrors.slug = 'Use letters, numbers, and hyphens only.'
  }

  return !formErrors.name && !formErrors.slug
}

const saveCategory = async () => {
  if (!validate()) return

  saving.value = true

  try {
    const payload = {
      name: form.name.trim(),
      slug: normalizeSlug(form.slug || form.name),
    }

    if (isEditing.value) {
      await categoryStore.updateCategory(selectedCategory.value.id, payload)
      notificationStore.success('Category updated.')
    } else {
      await categoryStore.addCategory(payload)
      notificationStore.success('Category created.')
    }

    await productStore.loadProducts()
    closeCategoryModal()
  } catch (error) {
    const message = error?.response?.data?.message || 'Category operation failed.'

    if (message.toLowerCase().includes('slug')) {
      formErrors.slug = message
    }

    notificationStore.error(message)
  } finally {
    saving.value = false
  }
}

const openDeleteModal = (category) => {
  selectedCategory.value = category
  deleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (!selectedCategory.value) return

  try {
    await categoryStore.deleteCategory(selectedCategory.value.id)
    notificationStore.success('Category deleted.')
    deleteModalOpen.value = false
    selectedCategory.value = null
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || 'Failed to delete category.')
  }
}

const productCount = (categoryId) =>
  productStore.products.filter((product) => product.categoryId === categoryId).length

const tenantName = (tenantId) =>
  tenantStore.tenants.find((tenant) => tenant.id === tenantId)?.name || tenantId

const refreshCategories = async () => {
  try {
    await Promise.all([
      categoryStore.loadCategories(),
      productStore.loadProducts(),
      authStore.isSuperadmin ? tenantStore.fetchTenants() : Promise.resolve(),
    ])
  } catch {
    // Stores expose their own error messages.
  }
}

onMounted(() => {
  refreshCategories()
})
</script>
