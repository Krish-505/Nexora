<template>
  <div class="animate-reveal flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div class="max-w-3xl">
      <p
        v-if="eyebrow"
        class="text-xs font-bold uppercase tracking-[0.22em] text-slate-500"
      >
        {{ eyebrow }}
      </p>
      <h1 class="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-col gap-3 sm:flex-row">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: String,
  title: {
    type: String,
    required: true,
  },
  description: String,
})
</script>
