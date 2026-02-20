'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import BalanceCard from '@/components/BalanceCard';
import ActionButtons from '@/components/ActionButtons';
import TransactionList from '@/components/TransactionList';
import CryptoBalanceCard from '@/components/crypto/CryptoBalanceCard';
import CryptoActionButtons from '@/components/crypto/CryptoActionButtons';
import CryptoTransactionList from '@/components/crypto/CryptoTransactionList';
import { useInterfaceMode } from '@/lib/mode';
import { User, Transaction, CryptoTransaction } from '@/lib/types';
import { config } from '@/lib/config';

export default function DashboardPage() {
  const { user: privyUser } = usePrivy();
  const { mode } = useInterfaceMode();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoTransactions, setCryptoTransactions] = useState<CryptoTransaction[]>([]);
  const [cryptoBalance, setCryptoBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (userId: string, currentMode: string) => {
    if (currentMode === 'crypto') {
      const res = await fetch(`/api/transactions?userId=${userId}&mode=crypto`);
      const data = await res.json();
      setCryptoBalance(data.balanceEth);
      setCryptoTransactions(data.transactions);
    } else {
      const txRes = await fetch(`/api/transactions?userId=${userId}`);
      const txns = await txRes.json();
      setTransactions(txns);
    }
  }, []);

  useEffect(() => {
    if (!privyUser) return;

    const email = privyUser.email?.address;
    const walletAddress = privyUser.wallet?.address || '';

    if (!email) return;

    const registerAndLoad = async () => {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, walletAddress }),
      });
      const user: User = await res.json();
      setAppUser(user);
      await loadData(user.id, mode);
      setLoading(false);
    };

    registerAndLoad();
  }, [privyUser, loadData, mode]);

  return (
    <AuthGuard>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      ) : appUser ? (
        <div>
          {mode === 'crypto' ? (
            <>
              <CryptoBalanceCard
                balanceEth={cryptoBalance}
                walletAddress={appUser.walletAddress}
              />
              <CryptoActionButtons />
              <CryptoTransactionList transactions={cryptoTransactions} />
            </>
          ) : (
            <>
              {config.enableTestnetMode && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs font-medium text-amber-700">
                    Testnet Mode &mdash; Base Sepolia
                  </p>
                </div>
              )}
              <BalanceCard balanceCents={appUser.balanceCents} />
              <ActionButtons userId={appUser.id} />
              <TransactionList transactions={transactions} />
            </>
          )}
        </div>
      ) : null}
    </AuthGuard>
  );
}
