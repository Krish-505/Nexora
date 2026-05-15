<template>
  <article
    class="nx-surface-strong nx-card-hover group relative overflow-hidden rounded-2xl p-5"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <div
      class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-slate-500">{{ label }}</p>
        <p class="mt-3 text-3xl font-black tracking-normal text-slate-950">{{ value }}</p>
      </div>
      <div class="rounded-xl p-2.5 ring-1" :class="iconClass">
        <component :is="icon" class="h-4 w-4" />
      </div>
    </div>
    <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-full rounded-full transition-all duration-700 ease-out"
        :class="barClass"
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
