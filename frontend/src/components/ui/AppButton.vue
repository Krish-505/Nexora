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
    'bg-slate-950 text-white shadow-[0_10px_28px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_18px_44px_rgba(15,23,42,0.24)] focus:ring-sky-500/20',
  secondary:
    'border border-slate-200 bg-white/80 text-slate-900 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md focus:ring-slate-500/15',
  outline:
    'border border-slate-200 bg-white/60 text-slate-700 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-md focus:ring-sky-500/15',
  ghost:
    'text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 focus:ring-slate-500/10',
  danger:
    'bg-red-600 text-white shadow-[0_10px_26px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_18px_42px_rgba(220,38,38,0.24)] focus:ring-red-500/20',
}
</script>
