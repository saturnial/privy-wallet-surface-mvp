'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import Modal from '@/components/Modal';
import BalanceCard from '@/components/BalanceCard';
import ActionButtons from '@/components/ActionButtons';
import TransactionList from '@/components/TransactionList';
import SendFlow from '@/components/SendFlow';
import DebugPanel from '@/components/DebugPanel';
import CryptoBalanceCard from '@/components/crypto/CryptoBalanceCard';
import CryptoActionButtons from '@/components/crypto/CryptoActionButtons';
import CryptoTransactionList from '@/components/crypto/CryptoTransactionList';
import CryptoSendFlow from '@/components/crypto/CryptoSendFlow';
import CryptoReceive from '@/components/crypto/CryptoReceive';
import { useInterfaceMode } from '@/lib/mode';
import { useBranding } from './BrandingContext';
import { User, Transaction, CryptoTransaction } from '@/lib/types';
import { config } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';

export default function WalletDashboard({
  sidebarOffset = false,
}: {
  sidebarOffset?: boolean;
}) {
  const { user: privyUser } = usePrivy();
  const { mode } = useInterfaceMode();
  const { primaryColor } = useBranding();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoTransactions, setCryptoTransactions] = useState<CryptoTransaction[]>([]);
  const [cryptoBalanceEth, setCryptoBalanceEth] = useState('0');
  const [cryptoBalanceUsdc, setCryptoBalanceUsdc] = useState('0');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  // Abstracted receive state
  const [depositLoading, setDepositLoading] = useState(false);
  const [deposited, setDeposited] = useState(false);

  const loadAllData = useCallback(async (userId: string) => {
    const [txRes, cryptoRes] = await Promise.all([
      fetch(`/api/transactions?userId=${userId}`),
      fetch(`/api/transactions?userId=${userId}&mode=crypto`),
    ]);
    const txns = await txRes.json();
    setTransactions(txns);
    const cryptoData = await cryptoRes.json();
    setCryptoBalanceEth(cryptoData.balanceEth);
    setCryptoBalanceUsdc(cryptoData.balanceUsdc);
    setCryptoTransactions(cryptoData.transactions);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!privyUser?.email?.address) return;
    const res = await fetch(`/api/user?email=${encodeURIComponent(privyUser.email.address)}`);
    if (res.ok) {
      const user: User = await res.json();
      setAppUser(user);
      return user;
    }
    return null;
  }, [privyUser]);

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
      await loadAllData(user.id);
      setLoading(false);
    };

    registerAndLoad();
  }, [privyUser, loadAllData]);

  const handleSendComplete = async () => {
    setSendOpen(false);
    if (appUser) {
      await loadAllData(appUser.id);
      const refreshed = await fetchUser();
      if (refreshed) setAppUser(refreshed);
    }
  };

  const handleSimulateDeposit = async () => {
    if (!appUser) return;
    setDepositLoading(true);
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

    const refreshed = await fetchUser();
    if (refreshed) setAppUser(refreshed);
    await loadAllData(appUser.id);
    setDeposited(true);
    setDepositLoading(false);

    setTimeout(() => {
      setReceiveOpen(false);
      setDeposited(false);
    }, 1200);
  };

  const sendModalTitle = mode === 'crypto' ? 'Send' : 'Send USD';
  const receiveModalTitle = mode === 'crypto' ? 'Receive' : 'Receive USD';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!appUser) return null;

  return (
    <div>
      {mode === 'crypto' ? (
        <>
          <CryptoBalanceCard
            balanceEth={cryptoBalanceEth}
            balanceUsdc={cryptoBalanceUsdc}
            walletAddress={appUser.walletAddress}
          />
          <CryptoActionButtons
            onSend={() => setSendOpen(true)}
            onReceive={() => setReceiveOpen(true)}
          />
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
          <ActionButtons
            onSend={() => setSendOpen(true)}
            onReceive={() => setReceiveOpen(true)}
          />
          <TransactionList transactions={transactions} />
        </>
      )}

      {/* Send Modal */}
      <Modal open={sendOpen} onClose={() => setSendOpen(false)} title={sendModalTitle} sidebarOpen={sidebarOffset}>
        {mode === 'crypto' ? (
          <CryptoSendFlow
            appUser={appUser}
            balanceEth={cryptoBalanceEth}
            balanceUsdc={cryptoBalanceUsdc}
            onComplete={handleSendComplete}
          />
        ) : (
          <SendFlow
            appUser={appUser}
            onComplete={handleSendComplete}
          />
        )}
      </Modal>

      {/* Receive Modal */}
      <Modal open={receiveOpen} onClose={() => setReceiveOpen(false)} title={receiveModalTitle} sidebarOpen={sidebarOffset}>
        {mode === 'crypto' ? (
          <CryptoReceive
            walletAddress={appUser.walletAddress}
          />
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              In production, deposits would arrive via ACH, wire transfer, or
              stablecoin rails. For this demo, simulate a deposit below.
            </p>

            <button
              onClick={handleSimulateDeposit}
              disabled={depositLoading}
              className="w-full py-3 rounded-xl text-white font-medium text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {depositLoading ? 'Processing...' : `Simulate Deposit ${formatCurrency(config.simulatedDepositCents)}`}
            </button>

            {deposited && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                <p className="text-sm font-medium text-green-700">
                  {formatCurrency(config.simulatedDepositCents)} deposited successfully
                </p>
              </div>
            )}

            <DebugPanel />
          </div>
        )}
      </Modal>
    </div>
  );
}
