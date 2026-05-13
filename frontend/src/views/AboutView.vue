<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">System Information</h1>
      <p class="text-sm text-slate-500 mt-1">Overview of your enterprise SaaS architecture.</p>
    </div>

    <!-- Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AppCard title="Architecture Details">
        <ul class="space-y-4 mt-2">
          <li class="flex items-start gap-3">
            <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
              <CheckCircleIcon class="w-4 h-4" />
            </div>
            <div>
              <h4 class="font-medium text-slate-800 text-sm">Vue 3 Composition API</h4>
              <p class="text-xs text-slate-500 mt-0.5">Using modern setup script patterns</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <div class="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
              <CheckCircleIcon class="w-4 h-4" />
            </div>
            <div>
              <h4 class="font-medium text-slate-800 text-sm">Tailwind CSS</h4>
              <p class="text-xs text-slate-500 mt-0.5">Utility-first scalable design system</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <div class="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
              <CheckCircleIcon class="w-4 h-4" />
            </div>
            <div>
              <h4 class="font-medium text-slate-800 text-sm">Pinia State Management</h4>
              <p class="text-xs text-slate-500 mt-0.5">Modular reactive store architecture</p>
            </div>
          </li>
        </ul>
      </AppCard>
      
      <AppCard title="Contact Support" class="bg-primary-50 border-primary-100">
        <div class="flex flex-col items-center justify-center h-full py-6 text-center">
          <MessageSquareIcon class="w-10 h-10 text-primary-500 mb-4" />
          <h3 class="font-semibold text-slate-800">Need Help?</h3>
          <p class="text-sm text-slate-600 mt-2 mb-6 max-w-xs">
            Our enterprise support team is available 24/7 to assist with your multi-tenant environment.
          </p>
          <AppButton>Contact Support</AppButton>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import { CheckCircle as CheckCircleIcon, MessageSquare as MessageSquareIcon } from 'lucide-vue-next'
</script>