<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <slot name="header">
        <div>
          <h3 class="text-lg font-semibold text-slate-800">{{ title }}</h3>
          <p v-if="description" class="text-sm text-slate-500 mt-1">{{ description }}</p>
        </div>
        <slot name="action"></slot>
      </slot>
    </div>
    
    <!-- Content -->
    <div :class="['px-6 py-5', bodyClass]">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  bodyClass: {
    type: String,
    default: ''
  }
})
</script>
