<template>
  <div class="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
    <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
      <slot name="icon">
        <InboxIcon class="w-6 h-6" />
      </slot>
    </div>
    <h3 class="text-lg font-semibold text-slate-800">{{ title }}</h3>
    <p class="text-sm text-slate-500 mt-1 max-w-sm">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
import { Inbox as InboxIcon } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: String
})
</script>
