import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { bindDomainEvent, createSocketClient } from '../services/socketClient'
import { dispatchRealtimeEvent } from '../services/realtimeDispatcher'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null)
  const connected = ref(false)
  const reconnecting = ref(false)
  const lastEventTimestamp = ref('')
  const connectionError = ref('')

  const disconnected = computed(() => !connected.value)

  const connect = () => {
    if (!localStorage.getItem('token')) return

    if (socket.value?.connected || socket.value?.active) {
      return
    }

    const client = createSocketClient()
    socket.value = client

    client.on('connect', () => {
      connected.value = true
      reconnecting.value = false
      connectionError.value = ''
    })

    client.on('disconnect', () => {
      connected.value = false
    })

    client.on('connect_error', (error) => {
      connected.value = false
      connectionError.value = error?.message || 'Realtime connection failed.'
    })

    client.io.on('reconnect_attempt', () => {
      reconnecting.value = true
    })

    client.io.on('reconnect', () => {
      reconnecting.value = false
      connectionError.value = ''
    })

    client.io.on('reconnect_error', (error) => {
      connectionError.value = error?.message || 'Realtime reconnect failed.'
    })

    bindDomainEvent(client, (event) => {
      lastEventTimestamp.value = event?.timestamp || new Date().toISOString()
      dispatchRealtimeEvent(event)
    })

    client.connect()
  }

  const disconnect = () => {
    if (!socket.value) return

    socket.value.removeAllListeners()
    socket.value.disconnect()
    socket.value = null
    connected.value = false
    reconnecting.value = false
  }

  return {
    connected,
    disconnected,
    reconnecting,
    lastEventTimestamp,
    connectionError,
    connect,
    disconnect,
  }
})
