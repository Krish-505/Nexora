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
  const logo = computed(() => activeTheme.value.logo || '')
  const mode = computed(() => activeTheme.value.mode)

  const commitToDom = (theme, metadata = {}) => {
    const normalized = applyThemeTokens(theme, metadata)

    activeTheme.value = normalized
    brandName.value = metadata.brandName || brandName.value || 'Nexora'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))

    return normalized
  }

  const initializeForUser = (user) => {
    const isSuperadmin = user?.role === 'superadmin'
    const fallback = isSuperadmin ? platformTheme : defaultTenantTheme
    const theme = normalizeTheme(user?.theme || fallback, fallback)
    const nextBrandName = isSuperadmin ? 'Nexora' : user?.tenantName || 'Workspace'

    committedTheme.value = { ...theme }

    return commitToDom(theme, { brandName: nextBrandName })
  }

  const applyPreview = (theme, metadata = {}) => commitToDom(theme, metadata)

  const commitTheme = (theme, metadata = {}) => {
    const normalized = commitToDom(theme, metadata)
    committedTheme.value = { ...normalized }

    return normalized
  }

  const restoreCommitted = (metadata = {}) => commitToDom(committedTheme.value, metadata)

  const resetToPlatform = () => {
    committedTheme.value = { ...platformTheme }
    return commitToDom(platformTheme, { brandName: 'Nexora' })
  }

  return {
    activeTheme,
    committedTheme,
    brandName,
    logo,
    mode,
    initializeForUser,
    applyPreview,
    commitTheme,
    restoreCommitted,
    resetToPlatform,
  }
})
