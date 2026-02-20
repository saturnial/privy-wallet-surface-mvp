'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import SendFlow from '@/components/SendFlow';
import CryptoSendFlow from '@/components/crypto/CryptoSendFlow';
import { useInterfaceMode } from '@/lib/mode';
import { User } from '@/lib/types';

export default function SendPage() {
  const { user: privyUser } = usePrivy();
  const router = useRouter();
  const { mode } = useInterfaceMode();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [cryptoBalance, setCryptoBalance] = useState('0');

  const fetchUser = useCallback(async () => {
    if (!privyUser?.email?.address) return;
    const res = await fetch(`/api/user?email=${encodeURIComponent(privyUser.email.address)}`);
    if (res.ok) {
      const user = await res.json();
      setAppUser(user);

      if (mode === 'crypto') {
        const cryptoRes = await fetch(`/api/transactions?userId=${user.id}&mode=crypto`);
        const data = await cryptoRes.json();
        setCryptoBalance(data.balanceEth);
      }
    }
  }, [privyUser, mode]);

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

        <h1 className="text-xl font-bold text-gray-900 mb-4">
          {mode === 'crypto' ? 'Send ETH' : 'Send USD'}
        </h1>

        {appUser ? (
          mode === 'crypto' ? (
            <CryptoSendFlow
              appUser={appUser}
              balanceEth={cryptoBalance}
              onComplete={() => router.push('/')}
            />
          ) : (
            <SendFlow
              appUser={appUser}
              onComplete={() => router.push('/')}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
