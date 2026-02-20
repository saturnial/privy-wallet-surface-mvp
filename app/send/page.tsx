'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import SendFlow from '@/components/SendFlow';
import { User } from '@/lib/types';

export default function SendPage() {
  const { user: privyUser } = usePrivy();
  const router = useRouter();
  const [appUser, setAppUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    if (!privyUser?.email?.address) return;
    const res = await fetch(`/api/user?email=${encodeURIComponent(privyUser.email.address)}`);
    if (res.ok) {
      setAppUser(await res.json());
    }
  }, [privyUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthGuard>
      <div>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; Back
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-4">Send USD</h1>

        {appUser ? (
          <SendFlow
            appUser={appUser}
            onComplete={() => router.push('/')}
          />
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
