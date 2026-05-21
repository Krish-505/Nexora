import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  applyThemeTokens,
  defaultTenantTheme,
  normalizeTheme,
  platformTheme,
} from '../services/themeService'

const STORAGE_KEY = 'nexora:theme'

const readCachedTheme = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

export const useThemeStore = defineStore('theme', () => {
  const activeTheme = ref(normalizeTheme(readCachedTheme() || platformTheme, platformTheme))
  const committedTheme = ref({ ...activeTheme.value })
  const brandName = ref('Nexora')
  const activeTenantId = ref(null)
  const committedTenantId = ref(null)
  const previewTenantId = ref(null)
  const isPreviewing = ref(false)
  const lastRealtimeThemeAt = ref('')
  const logo = computed(() => activeTheme.value.logo || '')
  const mode = computed(() => activeTheme.value.mode)

  const commitToDom = (theme, metadata = {}) => {
    const normalized = applyThemeTokens(theme, metadata)

    activeTheme.value = normalized
    brandName.value = metadata.brandName || brandName.value || 'Nexora'
    activeTenantId.value = metadata.tenantId ?? activeTenantId.value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))

    return normalized
  }

  const initializeForUser = (user) => {
    const isSuperadmin = user?.role === 'superadmin'
    const fallback = isSuperadmin ? platformTheme : defaultTenantTheme
    const theme = normalizeTheme(user?.theme || fallback, fallback)
    const nextBrandName = isSuperadmin ? 'Nexora' : user?.tenantName || 'Workspace'

    committedTheme.value = { ...theme }
    activeTenantId.value = isSuperadmin ? null : user?.tenantId || null
    committedTenantId.value = activeTenantId.value
    previewTenantId.value = null
    isPreviewing.value = false

    return commitToDom(theme, {
      brandName: nextBrandName,
      tenantId: activeTenantId.value,
    })
  }

  const applyPreview = (theme, metadata = {}) => {
    previewTenantId.value = metadata.tenantId ?? previewTenantId.value
    isPreviewing.value = true

    return commitToDom(theme, metadata)
  }

  const commitTheme = (theme, metadata = {}) => {
    const normalized = commitToDom(theme, metadata)
    committedTheme.value = { ...normalized }
    committedTenantId.value = metadata.tenantId ?? activeTenantId.value
    isPreviewing.value = false
    previewTenantId.value = null

    return normalized
  }

  const restoreCommitted = (metadata = {}) => {
    isPreviewing.value = false
    previewTenantId.value = null

    return commitToDom(committedTheme.value, {
      ...metadata,
      tenantId: committedTenantId.value,
    })
  }

  const resetToPlatform = () => {
    committedTheme.value = { ...platformTheme }
    activeTenantId.value = null
    committedTenantId.value = null
    previewTenantId.value = null
    isPreviewing.value = false

    return commitToDom(platformTheme, { brandName: 'Nexora', tenantId: null })
  }

  const applyRealtimeThemeUpdate = (event, user) => {
    const payload = event?.payload || {}
    const tenantId = event?.tenantId || payload.tenantId || payload.tenant?.id || null
    const theme = payload.theme || payload.tenant?.theme

    if (!tenantId || !theme || !user) return false

    const isTenantUser = user.role !== 'superadmin' && user.tenantId === tenantId
    const isSuperadminPreview =
      user.role === 'superadmin' &&
      isPreviewing.value &&
      previewTenantId.value === tenantId

    if (!isTenantUser && !isSuperadminPreview) return false

    const normalized = normalizeTheme(theme, isTenantUser ? defaultTenantTheme : platformTheme)
    const nextBrandName =
      isTenantUser
        ? user.tenantName || payload.tenantName || payload.tenant?.name || 'Workspace'
        : payload.tenantName || payload.tenant?.name || brandName.value

    commitToDom(normalized, {
      brandName: nextBrandName,
      tenantId,
      realtime: true,
    })

    if (isTenantUser) {
      committedTheme.value = { ...normalized }
      committedTenantId.value = tenantId
    }

    lastRealtimeThemeAt.value = event.timestamp || new Date().toISOString()

    return true
  }

  return {
    activeTheme,
    committedTheme,
    brandName,
    activeTenantId,
    committedTenantId,
    previewTenantId,
    isPreviewing,
    lastRealtimeThemeAt,
    logo,
    mode,
    initializeForUser,
    applyPreview,
    commitTheme,
    restoreCommitted,
    resetToPlatform,
    applyRealtimeThemeUpdate,
  }
})
