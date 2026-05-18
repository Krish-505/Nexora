<template>
  <button
    :class="[
      'group relative inline-flex items-center justify-center overflow-hidden rounded-xl font-semibold',
      'transition-all duration-200 ease-out active:scale-[0.98]',
      'focus:outline-none focus:ring-4 disabled:pointer-events-none disabled:opacity-55',
      sizeClasses[size],
      variantClasses[variant],
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span
      v-if="variant === 'primary'"
      class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
    <Loader2Icon v-if="loading" class="relative mr-2 h-4 w-4 animate-spin" />
    <span class="relative inline-flex items-center">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { Loader2 as Loader2Icon } from 'lucide-vue-next'

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(val),
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val),
  },
  disabled: Boolean,
  loading: Boolean,
})

defineEmits(['click'])

const sizeClasses = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

const variantClasses = {
  primary:
    'nx-token-button-primary border border-white/10 hover:-translate-y-0.5 focus:ring-[rgba(var(--color-primary-rgb)/0.20)]',
  secondary:
    'nx-token-button-secondary border shadow-sm backdrop-blur hover:-translate-y-0.5 hover:shadow-md focus:ring-[rgba(var(--color-primary-rgb)/0.14)]',
  outline:
    'border bg-transparent text-[var(--text-primary)] shadow-sm backdrop-blur hover:-translate-y-0.5 hover:bg-[var(--hover-accent)] hover:shadow-md focus:ring-[rgba(var(--color-primary-rgb)/0.14)] border-[var(--surface-border)]',
  ghost:
    'text-[var(--text-secondary)] hover:bg-[var(--hover-accent)] hover:text-[var(--text-primary)] focus:ring-[rgba(var(--color-primary-rgb)/0.10)]',
  danger:
    'bg-red-600 text-white shadow-[0_10px_26px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_18px_42px_rgba(220,38,38,0.24)] focus:ring-red-500/20',
}
</script>
