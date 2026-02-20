'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import DebugPanel from '@/components/DebugPanel';
import { User } from '@/lib/types';
import { config } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';

export default function ReceivePage() {
  const { user: privyUser } = usePrivy();
  const router = useRouter();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [deposited, setDeposited] = useState(false);

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

  const handleSimulateDeposit = async () => {
    if (!appUser) return;
    setLoading(true);
    setDeposited(false);

    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: appUser.id,
        type: 'receive',
        amountCents: config.simulatedDepositCents,
        counterpartyLabel: 'Simulated Deposit',
      }),
    });

    await fetchUser();
    setDeposited(true);
    setLoading(false);
  };

  return (
    <AuthGuard>
      <div>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; Back
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Receive USD</h1>
        <p className="text-sm text-gray-500 mb-6">
          Deposit funds into your wallet.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Deposit Instructions
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            In production, deposits would arrive via ACH, wire transfer, or
            stablecoin rails. For this demo, simulate a deposit below.
          </p>

          <button
            onClick={handleSimulateDeposit}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: config.primaryColor }}
          >
            {loading ? 'Processing...' : `Simulate Deposit ${formatCurrency(config.simulatedDepositCents)}`}
          </button>

          {deposited && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-medium text-green-700">
                {formatCurrency(config.simulatedDepositCents)} deposited successfully
              </p>
            </div>
          )}
        </div>

        <DebugPanel />
      </div>
    </AuthGuard>
  );
}
