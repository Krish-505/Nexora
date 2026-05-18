<template>
  <div class="flex h-screen overflow-hidden font-sans text-slate-900">
    <!-- MOBILE OVERLAY -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
      @click="isMobileMenuOpen = false"
    />

    <!-- ─── SIDEBAR ──────────────────────────────────────────────────────── -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 w-64 flex flex-col',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0 lg:static lg:inset-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      class="nx-themed-sidebar"
    >
      <!-- Brand / Logo -->
      <div class="flex items-center gap-3 h-16 px-5 border-b border-white/10 shrink-0">
        <img
          v-if="themeStore.logo"
          :src="themeStore.logo"
          :alt="`${themeStore.brandName} logo`"
          class="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-white/15"
        />
        <div
          v-else
          class="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shadow-[0_10px_30px_var(--glow-color)] shrink-0"
        >
          <ZapIcon class="w-4 h-4 text-white" />
        </div>
        <span class="text-white font-bold text-lg tracking-tight truncate">{{ themeStore.brandName }}</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :exact="item.exact"
          class="relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-[var(--hover-accent)] hover:text-white group active:scale-[0.99]"
          active-class="bg-[rgba(var(--color-primary-rgb)/0.16)] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          @click="isMobileMenuOpen = false"
        >
          <span
            class="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-accent)] opacity-0 shadow-[0_0_18px_var(--glow-color)] transition-opacity duration-200 group-[.router-link-active]:opacity-100"
          />
          <component
            :is="item.icon"
            class="w-4.5 h-4.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <!-- Tenant / User Info at Bottom -->
      <div class="shrink-0 border-t border-white/10 p-4 space-y-3">
        <!-- Tenant badge -->
        <div class="flex items-center gap-2.5 px-1">
          <div
            class="w-2 h-2 rounded-full shrink-0"
            :class="authStore.isSuperadmin ? 'bg-amber-400' : 'bg-emerald-400'"
          />
          <div class="min-w-0">
            <p
              class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold leading-none mb-0.5"
            >
              {{ authStore.isSuperadmin ? 'Role' : 'Tenant' }}
            </p>
            <p class="text-sm text-slate-200 font-medium truncate leading-tight">
              {{ authStore.tenantName || '—' }}
            </p>
            <p class="text-[11px] text-slate-500 mt-1">
              {{ authStore.isSuperadmin ? 'Superadmin' : 'Tenant Admin' }}
            </p>
          </div>
        </div>

        <!-- User row -->
        <button
          class="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          @click="showLogoutModal = true"
          title="Click to sign out"
        >
          <div
            class="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs shrink-0"
          >
            {{ authStore.userInitials }}
          </div>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-sm text-slate-200 font-medium truncate leading-tight">
              {{ authStore.user?.name || authStore.user?.email || 'User' }}
            </p>
            <p class="text-[11px] text-slate-500 truncate leading-tight">Sign out</p>
          </div>
          <LogOutIcon
            class="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors"
          />
        </button>
      </div>
    </aside>

    <!-- ─── MAIN CONTENT ─────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Navbar -->
      <header
        class="nx-themed-topbar h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10"
      >
        <!-- Mobile hamburger -->
        <button
          class="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          @click="isMobileMenuOpen = true"
        >
          <MenuIcon class="w-5 h-5" />
        </button>

        <!-- Page breadcrumb / title spacer -->
        <div class="hidden lg:flex items-center gap-2 text-sm text-slate-500">
          <span class="font-semibold text-[var(--text-primary)]">{{ currentPageTitle }}</span>
        </div>

        <!-- Right side controls -->
        <div class="flex items-center gap-3 ml-auto">
          <!-- Tenant pill -->
          <div
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
            :class="
              authStore.isSuperadmin
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-[var(--primary-soft)] border-[rgba(var(--color-primary-rgb)/0.24)] text-[var(--color-primary)]'
            "
          >
            <ShieldCheckIcon v-if="authStore.isSuperadmin" class="w-3 h-3" />
            <BuildingIcon v-else class="w-3 h-3" />
            {{ authStore.tenantName }}
          </div>

          <div class="h-6 w-px bg-slate-200" />

          <!-- Notifications -->
          <button
            class="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <BellIcon class="w-4.5 h-4.5" />
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          <!-- Avatar -->
          <div
            class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shadow-sm cursor-default select-none"
          >
            {{ authStore.userInitials }}
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto w-full h-full">
          <RouterView v-slot="{ Component, route }">
            <Transition name="page" mode="out-in">
              <component :is="Component" v-if="Component" :key="route.fullPath" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
  <BaseModal
  v-model="showLogoutModal"

  title="Sign Out"

  description="Are you sure you want to sign out of your account?"

  @confirm="handleLogout"
/>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import BaseModal from '../components/BaseModal.vue'
import {
  LayoutDashboard,
  ShoppingBag,
  Home,
  Tags as TagsIcon,
  Activity as ActivityIcon,
  Menu as MenuIcon,
  Bell as BellIcon,
  LogOut as LogOutIcon,
  Zap as ZapIcon,
  ShieldCheck as ShieldCheckIcon,
  Building2 as BuildingIcon,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const showLogoutModal = ref(false)

// ─── Navigation items ──────────────────────────────────────────────────────
const navItems = computed(() => {
  const items = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      exact: true,
    },

    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },

    {
      name: 'Products',
      path: '/products',
      icon: ShoppingBag,
    },

    {
      name: 'Categories',
      path: '/categories',
      icon: TagsIcon,
    },

    {
      name: 'Audit Logs',
      path: '/audit-logs',
      icon: ActivityIcon,
    },
  ]

  // SUPERADMIN ONLY
  if (authStore.isSuperadmin) {
    items.push({
      name: 'Tenants',

      path: '/tenants',

      icon: BuildingIcon,
    })
  }

  return items
})

// ─── Dynamic page title for topbar ────────────────────────────────────────
const pageTitles = {
  home: 'Home',
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  tenants: 'Tenants',
  'audit-logs': 'Audit Logs',
}

const currentPageTitle = computed(() => pageTitles[route.name] || 'Nexora')

// ─── Logout ───────────────────────────────────────────────────────────────
const handleLogout = async () => {
  await authStore.logout()

  showLogoutModal.value = false

  router.push('/login')
}
</script>
