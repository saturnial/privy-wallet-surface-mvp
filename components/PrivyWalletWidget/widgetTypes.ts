export type SurfaceStyle = 'full' | 'compact';

export interface BrandingConfig {
  brandName: string;
  primaryColor: string;
  surfaceStyle: SurfaceStyle;
  customerSupportUrl?: string;
}

export interface WidgetProps {
  branding: BrandingConfig;
}
