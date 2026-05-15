<template>
  <div
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-b from-white to-slate-50/70 p-10 text-center shadow-sm"
  >
    <div
      class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:text-slate-600"
    >
      <slot name="icon">
        <InboxIcon class="h-6 w-6" />
      </slot>
    </div>
    <h3 class="text-base font-bold text-slate-900">{{ title }}</h3>
    <p class="mt-1 max-w-sm text-sm leading-6 text-slate-500">{{ description }}</p>
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
    required: true,
  },
  description: String,
})
</script>
