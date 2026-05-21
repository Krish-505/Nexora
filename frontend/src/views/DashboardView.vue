<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="authStore.isSuperadmin ? 'Platform Command' : dashboardStore.data?.tenantName || 'Workspace'"
      :title="authStore.isSuperadmin ? 'Operations dashboard' : 'Workspace dashboard'"
      :description="
        authStore.isSuperadmin
          ? 'Live platform posture across tenants, users, inventory, and lifecycle status.'
          : 'Inventory health, product availability, and value signals for your tenant.'
      "
    >
      <template #actions>
        <AppButton variant="outline" :loading="dashboardStore.loading" @click="refreshDashboard">
          <RefreshCwIcon class="mr-2 h-4 w-4" />
          Refresh
        </AppButton>
      </template>
    </PageHeader>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <SectionCard v-if="dashboardStore.error" body-class="p-0">
        <div class="flex flex-col gap-3 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p class="font-semibold">Dashboard unavailable</p>
              <p class="mt-1">{{ dashboardStore.error }}</p>
            </div>
          </div>

          <AppButton variant="outline" size="sm" @click="refreshDashboard">Retry</AppButton>
        </div>
      </SectionCard>
    </Transition>

    <div v-if="dashboardStore.loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div
        v-for="index in 5"
        :key="index"
        class="nx-surface-strong rounded-2xl p-5"
      >
        <LoadingSkeleton :rows="3" />
      </div>
    </div>

    <template v-else-if="dashboardStore.hasData">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          v-for="(card, index) in statCards"
          :key="card.label"
          :label="card.label"
          :value="card.value"
          :progress="card.progress"
          :icon="card.icon"
          :icon-class="card.iconClass"
          :bar-class="card.barClass"
          :highlighted="dashboardStore.recentMetricKeys.includes(card.metricKey)"
          :delay="index * 35"
        />
      </div>

      <div
        v-if="authStore.isSuperadmin"
        class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]"
      >
        <SectionCard title="Tenant health" description="Lifecycle distribution across the platform.">
          <div class="space-y-5">
            <div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-slate-700">Active tenants</span>
                <StatusBadge tone="success">{{ activeTenantRatio }}%</StatusBadge>
              </div>
              <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700 ease-out"
                  :style="{ width: `${activeTenantRatio}%` }"
                />
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div
                v-for="item in tenantHealth"
                :key="item.label"
                class="rounded-xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  {{ item.label }}
                </p>
                <p class="mt-2 text-2xl font-black text-slate-950">{{ item.value }}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Platform mix">
          <div class="divide-y divide-slate-100">
            <div
              v-for="item in platformMix"
              :key="item.label"
              class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-3">
                <div class="rounded-xl p-2 ring-1 ring-slate-200" :class="item.class">
                  <component :is="item.icon" class="h-4 w-4" />
                </div>
                <span class="text-sm font-semibold text-slate-700">{{ item.label }}</span>
              </div>
              <span class="text-sm font-black text-slate-950">{{ item.value }}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <SectionCard title="Inventory posture" description="Availability signals based on current stock.">
          <div class="space-y-5">
            <div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-slate-700">Products in stock</span>
                <StatusBadge tone="info">{{ activeProductRatio }}%</StatusBadge>
              </div>
              <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 transition-all duration-700 ease-out"
                  :style="{ width: `${activeProductRatio}%` }"
                />
              </div>
            </div>

            <div
              class="rounded-xl border p-4"
              :class="
                dashboardStore.data.lowStockProducts
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              "
            >
              <div class="flex items-center gap-3">
                <AlertTriangleIcon v-if="dashboardStore.data.lowStockProducts" class="h-5 w-5" />
                <CheckCircle2Icon v-else class="h-5 w-5" />
                <p class="text-sm font-bold">
                  {{
                    dashboardStore.data.lowStockProducts
                      ? `${dashboardStore.data.lowStockProducts} low stock product(s)`
                      : 'No low stock products'
                  }}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Workspace summary">
          <div class="divide-y divide-slate-100">
            <div
              v-for="item in tenantSummary"
              :key="item.label"
              class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <span class="text-sm font-semibold text-slate-600">{{ item.label }}</span>
              <span class="text-sm font-black text-slate-950">{{ item.value }}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </template>

    <EmptyState
      v-else
      title="No dashboard data available"
      description="Refresh the dashboard to pull the latest metrics."
    >
      <template #icon>
        <BarChart3Icon class="h-6 w-6" />
      </template>
      <template #action>
        <AppButton variant="outline" @click="refreshDashboard">Retry</AppButton>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import LoadingSkeleton from '../components/ui/LoadingSkeleton.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import SectionCard from '../components/ui/SectionCard.vue'
import StatCard from '../components/ui/StatCard.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
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

const tenantHealth = computed(() => [
  { label: 'Active', value: dashboardStore.data?.activeTenants || 0 },
  { label: 'Inactive', value: dashboardStore.data?.inactiveTenants || 0 },
  { label: 'Admins', value: dashboardStore.data?.totalTenantAdmins || 0 },
])

const statCards = computed(() => {
  const data = dashboardStore.data || {}

  if (authStore.isSuperadmin) {
    return [
      {
        label: 'Total tenants',
        metricKey: 'totalTenants',
        value: formatNumber(data.totalTenants),
        progress: 100,
        icon: BuildingIcon,
        iconClass: 'bg-sky-50 text-sky-600 ring-sky-100',
        barClass: 'bg-sky-500',
      },
      {
        label: 'Active tenants',
        metricKey: 'activeTenants',
        value: formatNumber(data.activeTenants),
        progress: activeTenantRatio.value,
        icon: CheckCircle2Icon,
        iconClass: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        barClass: 'bg-emerald-500',
      },
      {
        label: 'Inactive tenants',
        metricKey: 'inactiveTenants',
        value: formatNumber(data.inactiveTenants),
        progress: percentage(data.inactiveTenants, data.totalTenants),
        icon: ShieldAlertIcon,
        iconClass: 'bg-red-50 text-red-600 ring-red-100',
        barClass: 'bg-red-500',
      },
      {
        label: 'Total products',
        metricKey: 'totalProducts',
        value: formatNumber(data.totalProducts),
        progress: 100,
        icon: BoxesIcon,
        iconClass: 'bg-violet-50 text-violet-600 ring-violet-100',
        barClass: 'bg-violet-500',
      },
      {
        label: 'Total users',
        metricKey: 'totalUsers',
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
      metricKey: 'totalProducts',
      value: formatNumber(data.totalProducts),
      progress: 100,
      icon: BoxesIcon,
      iconClass: 'bg-sky-50 text-sky-600 ring-sky-100',
      barClass: 'bg-sky-500',
    },
    {
      label: 'Active products',
      metricKey: 'activeProducts',
      value: formatNumber(data.activeProducts),
      progress: activeProductRatio.value,
      icon: PackageCheckIcon,
      iconClass: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
      barClass: 'bg-emerald-500',
    },
    {
      label: 'Low stock',
      metricKey: 'lowStockProducts',
      value: formatNumber(data.lowStockProducts),
      progress: percentage(data.lowStockProducts, data.totalProducts),
      icon: PackageSearchIcon,
      iconClass: 'bg-amber-50 text-amber-600 ring-amber-100',
      barClass: 'bg-amber-500',
    },
    {
      label: 'Inventory value',
      metricKey: 'totalInventoryValue',
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
