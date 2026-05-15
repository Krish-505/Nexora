<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-semibold text-slate-700">
      {{ label }}
    </label>
    <div class="relative">
      <div
        v-if="$slots.icon"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
      >
        <slot name="icon" />
      </div>
      <input
        :id="id"
        :value="modelValue"
        v-bind="$attrs"
        :class="[
          'nx-focus block h-10 w-full rounded-xl border bg-white/75 px-3 text-sm text-slate-900 shadow-sm backdrop-blur placeholder:text-slate-400',
          $slots.icon ? 'pl-10' : '',
          error ? 'border-red-300 text-red-900 focus:border-red-400 focus:ring-red-500/15' : 'border-slate-200',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
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
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  },
  error: String,
})

defineEmits(['update:modelValue'])
</script>
