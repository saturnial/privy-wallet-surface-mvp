'use client';

import { PrivyProvider } from '@privy-io/react-auth';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!appId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Configuration Required</h1>
          <p className="text-sm text-gray-500">
            Set <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_PRIVY_APP_ID</code> in
            your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#6851FF',
          landingHeader: 'Sign in to your wallet',
          loginMessage: 'Enterprise payments, simplified.',
        },
        loginMethods: ['email'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
