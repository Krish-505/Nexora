import { io } from 'socket.io-client'
import { REALTIME_DOMAIN_EVENT, REALTIME_NAMESPACE } from './realtimeEvents'

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export const createSocketClient = () =>
  io(`${apiBaseUrl}${REALTIME_NAMESPACE}`, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 700,
    reconnectionDelayMax: 5000,
    transports: ['websocket'],
    auth: (callback) => {
      callback({
        token: localStorage.getItem('token'),
      })
    },
  })

export const bindDomainEvent = (socket, handler) => {
  socket.on(REALTIME_DOMAIN_EVENT, handler)
}
