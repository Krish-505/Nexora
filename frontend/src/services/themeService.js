import apiClient from './apiClient'

export const THEME_MODES = ['light', 'dark']
export const SIDEBAR_STYLES = ['glass', 'solid', 'minimal']
export const SURFACE_STYLES = ['elevated', 'soft', 'bordered']

export const platformTheme = {
  primaryColor: '#0ea5e9',
  accentColor: '#22d3ee',
  mode: 'light',
  sidebarStyle: 'solid',
  surfaceStyle: 'elevated',
  logo: '',
}

export const defaultTenantTheme = {
  primaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  mode: 'light',
  sidebarStyle: 'glass',
  surfaceStyle: 'elevated',
  logo: '',
}

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
let themeSyncTimer = null

const clamp = (value, min = 0, max = 255) => Math.min(Math.max(Math.round(value), min), max)

const expandHex = (hex) => {
  const value = hex.replace('#', '')

  if (value.length === 3) {
    return value
      .split('')
      .map((part) => part + part)
      .join('')
  }

  return value
}

const hexToRgb = (hex) => {
  const value = expandHex(hex)

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

const rgbToCss = ({ r, g, b }) => `${clamp(r)} ${clamp(g)} ${clamp(b)}`

const mix = (hex, targetHex, amount) => {
  const color = hexToRgb(hex)
  const target = hexToRgb(targetHex)

  return {
    r: color.r + (target.r - color.r) * amount,
    g: color.g + (target.g - color.g) * amount,
    b: color.b + (target.b - color.b) * amount,
  }
}

const normalizeColor = (value, fallback) =>
  HEX_COLOR_PATTERN.test(value || '') ? value : fallback

export const normalizeTheme = (theme = {}, fallback = defaultTenantTheme) => ({
  primaryColor: normalizeColor(theme.primaryColor, fallback.primaryColor),
  accentColor: normalizeColor(theme.accentColor, fallback.accentColor),
  mode: THEME_MODES.includes(theme.mode) ? theme.mode : fallback.mode,
  sidebarStyle: SIDEBAR_STYLES.includes(theme.sidebarStyle)
    ? theme.sidebarStyle
    : fallback.sidebarStyle,
  surfaceStyle: SURFACE_STYLES.includes(theme.surfaceStyle)
    ? theme.surfaceStyle
    : fallback.surfaceStyle,
  logo: typeof theme.logo === 'string' ? theme.logo : fallback.logo,
})

export const buildThemeTokens = (theme) => {
  const normalized = normalizeTheme(theme)
  const isDark = normalized.mode === 'dark'
  const primaryRgb = hexToRgb(normalized.primaryColor)
  const accentRgb = hexToRgb(normalized.accentColor)
  const primarySoft = rgbToCss(mix(normalized.primaryColor, isDark ? '#0f172a' : '#ffffff', 0.84))
  const accentSoft = rgbToCss(mix(normalized.accentColor, isDark ? '#0f172a' : '#ffffff', 0.86))
  const glowRgb = rgbToCss(mix(normalized.accentColor, normalized.primaryColor, 0.28))

  const surfacePresets = {
    elevated: {
      '--surface-bg': isDark ? 'rgba(15, 23, 42, 0.86)' : 'rgba(255, 255, 255, 0.88)',
      '--surface-border': isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.26)',
      '--card-shadow': isDark
        ? `0 28px 80px rgba(0, 0, 0, 0.34), 0 0 52px rgba(${glowRgb} / 0.10)`
        : `0 22px 64px rgba(15, 23, 42, 0.12), 0 0 44px rgba(${glowRgb} / 0.12)`,
    },
    soft: {
      '--surface-bg': isDark ? 'rgba(30, 41, 59, 0.68)' : 'rgba(248, 250, 252, 0.86)',
      '--surface-border': isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(203, 213, 225, 0.44)',
      '--card-shadow': isDark ? '0 18px 48px rgba(0, 0, 0, 0.24)' : '0 16px 42px rgba(15, 23, 42, 0.08)',
    },
    bordered: {
      '--surface-bg': isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.72)',
      '--surface-border': `rgba(${rgbToCss(primaryRgb)} / 0.34)`,
      '--card-shadow': 'none',
    },
  }

  const sidebarPresets = {
    glass: {
      '--sidebar-bg': isDark
        ? `linear-gradient(180deg, rgba(2, 6, 23, 0.84), rgba(${rgbToCss(primaryRgb)} / 0.18))`
        : `linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(${primarySoft} / 0.92))`,
      '--sidebar-border': `rgba(${rgbToCss(accentRgb)} / 0.20)`,
      '--sidebar-text': isDark ? 'rgba(226, 232, 240, 0.74)' : 'rgba(51, 65, 85, 0.78)',
    },
    solid: {
      '--sidebar-bg': isDark
        ? `linear-gradient(180deg, #020617, rgba(${rgbToCss(primaryRgb)} / 0.30))`
        : `linear-gradient(180deg, #020617, rgba(${rgbToCss(primaryRgb)} / 0.48))`,
      '--sidebar-border': 'rgba(255, 255, 255, 0.10)',
      '--sidebar-text': 'rgba(226, 232, 240, 0.72)',
    },
    minimal: {
      '--sidebar-bg': isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.94)',
      '--sidebar-border': isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(203, 213, 225, 0.72)',
      '--sidebar-text': isDark ? 'rgba(203, 213, 225, 0.74)' : 'rgba(71, 85, 105, 0.84)',
    },
  }

  return {
    '--color-primary': normalized.primaryColor,
    '--color-primary-rgb': rgbToCss(primaryRgb),
    '--color-accent': normalized.accentColor,
    '--color-accent-rgb': rgbToCss(accentRgb),
    '--text-primary': isDark ? '#f8fafc' : '#020617',
    '--text-secondary': isDark ? '#94a3b8' : '#64748b',
    '--text-inverse': '#ffffff',
    '--hover-accent': `rgba(${rgbToCss(accentRgb)} / ${isDark ? '0.18' : '0.12'})`,
    '--glow-color': `rgba(${glowRgb} / ${isDark ? '0.32' : '0.24'})`,
    '--radius-card': normalized.surfaceStyle === 'bordered' ? '12px' : '18px',
    '--transition-speed': '220ms',
    '--app-bg': isDark
      ? `radial-gradient(circle at 20% -10%, rgba(${rgbToCss(primaryRgb)} / 0.18), transparent 34rem), linear-gradient(180deg, #020617 0%, #0f172a 100%)`
      : `radial-gradient(circle at 18% -10%, rgba(${rgbToCss(primaryRgb)} / 0.14), transparent 34rem), radial-gradient(circle at 86% 4%, rgba(${rgbToCss(accentRgb)} / 0.12), transparent 28rem), linear-gradient(180deg, #fbfdff 0%, #f7f9fc 44%, #f8fafc 100%)`,
    '--surface-bg-strong': isDark ? 'rgba(15, 23, 42, 0.94)' : '#ffffff',
    '--surface-muted': isDark ? 'rgba(30, 41, 59, 0.62)' : 'rgba(248, 250, 252, 0.86)',
    '--focus-ring': `0 0 0 4px rgba(${rgbToCss(primaryRgb)} / 0.16)`,
    '--primary-soft': `rgba(${primarySoft} / ${isDark ? '0.22' : '0.95'})`,
    '--accent-soft': `rgba(${accentSoft} / ${isDark ? '0.20' : '0.92'})`,
    ...surfacePresets[normalized.surfaceStyle],
    ...sidebarPresets[normalized.sidebarStyle],
  }
}

export const applyThemeTokens = (theme, metadata = {}) => {
  const normalized = normalizeTheme(theme)
  const root = document.documentElement
  const tokens = buildThemeTokens(normalized)

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  root.dataset.themeMode = normalized.mode
  root.dataset.sidebarStyle = normalized.sidebarStyle
  root.dataset.surfaceStyle = normalized.surfaceStyle
  root.dataset.brandName = metadata.brandName || 'Nexora'

  if (metadata.realtime) {
    root.dataset.themeSync = 'live'
    window.clearTimeout(themeSyncTimer)
    themeSyncTimer = window.setTimeout(() => {
      delete root.dataset.themeSync
    }, 520)
  }

  return normalized
}

export const updateTenantThemeApi = async (tenantId, theme) => {
  const response = await apiClient.patch(`/tenants/${tenantId}/theme`, theme)

  return response.data
}
