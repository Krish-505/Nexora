<template>
  <div class="flex min-h-full flex-col gap-6">
    <PageHeader
      eyebrow="System Response"
      title="Page not found"
      :description="description"
    />

    <section
      class="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-bg)] shadow-[var(--card-shadow)]"
    >
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-80"
      />

      <div class="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:p-8">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-3 rounded-2xl bg-[var(--primary-soft)] px-4 py-3 text-[var(--color-primary)] ring-1 ring-[rgba(var(--color-primary-rgb)/0.14)]">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-[0_16px_44px_var(--glow-color)]">
              <FileSearchIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Error 404
              </p>
              <p class="mt-1 text-lg font-black text-[var(--text-primary)]">
                We couldn't find that route
              </p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Requested path
              </p>
              <p class="mt-3 break-all font-mono text-sm text-[var(--text-primary)]">
                {{ route.fullPath }}
              </p>
            </div>

            <div class="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Workspace
              </p>
              <p class="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                {{ authStore.isAuthenticated ? authStore.tenantName : 'Guest session' }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <AppButton @click="goPrimary">
              <HomeIcon class="mr-2 h-4 w-4" />
              {{ primaryActionLabel }}
            </AppButton>
            <AppButton variant="outline" @click="goBack">
              <ArrowLeftIcon class="mr-2 h-4 w-4" />
              Go Back
            </AppButton>
          </div>
        </div>

        <SectionCard title="Helpful routes" description="Try one of the core destinations below.">
          <div class="grid gap-3">
            <button
              v-for="item in quickLinks"
              :key="item.label"
              class="group flex items-center justify-between rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-[var(--hover-accent)]"
              @click="router.push(item.to)"
            >
              <div>
                <p class="text-sm font-bold text-[var(--text-primary)]">{{ item.label }}</p>
                <p class="mt-1 text-xs text-[var(--text-secondary)]">{{ item.description }}</p>
              </div>
              <ArrowRightIcon class="h-4 w-4 text-[var(--text-secondary)] transition group-hover:text-[var(--text-primary)]" />
            </button>
          </div>
        </SectionCard>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  FileSearch as FileSearchIcon,
  Home as HomeIcon,
} from 'lucide-vue-next'
import AppButton from '../components/ui/AppButton.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import SectionCard from '../components/ui/SectionCard.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const description = computed(() =>
  isAuthenticated.value
    ? 'The route does not exist in this workspace. Use the navigation below to get back on track.'
    : 'The page you requested is not available. Return to the sign-in flow or visit a known route.'
)

const primaryActionLabel = computed(() =>
  isAuthenticated.value ? 'Go to Dashboard' : 'Go to Login'
)

const quickLinks = computed(() => {
  if (!isAuthenticated.value) {
    return [
      {
        label: 'Login',
        description: 'Return to your secure sign-in screen.',
        to: { name: 'login' },
      },
    ]
  }

  const links = [
    {
      label: 'Dashboard',
      description: 'Platform and workspace metrics.',
      to: { name: 'dashboard' },
    },
    {
      label: 'Products',
      description: 'Inventory and product catalog.',
      to: { name: 'products' },
    },
    {
      label: 'Categories',
      description: 'Tenant category organization.',
      to: { name: 'categories' },
    },
  ]

  if (authStore.isSuperadmin) {
    links.push({
      label: 'Tenants',
      description: 'Tenant lifecycle and theme settings.',
      to: { name: 'tenants' },
    })
  }

  return links
})

const goPrimary = () => {
  router.push(isAuthenticated.value ? { name: 'dashboard' } : { name: 'login' })
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  goPrimary()
}
</script>
