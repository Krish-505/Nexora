<template>
  <div class="space-y-3">
    <div
      v-for="row in rows"
      :key="row"
      class="h-11 rounded-xl bg-gradient-to-r from-slate-100 via-slate-200/80 to-slate-100 animate-shimmer"
      :style="{ animationDelay: `${row * 60}ms` }"
    />
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Number,
    default: 3,
  },
})
</script>
