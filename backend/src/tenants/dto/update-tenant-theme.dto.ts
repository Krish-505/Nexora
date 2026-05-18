import type {
  TenantSidebarStyle,
  TenantSurfaceStyle,
  TenantThemeMode,
} from '../../database/theme-defaults';

export class UpdateTenantThemeDto {
  primaryColor?: string;

  accentColor?: string;

  mode?: TenantThemeMode;

  sidebarStyle?: TenantSidebarStyle;

  surfaceStyle?: TenantSurfaceStyle;

  logo?: string;
}
