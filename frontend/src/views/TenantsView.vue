<script setup>
import { onMounted } from 'vue'

import { useTenantStore } from '../stores/tenantStore'

const tenantStore = useTenantStore()

onMounted(() => {
  tenantStore.fetchTenants()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Tenants</h1>

      <p class="text-slate-500 mt-1">Manage all platform tenants.</p>
    </div>

    <!-- Loading -->
    <div v-if="tenantStore.loading" class="text-slate-500">Loading tenants...</div>

    <!-- Error -->
    <div v-if="tenantStore.error" class="text-red-500">
      {{ tenantStore.error }}
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left p-4">Name</th>

            <th class="text-left p-4">Slug</th>

            <th class="text-left p-4">Status</th>

            <th class="text-left p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="tenant in tenantStore.tenants"
            :key="tenant.id"
            class="border-b border-slate-100"
          >
            <td class="p-4">
              {{ tenant.name }}
            </td>

            <td class="p-4">
              {{ tenant.slug }}
            </td>

            <td class="p-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="tenant.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ tenant.active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td class="p-4">
              <button
                class="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm"
                @click="tenantStore.toggleTenantStatus(tenant.id)"
              >
                {{ tenant.active ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
