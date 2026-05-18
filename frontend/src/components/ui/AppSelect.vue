<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-semibold text-[var(--text-primary)]">
      {{ label }}
    </label>
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :class="[
          'nx-focus nx-themed-field h-10 w-full appearance-none rounded-xl border px-3 pr-9 text-sm shadow-sm backdrop-blur',
          error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15' : 'border-slate-200',
        ]"
        v-bind="$attrs"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <slot />
      </select>
      <ChevronDownIcon
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { ChevronDown as ChevronDownIcon } from 'lucide-vue-next'

defineOptions({
  inheritAttrs: false,
})

defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: String,
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`,
  },
  error: String,
})

defineEmits(['update:modelValue'])
</script>
