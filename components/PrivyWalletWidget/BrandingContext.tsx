'use client';

import { createContext, useContext } from 'react';
import type { BrandingConfig } from './widgetTypes';

const BrandingContext = createContext<BrandingConfig | null>(null);

export function BrandingProvider({
  branding,
  children,
}: {
  branding: BrandingConfig;
  children: React.ReactNode;
}) {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingConfig {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return ctx;
}

export function useCompact(): boolean {
  const { surfaceStyle } = useBranding();
  return surfaceStyle === 'compact';
}
