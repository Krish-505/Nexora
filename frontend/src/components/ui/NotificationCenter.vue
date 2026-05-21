<template>
  <div ref="panelRoot" class="relative">
    <button
      class="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      :aria-expanded="isOpen"
      aria-label="Open notifications"
      @click="togglePanel"
    >
      <BellIcon class="h-4.5 w-4.5" />
      <span
        v-if="notificationStore.unreadCount"
        class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0 scale-[0.98]"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-2 opacity-0 scale-[0.98]"
    >
      <section
        v-if="isOpen"
        class="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-bg-strong)] shadow-[0_28px_90px_rgba(15,23,42,0.22)] ring-1 ring-slate-950/5 backdrop-blur-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[420px]"
      >
        <div class="border-b border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-3">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-black text-[var(--text-primary)]">Notifications</p>
              <p class="mt-1 text-xs text-[var(--text-secondary)]">
                {{ statusLabel }}
              </p>
            </div>

            <div class="flex items-center gap-1">
              <button
                class="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--hover-accent)] hover:text-[var(--text-primary)] disabled:opacity-40"
                :disabled="!notificationStore.unreadCount"
                title="Mark all as read"
                @click="notificationStore.markAllAsRead()"
              >
                <CheckCheckIcon class="h-4 w-4" />
              </button>
              <button
                class="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                :disabled="!notificationStore.notifications.length"
                title="Clear notifications"
                @click="notificationStore.clearNotifications()"
              >
                <Trash2Icon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="notificationStore.notifications.length"
          class="max-h-[min(70vh,520px)] overflow-y-auto p-2"
        >
          <TransitionGroup
            tag="div"
            class="space-y-2"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <article
              v-for="notification in notificationStore.notifications"
              :key="notification.id"
              class="group relative cursor-default rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              :class="itemClasses(notification)"
              @click="notificationStore.markAsRead(notification.id)"
            >
              <div
                class="absolute inset-y-3 left-0 w-1 rounded-r-full"
                :class="severityMeta[notification.severity]?.bar || severityMeta.info.bar"
              />

              <div class="flex gap-3 pl-2">
                <div
                  class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  :class="severityMeta[notification.severity]?.iconClass || severityMeta.info.iconClass"
                >
                  <component
                    :is="severityMeta[notification.severity]?.icon || severityMeta.info.icon"
                    class="h-4 w-4"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <p
                      class="text-sm leading-5"
                      :class="notification.read ? 'font-semibold text-[var(--text-primary)]' : 'font-black text-[var(--text-primary)]'"
                    >
                      {{ notification.title }}
                    </p>
                    <span
                      v-if="!notification.read"
                      class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)] shadow-[0_0_18px_var(--glow-color)]"
                    />
                  </div>

                  <p class="mt-1 line-clamp-2 text-sm leading-5 text-[var(--text-secondary)]">
                    {{ notification.message }}
                  </p>

                  <div class="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span class="font-medium text-[var(--text-secondary)]">
                      {{ relativeTime(notification.createdAt) }}
                    </span>
                    <button
                      v-if="!notification.read"
                      class="font-bold text-[var(--color-primary)] opacity-0 transition group-hover:opacity-100"
                      @click.stop="notificationStore.markAsRead(notification.id)"
                    >
                      Mark read
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </TransitionGroup>
        </div>

        <div v-else class="flex min-h-64 flex-col items-center justify-center px-8 py-10 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--color-primary)] ring-1 ring-[rgba(var(--color-primary-rgb)/0.18)]">
            <BellIcon class="h-6 w-6" />
          </div>
          <p class="mt-4 text-sm font-black text-[var(--text-primary)]">All clear</p>
          <p class="mt-2 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
            Realtime activity will appear here as your workspace changes.
          </p>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  AlertTriangle as AlertTriangleIcon,
  Bell as BellIcon,
  CheckCheck as CheckCheckIcon,
  CheckCircle2 as CheckCircleIcon,
  Info as InfoIcon,
  Trash2 as Trash2Icon,
  XCircle as XCircleIcon,
} from 'lucide-vue-next'
import { useNotificationStore } from '../../stores/notificationStore'
import { useSocketStore } from '../../stores/socketStore'

const notificationStore = useNotificationStore()
const socketStore = useSocketStore()
const isOpen = ref(false)
const panelRoot = ref(null)

const severityMeta = {
  info: {
    icon: InfoIcon,
    iconClass: 'bg-sky-50 text-sky-600',
    bar: 'bg-sky-500',
  },
  success: {
    icon: CheckCircleIcon,
    iconClass: 'bg-emerald-50 text-emerald-600',
    bar: 'bg-emerald-500',
  },
  warning: {
    icon: AlertTriangleIcon,
    iconClass: 'bg-amber-50 text-amber-600',
    bar: 'bg-amber-500',
  },
  error: {
    icon: XCircleIcon,
    iconClass: 'bg-red-50 text-red-600',
    bar: 'bg-red-500',
  },
}

const statusLabel = computed(() => {
  if (socketStore.reconnecting) return 'Reconnecting to realtime updates'
  if (socketStore.connected) return `${notificationStore.unreadCount} unread updates`
  return 'Realtime is offline; updates may be delayed'
})

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const itemClasses = (notification) => {
  if (!notification.read) {
    return 'border-[rgba(var(--color-primary-rgb)/0.24)] bg-[var(--primary-soft)]'
  }

  return 'border-[var(--surface-border)] bg-[var(--surface-bg)]'
}

const relativeTime = (timestamp) => {
  const diffInSeconds = Math.round((new Date(timestamp).getTime() - Date.now()) / 1000)
  const units = [
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ]
  const formatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

  for (const { unit, seconds } of units) {
    const value = Math.trunc(diffInSeconds / seconds)

    if (Math.abs(value) >= 1) {
      return formatter.format(value, unit)
    }
  }

  return 'just now'
}

const closeOnOutsideClick = (event) => {
  if (!isOpen.value || panelRoot.value?.contains(event.target)) return

  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', closeOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutsideClick)
})
</script>
