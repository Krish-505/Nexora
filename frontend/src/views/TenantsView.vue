<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppModal from '../components/ui/AppModal.vue'
import AppSelect from '../components/ui/AppSelect.vue'
import AppTable from '../components/ui/AppTable.vue'
import { useNotificationStore } from '../stores/notificationStore'
import { useTenantStore } from '../stores/tenantStore'
import { useThemeStore } from '../stores/themeStore'
import {
  defaultTenantTheme,
  normalizeTheme,
  SIDEBAR_STYLES,
  SURFACE_STYLES,
  THEME_MODES,
} from '../services/themeService'
import {
  AlertTriangle as AlertTriangleIcon,
  Building2 as BuildingIcon,
  Copy as CopyIcon,
  Palette as PaletteIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  ShieldCheck as ShieldCheckIcon,
  Trash2 as Trash2Icon,
  Users as UsersIcon,
} from 'lucide-vue-next'

const tenantStore = useTenantStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

const columns = [
  { key: 'name', label: 'Tenant' },
  { key: 'slug', label: 'Slug', class: 'hidden md:table-cell' },
  { key: 'status', label: 'Status', class: 'w-36' },
  { key: 'createdAt', label: 'Created', class: 'hidden lg:table-cell' },
  { key: 'actions', label: '', class: 'w-56 text-right' },
]

const createModalOpen = ref(false)
const deleteModalOpen = ref(false)
const themeModalOpen = ref(false)
const createdAdmin = ref(null)
const selectedTenant = ref(null)
const selectedThemeTenant = ref(null)

const form = reactive({
  name: '',
  slug: '',
})

const formErrors = reactive({
  name: '',
  slug: '',
})

const themeForm = reactive({
  primaryColor: defaultTenantTheme.primaryColor,
  accentColor: defaultTenantTheme.accentColor,
  mode: defaultTenantTheme.mode,
  sidebarStyle: defaultTenantTheme.sidebarStyle,
  surfaceStyle: defaultTenantTheme.surfaceStyle,
  logo: '',
})

const themeErrors = reactive({
  primaryColor: '',
  accentColor: '',
})

const tenantCountLabel = computed(() =>
  tenantStore.tenants.length === 1 ? '1 tenant' : `${tenantStore.tenants.length} tenants`
)

const resetCreateForm = () => {
  form.name = ''
  form.slug = ''
  formErrors.name = ''
  formErrors.slug = ''
  createdAdmin.value = null
}

const openCreateModal = () => {
  resetCreateForm()
  createModalOpen.value = true
}

const closeCreateModal = () => {
  createModalOpen.value = false
  resetCreateForm()
}

const openDeleteModal = (tenant) => {
  selectedTenant.value = tenant
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  deleteModalOpen.value = false
  selectedTenant.value = null
}

const assignThemeForm = (theme) => {
  const normalized = normalizeTheme(theme || defaultTenantTheme)

  themeForm.primaryColor = normalized.primaryColor
  themeForm.accentColor = normalized.accentColor
  themeForm.mode = normalized.mode
  themeForm.sidebarStyle = normalized.sidebarStyle
  themeForm.surfaceStyle = normalized.surfaceStyle
  themeForm.logo = normalized.logo
  themeErrors.primaryColor = ''
  themeErrors.accentColor = ''
}

const openThemeModal = (tenant) => {
  selectedThemeTenant.value = tenant
  assignThemeForm(tenant.theme)
  themeModalOpen.value = true
  themeStore.applyPreview(themeForm, { brandName: tenant.name })
}

const closeThemeModal = () => {
  themeModalOpen.value = false
  selectedThemeTenant.value = null
  themeStore.restoreCommitted({ brandName: 'Nexora' })
}

const validateForm = () => {
  formErrors.name = ''
  formErrors.slug = ''

  let isValid = true

  if (!form.name.trim()) {
    formErrors.name = 'Tenant name is required.'
    isValid = false
  }

  if (!form.slug.trim()) {
    formErrors.slug = 'Tenant slug is required.'
    isValid = false
  } else if (!/^[a-z0-9-]+$/i.test(form.slug.trim())) {
    formErrors.slug = 'Use letters, numbers, and hyphens only.'
    isValid = false
  }

  return isValid
}

const submitCreateTenant = async () => {
  if (!validateForm()) return

  try {
    const response = await tenantStore.addTenant({
      name: form.name.trim(),
      slug: form.slug.trim(),
    })

    createdAdmin.value = response.adminCredentials
    notificationStore.success('Tenant created and tenant admin provisioned.')
  } catch (error) {
    const message = error?.response?.data?.message || 'Failed to create tenant.'
    formErrors.slug = message.toLowerCase().includes('slug') ? message : formErrors.slug
    notificationStore.error(message)
  }
}

const toggleTenant = async (tenant) => {
  try {
    const updatedTenant = await tenantStore.toggleTenantStatus(tenant.id)

    notificationStore.success(
      updatedTenant.active
        ? `${updatedTenant.name} has been activated.`
        : `${updatedTenant.name} has been deactivated.`
    )
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || 'Failed to update tenant status.')
  }
}

const confirmDelete = async () => {
  if (!selectedTenant.value) return

  try {
    const response = await tenantStore.removeTenant(selectedTenant.value.id)
    notificationStore.success(
      `${response.tenant.name} deleted with ${response.deletedUsers} user(s) and ${response.deletedProducts} product(s) removed.`
    )
    closeDeleteModal()
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || 'Failed to delete tenant.')
  }
}

const validateTheme = () => {
  const colorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

  themeErrors.primaryColor = colorPattern.test(themeForm.primaryColor)
    ? ''
    : 'Use a valid hex color.'
  themeErrors.accentColor = colorPattern.test(themeForm.accentColor)
    ? ''
    : 'Use a valid hex color.'

  return !themeErrors.primaryColor && !themeErrors.accentColor
}

const saveTenantTheme = async () => {
  if (!selectedThemeTenant.value || !validateTheme()) return

  try {
    const updatedTenant = await tenantStore.updateTheme(selectedThemeTenant.value.id, {
      primaryColor: themeForm.primaryColor,
      accentColor: themeForm.accentColor,
      mode: themeForm.mode,
      sidebarStyle: themeForm.sidebarStyle,
      surfaceStyle: themeForm.surfaceStyle,
      logo: themeForm.logo,
    })

    notificationStore.success(`Theme updated for ${updatedTenant.name}.`)
    closeThemeModal()
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || 'Failed to update tenant theme.')
  }
}

const refreshTenants = async () => {
  try {
    await tenantStore.fetchTenants()
  } catch (error) {
    notificationStore.error(error?.response?.data?.message || 'Failed to load tenants.')
  }
}

const copyCredentials = async () => {
  if (!createdAdmin.value) return

  const credentialText = `Email: ${createdAdmin.value.email}\nPassword: ${createdAdmin.value.password}`

  try {
    await navigator.clipboard.writeText(credentialText)
    notificationStore.success('Admin credentials copied to clipboard.')
  } catch {
    notificationStore.error('Unable to copy credentials.')
  }
}

watch(createModalOpen, (isOpen) => {
  if (!isOpen) {
    resetCreateForm()
  }
})

watch(deleteModalOpen, (isOpen) => {
  if (!isOpen) {
    selectedTenant.value = null
  }
})

watch(
  themeForm,
  () => {
    if (themeModalOpen.value && selectedThemeTenant.value) {
      themeStore.applyPreview(themeForm, { brandName: selectedThemeTenant.value.name })
    }
  },
  { deep: true }
)

watch(themeModalOpen, (isOpen) => {
  if (!isOpen && selectedThemeTenant.value) {
    themeStore.restoreCommitted({ brandName: 'Nexora' })
    selectedThemeTenant.value = null
  }
})

onMounted(() => {
  refreshTenants()
})
</script>

<template>
  <div>
  <div class="space-y-6">
    <section
      class="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm"
    >
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300"
          >
            <ShieldCheckIcon class="h-3.5 w-3.5" />
            Tenant Lifecycle Control
          </div>

          <h1 class="mt-4 text-3xl font-bold tracking-tight">Enterprise tenant management</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Provision, deactivate, reactivate, and remove tenant workspaces with backend-enforced
            access control.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <AppButton variant="outline" size="md" :loading="tenantStore.loading" @click="refreshTenants">
            <RefreshCwIcon class="mr-2 h-4 w-4" />
            Refresh
          </AppButton>
          <AppButton size="md" @click="openCreateModal">
            <PlusIcon class="mr-2 h-4 w-4" />
            Create Tenant
          </AppButton>
        </div>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Tenants</p>
          <p class="mt-2 text-2xl font-semibold">{{ tenantStore.tenants.length }}</p>
          <p class="mt-1 text-sm text-slate-400">{{ tenantCountLabel }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Active</p>
          <p class="mt-2 text-2xl font-semibold">
            {{ tenantStore.tenants.filter((tenant) => tenant.active).length }}
          </p>
          <p class="mt-1 text-sm text-slate-400">Tenants currently allowed to access APIs</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Inactive</p>
          <p class="mt-2 text-2xl font-semibold">
            {{ tenantStore.tenants.filter((tenant) => !tenant.active).length }}
          </p>
          <p class="mt-1 text-sm text-slate-400">Tenants blocked from login and protected routes</p>
        </div>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="tenantStore.error"
        class="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div>
          <p class="font-semibold">Unable to load tenants</p>
          <p class="mt-1">{{ tenantStore.error }}</p>
        </div>
      </div>
    </Transition>

    <AppTable :columns="columns" :data="tenantStore.tenants" :loading="tenantStore.loading">
      <template #empty>
        <div class="flex flex-col items-center justify-center gap-4 py-16">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <BuildingIcon class="h-7 w-7 text-slate-400" />
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-slate-700">No tenants found</p>
            <p class="mt-1 text-xs text-slate-500">
              Create your first tenant to provision a new isolated workspace.
            </p>
          </div>
          <AppButton size="md" @click="openCreateModal">
            <PlusIcon class="mr-2 h-4 w-4" />
            Create Tenant
          </AppButton>
        </div>
      </template>

      <template #cell-name="{ row }">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
            <BuildingIcon class="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p class="font-semibold text-slate-900">{{ row.name }}</p>
            <p class="mt-1 text-xs text-slate-500">Tenant ID: {{ row.id }}</p>
          </div>
        </div>
      </template>

      <template #cell-slug="{ value }">
        <span class="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
          {{ value }}
        </span>
      </template>

      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          :class="
            row.active
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-red-50 text-red-700 ring-1 ring-red-200'
          "
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="row.active ? 'bg-emerald-500' : 'bg-red-500'"
          />
          {{ row.active ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <template #cell-createdAt="{ value }">
        <span class="text-sm text-slate-500">
          {{ new Date(value).toLocaleDateString() }}
        </span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <AppButton
            size="sm"
            :variant="row.active ? 'secondary' : 'primary'"
            :loading="tenantStore.isProcessing(row.id)"
            @click="toggleTenant(row)"
          >
            {{ row.active ? 'Deactivate' : 'Activate' }}
          </AppButton>
          <AppButton
            size="sm"
            variant="danger"
            :loading="tenantStore.isProcessing(row.id)"
            @click="openDeleteModal(row)"
          >
            <Trash2Icon class="mr-1.5 h-3.5 w-3.5" />
            Delete
          </AppButton>
          <AppButton
            size="sm"
            variant="outline"
            :loading="tenantStore.isProcessing(row.id)"
            @click="openThemeModal(row)"
          >
            <PaletteIcon class="mr-1.5 h-3.5 w-3.5" />
            Theme
          </AppButton>
        </div>
      </template>
    </AppTable>
  </div>

  <AppModal v-model="createModalOpen" title="Create Tenant" max-width="560px">
    <div v-if="!createdAdmin" class="space-y-5">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        A tenant workspace and its default tenant-admin account will be created together.
      </div>

      <AppInput
        v-model="form.name"
        label="Tenant Name"
        placeholder="Acme Corporation"
        :error="formErrors.name"
      />

      <AppInput
        v-model="form.slug"
        label="Tenant Slug"
        placeholder="acme"
        :error="formErrors.slug"
      />

      <p class="text-xs text-slate-500">
        Default admin email will be generated as <span class="font-medium">admin@slug.com</span>.
      </p>
    </div>

    <div v-else class="space-y-5">
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
        <p class="text-sm font-semibold text-emerald-800">Tenant successfully provisioned</p>
        <p class="mt-1 text-sm text-emerald-700">
          Share these bootstrap credentials securely with the tenant administrator.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Email</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ createdAdmin.email }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Password</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ createdAdmin.password }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Rotate the default password after first login.
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="closeCreateModal">
        {{ createdAdmin ? 'Close' : 'Cancel' }}
      </AppButton>
      <AppButton
        v-if="!createdAdmin"
        :loading="tenantStore.creating"
        @click="submitCreateTenant"
      >
        Create Tenant
      </AppButton>
      <AppButton v-else variant="secondary" @click="copyCredentials">
        <CopyIcon class="mr-2 h-4 w-4" />
        Copy Credentials
      </AppButton>
    </template>
  </AppModal>

  <AppModal v-model="deleteModalOpen" title="Delete Tenant" max-width="560px">
    <div class="space-y-5">
      <div class="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
        <div class="rounded-2xl bg-red-100 p-2 text-red-600">
          <AlertTriangleIcon class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-semibold text-red-800">This action is irreversible</p>
          <p class="mt-1 text-sm text-red-700">
            Deleting <span class="font-semibold">{{ selectedTenant?.name }}</span> removes the
            tenant record, all tenant-admin users, and all tenant products immediately.
          </p>
        </div>
      </div>

      <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <div class="rounded-2xl bg-white px-4 py-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Tenant</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ selectedTenant?.name }}</p>
        </div>
        <div class="rounded-2xl bg-white px-4 py-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Slug</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ selectedTenant?.slug }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <UsersIcon class="h-4 w-4 text-slate-500" />
        <p class="text-sm text-slate-600">
          Existing JWTs for this tenant will fail on the next protected API request.
        </p>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="closeDeleteModal">Cancel</AppButton>
      <AppButton
        variant="danger"
        :loading="selectedTenant ? tenantStore.isProcessing(selectedTenant.id) : false"
        @click="confirmDelete"
      >
        Delete Tenant
      </AppButton>
    </template>
  </AppModal>

  <AppModal v-model="themeModalOpen" title="Tenant Theme Settings" max-width="820px">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-[var(--text-primary)]">Primary Color</label>
            <div class="flex gap-3">
              <input
                v-model="themeForm.primaryColor"
                type="color"
                class="h-10 w-12 rounded-xl border border-[var(--surface-border)] bg-transparent p-1"
              />
              <AppInput v-model="themeForm.primaryColor" :error="themeErrors.primaryColor" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-[var(--text-primary)]">Accent Color</label>
            <div class="flex gap-3">
              <input
                v-model="themeForm.accentColor"
                type="color"
                class="h-10 w-12 rounded-xl border border-[var(--surface-border)] bg-transparent p-1"
              />
              <AppInput v-model="themeForm.accentColor" :error="themeErrors.accentColor" />
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <AppSelect v-model="themeForm.mode" label="Mode">
            <option v-for="mode in THEME_MODES" :key="mode" :value="mode">
              {{ mode }}
            </option>
          </AppSelect>

          <AppSelect v-model="themeForm.sidebarStyle" label="Sidebar">
            <option v-for="style in SIDEBAR_STYLES" :key="style" :value="style">
              {{ style }}
            </option>
          </AppSelect>

          <AppSelect v-model="themeForm.surfaceStyle" label="Surface">
            <option v-for="style in SURFACE_STYLES" :key="style" :value="style">
              {{ style }}
            </option>
          </AppSelect>
        </div>

        <AppInput
          v-model="themeForm.logo"
          label="Logo URL"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div class="overflow-hidden rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-bg)] shadow-[var(--card-shadow)]">
        <div class="border-b border-[var(--surface-border)] px-4 py-3">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Live Preview
          </p>
          <p class="mt-1 text-sm font-bold text-[var(--text-primary)]">
            {{ selectedThemeTenant?.name || 'Tenant' }}
          </p>
        </div>
        <div class="space-y-4 p-4">
          <div class="flex items-center gap-3 rounded-2xl p-3" :style="{ background: 'var(--sidebar-bg)' }">
            <img
              v-if="themeForm.logo"
              :src="themeForm.logo"
              alt=""
              class="h-9 w-9 rounded-xl object-cover"
            />
            <div
              v-else
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-sm font-black text-white"
            >
              {{ selectedThemeTenant?.name?.[0] || 'T' }}
            </div>
            <div>
              <p class="text-sm font-bold text-white">{{ selectedThemeTenant?.name }}</p>
              <p class="text-xs text-white/60">{{ themeForm.sidebarStyle }} sidebar</p>
            </div>
          </div>

          <div class="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-bg)] p-4">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Workspace
            </p>
            <p class="mt-2 text-2xl font-black text-[var(--text-primary)]">Inventory Pulse</p>
            <div class="mt-4 h-2 rounded-full bg-[var(--surface-muted)]">
              <div class="h-full w-2/3 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
            </div>
          </div>

          <AppButton class="w-full">
            Preview Action
          </AppButton>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="closeThemeModal">Cancel</AppButton>
      <AppButton
        :loading="selectedThemeTenant ? tenantStore.isProcessing(selectedThemeTenant.id) : false"
        @click="saveTenantTheme"
      >
        Save Theme
      </AppButton>
    </template>
  </AppModal>
  </div>
</template>
