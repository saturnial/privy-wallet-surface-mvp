'use client';

import { BrandingProvider } from './BrandingContext';
import WidgetFrame from './WidgetFrame';
import WidgetAuth from './WidgetAuth';
import WalletDashboard from './WalletDashboard';
import type { WidgetProps } from './widgetTypes';

export default function PrivyWalletWidget({ branding }: WidgetProps) {
  return (
    <BrandingProvider branding={branding}>
      <WidgetFrame>
        <WidgetAuth>
          <WalletDashboard />
        </WidgetAuth>
      </WidgetFrame>
    </BrandingProvider>
  );
}
