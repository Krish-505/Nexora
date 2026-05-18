<template>
  <DataTableWrapper>
    <table class="w-full text-left text-sm">
      <thead class="sticky top-0 z-10 border-b border-[var(--surface-border)] bg-[var(--surface-bg)] text-xs uppercase text-[var(--text-secondary)] backdrop-blur">
        <tr>
          <th
            v-for="(col, index) in columns"
            :key="col.key || index"
            :class="['px-5 py-3 font-bold tracking-[0.12em]', col.class]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--surface-border)]">
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-5 py-10">
            <LoadingSkeleton :rows="4" />
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length" class="px-5 py-12 text-center text-[var(--text-secondary)]">
            <slot name="empty">No data available.</slot>
          </td>
        </tr>
        <tr
          v-for="(row, rowIndex) in data"
          v-else
          :key="row.id || rowIndex"
          class="group transition duration-200 hover:bg-[var(--hover-accent)]"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="['px-5 py-4 transition duration-200 group-hover:translate-x-0.5', col.class]"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </DataTableWrapper>
</template>

<script setup>
import DataTableWrapper from './DataTableWrapper.vue'
import LoadingSkeleton from './LoadingSkeleton.vue'

defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
})
</script>
