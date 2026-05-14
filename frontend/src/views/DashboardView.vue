<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {{ authStore.isSuperadmin ? 'Platform' : dashboardStore.data?.tenantName || 'Tenant' }}
        </p>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {{ authStore.isSuperadmin ? 'Operations dashboard' : 'Workspace dashboard' }}
        </h1>
      </div>

      <AppButton variant="outline" :loading="dashboardStore.loading" @click="refreshDashboard">
        <RefreshCwIcon class="mr-2 h-4 w-4" />
        Refresh
      </AppButton>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="dashboardStore.error"
        class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-3">
          <AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p class="font-semibold">Dashboard unavailable</p>
            <p class="mt-1">{{ dashboardStore.error }}</p>
          </div>
        </div>

        <AppButton variant="outline" size="sm" @click="refreshDashboard">Retry</AppButton>
      </div>
    </Transition>

    <div v-if="dashboardStore.loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div
        v-for="index in 5"
        :key="index"
        class="h-32 animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="h-4 w-24 rounded bg-slate-200"></div>
        <div class="mt-6 h-8 w-20 rounded bg-slate-200"></div>
        <div class="mt-4 h-2 w-full rounded bg-slate-100"></div>
      </div>
    </div>

    <template v-else-if="dashboardStore.hasData">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div
          v-for="(card, index) in statCards"
          :key="card.label"
          class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          :style="{ transitionDelay: `${index * 35}ms` }"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
              <p class="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {{ card.value }}
              </p>
            </div>

            <div class="rounded-lg p-2 ring-1" :class="card.iconClass">
              <component :is="card.icon" class="h-4 w-4" />
            </div>
          </div>

          <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="card.barClass"
              :style="{ width: `${card.progress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div
        v-if="authStore.isSuperadmin"
        class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]"
      >
        <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-base font-semibold text-slate-900">Tenant health</h2>
          </div>

          <div class="space-y-5 p-5">
            <div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">Active tenants</span>
                <span class="text-slate-500">{{ activeTenantRatio }}%</span>
              </div>
              <div class="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  :style="{ width: `${activeTenantRatio}%` }"
                ></div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Active</p>
                <p class="mt-2 text-xl font-semibold text-slate-900">
                  {{ dashboardStore.data.activeTenants }}
                </p>
              </div>
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Inactive</p>
                <p class="mt-2 text-xl font-semibold text-slate-900">
                  {{ dashboardStore.data.inactiveTenants }}
                </p>
              </div>
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Admins</p>
                <p class="mt-2 text-xl font-semibold text-slate-900">
                  {{ dashboardStore.data.totalTenantAdmins }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-base font-semibold text-slate-900">Platform mix</h2>
          </div>

          <div class="divide-y divide-slate-100">
            <div
              v-for="item in platformMix"
              :key="item.label"
              class="flex items-center justify-between px-5 py-4"
            >
              <div class="flex items-center gap-3">
                <div class="rounded-lg p-2" :class="item.class">
                  <component :is="item.icon" class="h-4 w-4" />
                </div>
                <span class="text-sm font-medium text-slate-700">{{ item.label }}</span>
              </div>
              <span class="text-sm font-semibold text-slate-900">{{ item.value }}</span>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-base font-semibold text-slate-900">Inventory posture</h2>
          </div>

          <div class="space-y-5 p-5">
            <div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">Products in stock</span>
                <span class="text-slate-500">{{ activeProductRatio }}%</span>
              </div>
              <div class="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-sky-500 transition-all duration-500"
                  :style="{ width: `${activeProductRatio}%` }"
                ></div>
              </div>
            </div>

            <div
              class="rounded-lg border p-4"
              :class="
                dashboardStore.data.lowStockProducts
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              "
            >
              <div class="flex items-center gap-3">
                <AlertTriangleIcon v-if="dashboardStore.data.lowStockProducts" class="h-5 w-5" />
                <CheckCircle2Icon v-else class="h-5 w-5" />
                <p class="text-sm font-semibold">
                  {{
                    dashboardStore.data.lowStockProducts
                      ? `${dashboardStore.data.lowStockProducts} low stock product(s)`
                      : 'No low stock products'
                  }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-base font-semibold text-slate-900">Workspace summary</h2>
          </div>

          <div class="divide-y divide-slate-100">
            <div
              v-for="item in tenantSummary"
              :key="item.label"
              class="flex items-center justify-between px-5 py-4"
            >
              <span class="text-sm font-medium text-slate-600">{{ item.label }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ item.value }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>

    <div
      v-else
      class="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
    >
      <BarChart3Icon class="h-10 w-10 text-slate-300" />
      <p class="mt-4 text-sm font-semibold text-slate-700">No dashboard data available</p>
      <AppButton class="mt-5" variant="outline" @click="refreshDashboard">Retry</AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import { useAuthStore } from '../stores/authStore'
import { useDashboardStore } from '../stores/dashboardStore'
import {
  AlertTriangle as AlertTriangleIcon,
  BarChart3 as BarChart3Icon,
  Boxes as BoxesIcon,
  Building2 as BuildingIcon,
  CheckCircle2 as CheckCircle2Icon,
  PackageCheck as PackageCheckIcon,
  PackageSearch as PackageSearchIcon,
  RefreshCw as RefreshCwIcon,
  ShieldAlert as ShieldAlertIcon,
  Users as UsersIcon,
  Wallet as WalletIcon,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0)

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)

const percentage = (part, total) => {
  if (!total) return 0

  return Math.round((part / total) * 100)
}

const activeTenantRatio = computed(() =>
  percentage(dashboardStore.data?.activeTenants, dashboardStore.data?.totalTenants)
)

const activeProductRatio = computed(() =>
  percentage(dashboardStore.data?.activeProducts, dashboardStore.data?.totalProducts)
)

const statCards = computed(() => {
  const data = dashboardStore.data || {}

  if (authStore.isSuperadmin) {
    return [
      {
        label: 'Total tenants',
        value: formatNumber(data.totalTenants),
        progress: 100,
        icon: BuildingIcon,
        iconClass: 'bg-sky-50 text-sky-600 ring-sky-100',
        barClass: 'bg-sky-500',
      },
      {
        label: 'Active tenants',
        value: formatNumber(data.activeTenants),
        progress: activeTenantRatio.value,
        icon: CheckCircle2Icon,
        iconClass: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        barClass: 'bg-emerald-500',
      },
      {
        label: 'Inactive tenants',
        value: formatNumber(data.inactiveTenants),
        progress: percentage(data.inactiveTenants, data.totalTenants),
        icon: ShieldAlertIcon,
        iconClass: 'bg-red-50 text-red-600 ring-red-100',
        barClass: 'bg-red-500',
      },
      {
        label: 'Total products',
        value: formatNumber(data.totalProducts),
        progress: 100,
        icon: BoxesIcon,
        iconClass: 'bg-violet-50 text-violet-600 ring-violet-100',
        barClass: 'bg-violet-500',
      },
      {
        label: 'Total users',
        value: formatNumber(data.totalUsers),
        progress: percentage(data.totalTenantAdmins, data.totalUsers),
        icon: UsersIcon,
        iconClass: 'bg-slate-100 text-slate-700 ring-slate-200',
        barClass: 'bg-slate-700',
      },
    ]
  }

  return [
    {
      label: 'Total products',
      value: formatNumber(data.totalProducts),
      progress: 100,
      icon: BoxesIcon,
      iconClass: 'bg-sky-50 text-sky-600 ring-sky-100',
      barClass: 'bg-sky-500',
    },
    {
      label: 'Active products',
      value: formatNumber(data.activeProducts),
      progress: activeProductRatio.value,
      icon: PackageCheckIcon,
      iconClass: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
      barClass: 'bg-emerald-500',
    },
    {
      label: 'Low stock',
      value: formatNumber(data.lowStockProducts),
      progress: percentage(data.lowStockProducts, data.totalProducts),
      icon: PackageSearchIcon,
      iconClass: 'bg-amber-50 text-amber-600 ring-amber-100',
      barClass: 'bg-amber-500',
    },
    {
      label: 'Inventory value',
      value: formatCurrency(data.totalInventoryValue),
      progress: 100,
      icon: WalletIcon,
      iconClass: 'bg-violet-50 text-violet-600 ring-violet-100',
      barClass: 'bg-violet-500',
    },
  ]
})

const platformMix = computed(() => [
  {
    label: 'Tenant admins',
    value: formatNumber(dashboardStore.data?.totalTenantAdmins),
    icon: UsersIcon,
    class: 'bg-slate-100 text-slate-600',
  },
  {
    label: 'Products',
    value: formatNumber(dashboardStore.data?.totalProducts),
    icon: BoxesIcon,
    class: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'Inactive tenants',
    value: formatNumber(dashboardStore.data?.inactiveTenants),
    icon: ShieldAlertIcon,
    class: 'bg-red-50 text-red-600',
  },
])

const tenantSummary = computed(() => [
  {
    label: 'Tenant',
    value: dashboardStore.data?.tenantName || 'Current workspace',
  },
  {
    label: 'Inventory value',
    value: formatCurrency(dashboardStore.data?.totalInventoryValue),
  },
  {
    label: 'Low stock threshold',
    value: 'Stock below 5',
  },
])

const refreshDashboard = async () => {
  if (!authStore.user?.role) return

  try {
    await dashboardStore.loadDashboard(authStore.user.role)
  } catch {
    // Store-owned error state drives the visible retry UI.
  }
}

watch(
  () => authStore.user?.role,
  () => {
    refreshDashboard()
  }
)

onMounted(() => {
  refreshDashboard()
})
</script>
