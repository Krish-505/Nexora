<template>
  <AppModal
    :model-value="modelValue"
    :title="title"
    max-width="520px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex gap-4">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
        <AlertTriangleIcon class="h-5 w-5" />
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ message }}</p>
        <p v-if="description" class="mt-2 text-sm leading-6 text-slate-500">
          {{ description }}
        </p>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="$emit('update:modelValue', false)">Cancel</AppButton>
      <AppButton variant="danger" :loading="loading" @click="$emit('confirm')">
        {{ confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup>
import { AlertTriangle as AlertTriangleIcon } from 'lucide-vue-next'
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'

defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    required: true,
  },
  description: String,
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  loading: Boolean,
})

defineEmits(['update:modelValue', 'confirm'])
</script>
