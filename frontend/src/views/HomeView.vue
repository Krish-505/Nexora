<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
        Welcome back{{ authStore.user?.name ? `, ${authStore.user.name}` : '' }}
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Here's an overview of your
        <span class="font-medium text-slate-700">{{ authStore.tenantName }}</span>
        workspace.
      </p>
    </div>

    <!-- Hero card -->
    <AppCard>
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <div
          class="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
        >
          <RocketIcon class="w-8 h-8" />
        </div>

        <h2 class="text-2xl font-bold text-slate-800 mb-2">Get Started with Your Workspace</h2>
        <p class="text-slate-500 max-w-md mx-auto mb-8">
          Your tenant workspace is active. Manage products, view analytics, and
          control your enterprise settings from the sidebar.
        </p>

        <div class="flex flex-wrap gap-4 justify-center">
          <AppButton @click="$router.push('/dashboard')" size="lg">Go to Dashboard</AppButton>
          <AppButton variant="outline" @click="$router.push('/products')" size="lg">
            <ShoppingBagIcon class="w-4 h-4 mr-2" />
            View Products
          </AppButton>
        </div>

        <!-- Auth status pill -->
        <div class="mt-8 flex items-center justify-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span class="text-sm font-medium text-slate-600">
            Authenticated as
            <span class="text-slate-800 font-semibold">{{ authStore.tenantName }}</span>
          </span>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import { Rocket as RocketIcon, ShoppingBag as ShoppingBagIcon } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
</script>