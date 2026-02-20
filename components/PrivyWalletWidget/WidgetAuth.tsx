'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useBranding } from './BrandingContext';

export default function WidgetAuth({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login } = usePrivy();
  const { brandName, primaryColor } = useBranding();

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <p className="text-sm text-gray-500 text-center">
          Sign in to access your {brandName} wallet
        </p>
        <button
          onClick={login}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          Sign In
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
