<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {{ authStore.isSuperadmin ? 'Platform Observability' : authStore.tenantName }}
        </p>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Audit timeline
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {{
            authStore.isSuperadmin
              ? 'Monitor security, tenant lifecycle, and product operations across the platform.'
              : 'Review security and operational activity for your tenant workspace.'
          }}
        </p>
      </div>

      <AppButton variant="outline" :loading="auditStore.loading" @click="refreshLogs">
        <RefreshCwIcon class="mr-2 h-4 w-4" />
        Refresh
      </AppButton>
    </div>

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[1.1fr_220px_180px_220px_auto]">
        <div class="relative">
          <SearchIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="auditStore.filters.search"
            type="search"
            placeholder="Search action, message, user, or tenant..."
            class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <select
          v-model="auditStore.filters.action"
          class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          @change="refreshLogs"
        >
          <option value="">All actions</option>
          <option v-for="action in auditActions" :key="action" :value="action">
            {{ formatAction(action) }}
          </option>
        </select>

        <select
          v-model="auditStore.filters.role"
          class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          @change="refreshLogs"
        >
          <option value="">All roles</option>
          <option value="superadmin">Superadmin</option>
          <option value="tenant-admin">Tenant admin</option>
        </select>

        <input
          v-if="authStore.isSuperadmin"
          v-model="auditStore.filters.tenantId"
          type="text"
          placeholder="Filter by tenant ID"
          class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          @keyup.enter="refreshLogs"
          @blur="refreshLogs"
        />

        <AppButton variant="ghost" @click="resetFilters">
          <RotateCcwIcon class="mr-2 h-4 w-4" />
          Reset
        </AppButton>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="auditStore.error"
        class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-3">
          <AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p class="font-semibold">Audit logs unavailable</p>
            <p class="mt-1">{{ auditStore.error }}</p>
          </div>
        </div>
        <AppButton variant="outline" size="sm" @click="refreshLogs">Retry</AppButton>
      </div>
    </Transition>

    <div v-if="auditStore.loading" class="space-y-4">
      <div
        v-for="index in 5"
        :key="index"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="flex animate-pulse gap-4">
          <div class="h-10 w-10 rounded-lg bg-slate-200"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 w-40 rounded bg-slate-200"></div>
            <div class="h-4 w-full max-w-xl rounded bg-slate-100"></div>
            <div class="h-3 w-64 rounded bg-slate-100"></div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!auditStore.filteredLogs.length"
      class="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
    >
      <FileClockIcon class="h-10 w-10 text-slate-300" />
      <p class="mt-4 text-sm font-semibold text-slate-700">No audit activity found</p>
      <p class="mt-1 max-w-md text-sm text-slate-500">
        Try changing the filters or perform an auditable action such as logging in, creating a
        tenant, or updating a product.
      </p>
      <AppButton class="mt-5" variant="outline" @click="resetFilters">Clear filters</AppButton>
    </div>

    <section v-else class="relative">
      <div class="absolute left-5 top-2 hidden h-[calc(100%-1rem)] w-px bg-slate-200 sm:block"></div>

      <TransitionGroup
        tag="div"
        class="space-y-4"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
      >
        <article
          v-for="log in auditStore.filteredLogs"
          :key="log.id"
          class="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md sm:ml-12"
        >
          <div
            class="absolute -left-[3.25rem] top-5 hidden h-10 w-10 items-center justify-center rounded-lg border border-white shadow-sm sm:flex"
            :class="actionMeta(log.action).iconClass"
          >
            <component :is="actionMeta(log.action).icon" class="h-4 w-4" />
          </div>

          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                  :class="actionMeta(log.action).badgeClass"
                >
                  {{ formatAction(log.action) }}
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {{ formatRole(log.role) }}
                </span>
              </div>

              <p class="mt-3 text-sm font-semibold text-slate-900">{{ log.message }}</p>

              <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span class="inline-flex items-center gap-1.5">
                  <UserIcon class="h-3.5 w-3.5" />
                  {{ log.performedBy }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <BuildingIcon class="h-3.5 w-3.5" />
                  {{ tenantLabel(log) }}
                </span>
              </div>
            </div>

            <div class="shrink-0 text-left lg:text-right">
              <p class="text-sm font-medium text-slate-700">{{ relativeTime(log.timestamp) }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ formatTimestamp(log.timestamp) }}</p>
            </div>
          </div>
        </article>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import { auditActions, useAuditStore } from '../stores/auditStore'
import { useAuthStore } from '../stores/authStore'
import {
  AlertTriangle as AlertTriangleIcon,
  Building2 as BuildingIcon,
  CheckCircle2 as CheckCircleIcon,
  FileClock as FileClockIcon,
  LogIn as LogInIcon,
  LogOut as LogOutIcon,
  PackagePlus as PackagePlusIcon,
  PackageX as PackageXIcon,
  Pencil as PencilIcon,
  RefreshCw as RefreshCwIcon,
  RotateCcw as RotateCcwIcon,
  Search as SearchIcon,
  ShieldAlert as ShieldAlertIcon,
  Tags as TagsIcon,
  Trash2 as TrashIcon,
  User as UserIcon,
} from 'lucide-vue-next'

const auditStore = useAuditStore()
const authStore = useAuthStore()

const actionConfig = {
  LOGIN_SUCCESS: {
    icon: LogInIcon,
    iconClass: 'bg-emerald-50 text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  LOGOUT: {
    icon: LogOutIcon,
    iconClass: 'bg-slate-100 text-slate-600',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
  TENANT_CREATED: {
    icon: BuildingIcon,
    iconClass: 'bg-sky-50 text-sky-600',
    badgeClass: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  TENANT_DELETED: {
    icon: TrashIcon,
    iconClass: 'bg-red-50 text-red-600',
    badgeClass: 'bg-red-50 text-red-700 ring-red-200',
  },
  TENANT_ACTIVATED: {
    icon: CheckCircleIcon,
    iconClass: 'bg-emerald-50 text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  TENANT_DEACTIVATED: {
    icon: ShieldAlertIcon,
    iconClass: 'bg-amber-50 text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  PRODUCT_CREATED: {
    icon: PackagePlusIcon,
    iconClass: 'bg-violet-50 text-violet-600',
    badgeClass: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
  PRODUCT_UPDATED: {
    icon: PencilIcon,
    iconClass: 'bg-blue-50 text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  PRODUCT_DELETED: {
    icon: PackageXIcon,
    iconClass: 'bg-red-50 text-red-600',
    badgeClass: 'bg-red-50 text-red-700 ring-red-200',
  },
  CATEGORY_CREATED: {
    icon: TagsIcon,
    iconClass: 'bg-cyan-50 text-cyan-600',
    badgeClass: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  },
  CATEGORY_UPDATED: {
    icon: PencilIcon,
    iconClass: 'bg-blue-50 text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  CATEGORY_DELETED: {
    icon: TrashIcon,
    iconClass: 'bg-red-50 text-red-600',
    badgeClass: 'bg-red-50 text-red-700 ring-red-200',
  },
}

const defaultActionMeta = {
  icon: FileClockIcon,
  iconClass: 'bg-slate-100 text-slate-600',
  badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
}

const actionMeta = (action) => actionConfig[action] || defaultActionMeta

const formatAction = (action) =>
  action
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const formatRole = (role) =>
  role === 'tenant-admin' ? 'Tenant admin' : 'Superadmin'

const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))

const relativeTime = (timestamp) => {
  const diffInSeconds = Math.round((new Date(timestamp).getTime() - Date.now()) / 1000)
  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ]

  const formatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

  for (const { unit, seconds } of units) {
    const value = Math.trunc(diffInSeconds / seconds)

    if (Math.abs(value) >= 1) {
      return formatter.format(value, unit)
    }
  }

  return 'just now'
}

const tenantLabel = (log) => {
  if (!log.tenantId) return 'Platform'

  return authStore.isSuperadmin ? log.tenantId : authStore.tenantName
}

const refreshLogs = async () => {
  try {
    await auditStore.loadLogs()
  } catch {
    // The store exposes the retryable error state.
  }
}

const resetFilters = async () => {
  auditStore.resetFilters()
  await refreshLogs()
}

onMounted(() => {
  refreshLogs()
})
</script>
