<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-2 opacity-0"
      >
        <div
          v-for="toast in notificationStore.toasts"
          :key="toast.id"
          class="pointer-events-auto overflow-hidden rounded-2xl border bg-white shadow-xl ring-1 ring-slate-950/5"
          :class="toneClasses[toast.type]"
        >
          <div class="flex items-start gap-3 px-4 py-3.5">
            <div class="mt-0.5 rounded-full p-1.5" :class="iconToneClasses[toast.type]">
              <component :is="iconMap[toast.type]" class="h-4 w-4" />
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-900">{{ toast.title }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ toast.message }}</p>
            </div>

            <button
              class="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              @click="notificationStore.removeToast(toast.id)"
            >
              <XIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useNotificationStore } from '../../stores/notificationStore'

const notificationStore = useNotificationStore()

const iconMap = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

const toneClasses = {
  success: 'border-emerald-200',
  error: 'border-red-200',
  info: 'border-sky-200',
}

const iconToneClasses = {
  success: 'bg-emerald-50 text-emerald-600',
  error: 'bg-red-50 text-red-600',
  info: 'bg-sky-50 text-sky-600',
}

const XIcon = X
</script>
