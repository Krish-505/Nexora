<template>
  <div class="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table class="w-full text-sm text-left">
      <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
        <tr>
          <th 
            v-for="(col, index) in columns" 
            :key="col.key || index"
            :class="['px-6 py-3 font-semibold', col.class]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-6 py-10 text-center">
            <div class="flex items-center justify-center text-slate-500">
              <Loader2Icon class="w-6 h-6 animate-spin mr-2" />
              Loading...
            </div>
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length" class="px-6 py-12 text-center text-slate-500">
            <slot name="empty">No data available.</slot>
          </td>
        </tr>
        <tr 
          v-else
          v-for="(row, rowIndex) in data" 
          :key="row.id || rowIndex"
          class="hover:bg-slate-50/50 transition-colors"
        >
          <td 
            v-for="col in columns" 
            :key="col.key"
            :class="['px-6 py-4', col.class]"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Loader2 as Loader2Icon } from 'lucide-vue-next'

defineProps({
  columns: {
    type: Array,
    required: true,
    // { key: 'name', label: 'Name', class: 'text-right' }
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})
</script>
