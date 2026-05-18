<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          class="fixed inset-0 bg-slate-950/55 backdrop-blur-xl"
          @click="closeOnBackdrop && $emit('update:modelValue', false)"
        />

        <Transition name="modal-panel" appear>
          <div
            v-if="modelValue"
            class="nx-surface-strong relative w-full overflow-hidden rounded-[var(--radius-card)] backdrop-blur-2xl"
            :style="{ maxWidth }"
          >
            <div
              class="flex items-center justify-between border-b border-[var(--surface-border)] bg-[var(--surface-muted)] px-6 py-4"
            >
              <h3 class="text-base font-bold text-[var(--text-primary)]">{{ title }}</h3>
              <button
                class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                @click="$emit('update:modelValue', false)"
              >
                <XIcon class="h-4 w-4" />
              </button>
            </div>

            <div class="max-h-[70vh] overflow-y-auto px-6 py-5">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="flex justify-end gap-3 border-t border-[var(--surface-border)] bg-[var(--surface-muted)] px-6 py-4"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import { X as XIcon } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  maxWidth: {
    type: String,
    default: '500px',
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])

watch(
  () => props.modelValue,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--nx-duration) var(--nx-ease);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-panel-enter-active,
.modal-panel-leave-active {
  transition:
    opacity var(--nx-duration-slow) var(--nx-ease),
    transform var(--nx-duration-slow) var(--nx-ease),
    filter var(--nx-duration-slow) var(--nx-ease);
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.96);
  filter: blur(8px);
}
</style>
