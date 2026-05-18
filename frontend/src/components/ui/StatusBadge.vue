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
  neutral: 'bg-[var(--surface-muted)] text-[var(--text-secondary)] ring-[var(--surface-border)]',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-[var(--primary-soft)] text-[var(--color-primary)] ring-[rgba(var(--color-primary-rgb)/0.20)]',
}

const dotClasses = {
  neutral: 'bg-[var(--text-secondary)]',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-[var(--color-primary)]',
}
</script>
