'use client';

import AuthGuard from '@/components/AuthGuard';
import { BrandingProvider } from '@/components/PrivyWalletWidget';
import WalletDashboard from '@/components/PrivyWalletWidget/WalletDashboard';
import { privyDefaultBranding } from '@/lib/branding';

export default function DashboardPage() {
  return (
    <BrandingProvider branding={privyDefaultBranding}>
      <AuthGuard>
        <WalletDashboard sidebarOffset />
      </AuthGuard>
    </BrandingProvider>
  );
}
