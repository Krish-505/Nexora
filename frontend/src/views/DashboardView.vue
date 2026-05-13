<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
      <p class="text-sm text-slate-500 mt-1">Welcome back. Here's what's happening with your store today.</p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <AppCard v-for="(stat, idx) in stats" :key="idx" class="relative overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-500">{{ stat.title }}</h3>
          <component :is="stat.icon" class="w-5 h-5 text-slate-400" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ stat.value }}</span>
          <span :class="['text-sm font-medium', stat.trendUp ? 'text-emerald-600' : 'text-red-600']">
            {{ stat.trendUp ? '+' : '-' }}{{ stat.trend }}%
          </span>
        </div>
        <div 
          class="absolute bottom-0 left-0 h-1 bg-primary-500" 
          :style="{ width: stat.progress + '%' }"
        ></div>
      </AppCard>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Placeholder -->
      <AppCard class="lg:col-span-2" title="Revenue Overview" description="Monthly revenue across all channels">
        <template #action>
          <AppButton variant="outline" size="sm">View Report</AppButton>
        </template>
        <div class="h-72 w-full flex items-center justify-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200 mt-2">
          <div class="text-center text-slate-400">
            <BarChartIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <span class="text-sm font-medium">Chart visualization data</span>
          </div>
        </div>
      </AppCard>

      <!-- Recent Activity -->
      <AppCard title="Recent Activity">
        <div class="space-y-6 mt-2">
          <div v-for="(activity, i) in activities" :key="i" class="flex gap-4">
            <div class="relative flex flex-col items-center">
              <div class="w-2 h-2 rounded-full bg-primary-500 mt-1.5"></div>
              <div v-if="i !== activities.length - 1" class="w-px h-full bg-slate-200 absolute top-3"></div>
            </div>
            <div class="flex-1 pb-1">
              <p class="text-sm text-slate-800 font-medium">{{ activity.action }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import { 
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  ShoppingCart as ShoppingCartIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChartIcon
} from 'lucide-vue-next'

const stats = [
  { title: 'Total Revenue', value: '$45,231.89', trend: '20.1', trendUp: true, progress: 75, icon: DollarSignIcon },
  { title: 'Active Users', value: '+2350', trend: '10.5', trendUp: true, progress: 60, icon: UsersIcon },
  { title: 'Sales', value: '+12,234', trend: '4.2', trendUp: true, progress: 45, icon: ShoppingCartIcon },
  { title: 'Active Now', value: '573', trend: '1.2', trendUp: false, progress: 30, icon: ActivityIcon },
]

const activities = [
  { action: 'New order #3210 received', time: '10 minutes ago' },
  { action: 'New user registration', time: '1 hour ago' },
  { action: 'System update completed', time: '2 hours ago' },
  { action: 'Database backup finished', time: 'Yesterday' },
]
</script>