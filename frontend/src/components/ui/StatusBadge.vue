<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1"
    :class="toneClasses[tone]"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="dotClasses[tone]" />
    <slot />
  </span>
</template>

<script setup>
defineProps({
  tone: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'success', 'danger', 'warning', 'info'].includes(value),
  },
})

const toneClasses = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
}

const dotClasses = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
}
</script>
