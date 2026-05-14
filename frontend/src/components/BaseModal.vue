<template>
  <Transition name="fade">

    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <!-- Modal -->
      <div
        class="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 pt-6">
          <h2
            class="text-xl font-bold text-slate-900"
          >
            {{ title }}
          </h2>

          <p
            class="mt-2 text-sm text-slate-500"
          >
            {{ description }}
          </p>
        </div>

        <!-- Footer -->
        <div
          class="flex justify-end gap-3 px-6 py-5 mt-6 bg-slate-50 border-t border-slate-100"
        >
          <button
            class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            @click="$emit('update:modelValue', false)"
          >
            Cancel
          </button>

          <button
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            @click="$emit('confirm')"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>

  </Transition>
</template>

<script setup>
defineProps({
  modelValue: Boolean,

  title: {
    type: String,
    default: 'Confirm Action',
  },

  description: {
    type: String,
    default: '',
  },
})

defineEmits([
  'update:modelValue',
  'confirm',
])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>