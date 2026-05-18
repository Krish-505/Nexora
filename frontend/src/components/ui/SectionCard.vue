<template>
  <section class="nx-surface-strong nx-card-hover rounded-2xl">
    <div
      v-if="$slots.header || title"
      class="flex items-center justify-between gap-4 border-b border-[var(--surface-border)] px-5 py-4"
    >
      <slot name="header">
        <div>
          <h2 class="text-base font-bold text-[var(--text-primary)]">{{ title }}</h2>
          <p v-if="description" class="mt-1 text-sm text-[var(--text-secondary)]">{{ description }}</p>
        </div>
        <slot name="action" />
      </slot>
    </div>
    <div :class="['p-5', bodyClass]">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  bodyClass: {
    type: String,
    default: '',
  },
})
</script>
