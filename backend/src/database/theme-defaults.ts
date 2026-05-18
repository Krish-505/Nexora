export type TenantThemeMode = 'light' | 'dark';
export type TenantSidebarStyle = 'glass' | 'solid' | 'minimal';
export type TenantSurfaceStyle = 'elevated' | 'soft' | 'bordered';

export type TenantTheme = {
  primaryColor: string;
  accentColor: string;
  mode: TenantThemeMode;
  sidebarStyle: TenantSidebarStyle;
  surfaceStyle: TenantSurfaceStyle;
  logo: string;
};

export const defaultTenantTheme: TenantTheme = {
  primaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  mode: 'light',
  sidebarStyle: 'glass',
  surfaceStyle: 'elevated',
  logo: '',
};

export const createDefaultTenantTheme = (): TenantTheme => ({
  ...defaultTenantTheme,
});
