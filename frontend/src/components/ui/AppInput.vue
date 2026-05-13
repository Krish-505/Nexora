<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <div class="relative">
      <div v-if="$slots.icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <slot name="icon"></slot>
      </div>
      <input
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        v-bind="$attrs"
        :class="[
          'block w-full rounded-lg border-slate-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow outline-none border px-3 py-2 text-slate-900 placeholder-slate-400',
          { 'pl-10': $slots.icon },
          { 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500': error }
        ]"
      />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
defineOptions({
  inheritAttrs: false
})

defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: String,
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  error: String
})

defineEmits(['update:modelValue'])
</script>
