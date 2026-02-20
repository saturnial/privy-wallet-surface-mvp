'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { config } from '@/lib/config';

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace('/');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {config.logoText}
        </h1>
        <p className="text-gray-500 text-sm">
          Enterprise payments, simplified.
        </p>
      </div>

      <button
        onClick={login}
        disabled={!ready}
        className="px-8 py-3 rounded-xl text-white font-medium text-sm transition-colors disabled:opacity-50"
        style={{ backgroundColor: config.primaryColor }}
      >
        Sign In with Email
      </button>

      <p className="text-xs text-gray-400 mt-4">
        {config.customerName}
      </p>
    </div>
  );
}
