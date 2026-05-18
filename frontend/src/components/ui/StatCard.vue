<template>
  <article
    class="nx-surface-strong nx-card-hover group relative overflow-hidden rounded-2xl p-5"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <div
      class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-[var(--text-secondary)]">{{ label }}</p>
        <p class="mt-3 text-3xl font-black tracking-normal text-[var(--text-primary)]">{{ value }}</p>
      </div>
      <div
        class="rounded-xl p-2.5 text-[var(--color-primary)] ring-1 ring-[rgba(var(--color-primary-rgb)/0.18)]"
        :style="{ background: 'var(--primary-soft)' }"
      >
        <component :is="icon" class="h-4 w-4" />
      </div>
    </div>
    <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <div
        class="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-700 ease-out"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </article>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: [Object, Function],
  progress: {
    type: Number,
    default: 100,
  },
  delay: {
    type: Number,
    default: 0,
  },
  iconClass: {
    type: String,
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
  barClass: {
    type: String,
    default: 'bg-slate-800',
  },
})
</script>
