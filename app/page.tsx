'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Modal from '@/components/Modal';
import BalanceCard from '@/components/BalanceCard';
import ActionButtons from '@/components/ActionButtons';
import TransactionList from '@/components/TransactionList';
import SendFlow from '@/components/SendFlow';
import DebugPanel from '@/components/DebugPanel';
import CryptoBalanceCard from '@/components/crypto/CryptoBalanceCard';
import CryptoActionButtons from '@/components/crypto/CryptoActionButtons';
import CryptoTransactionList from '@/components/crypto/CryptoTransactionList';
import CryptoAssetSelector from '@/components/crypto/CryptoAssetSelector';
import CryptoSendFlow from '@/components/crypto/CryptoSendFlow';
import CryptoReceive from '@/components/crypto/CryptoReceive';
import { useInterfaceMode } from '@/lib/mode';
import { User, Transaction, CryptoTransaction, CryptoAsset } from '@/lib/types';
import { config } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';

const ASSET_STORAGE_KEY = 'privy-demo-crypto-asset';

export default function DashboardPage() {
  const { user: privyUser } = usePrivy();
  const { mode } = useInterfaceMode();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoTransactions, setCryptoTransactions] = useState<CryptoTransaction[]>([]);
  const [cryptoBalanceEth, setCryptoBalanceEth] = useState('0');
  const [cryptoBalanceUsdc, setCryptoBalanceUsdc] = useState('0');
  const [loading, setLoading] = useState(true);

  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ASSET_STORAGE_KEY);
      if (stored === 'ETH' || stored === 'USDC') return stored;
    }
    return 'ETH';
  });

  // Modal state
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  // Abstracted receive state
  const [depositLoading, setDepositLoading] = useState(false);
  const [deposited, setDeposited] = useState(false);

  const handleAssetChange = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    localStorage.setItem(ASSET_STORAGE_KEY, asset);
  };

  const loadData = useCallback(async (userId: string, currentMode: string) => {
    if (currentMode === 'crypto') {
      const res = await fetch(`/api/transactions?userId=${userId}&mode=crypto`);
      const data = await res.json();
      setCryptoBalanceEth(data.balanceEth);
      setCryptoBalanceUsdc(data.balanceUsdc);
      setCryptoTransactions(data.transactions);
    } else {
      const txRes = await fetch(`/api/transactions?userId=${userId}`);
      const txns = await txRes.json();
      setTransactions(txns);
    }
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
      await loadData(user.id, mode);
      setLoading(false);
    };

    registerAndLoad();
  }, [privyUser, loadData, mode]);

  const handleSendComplete = async () => {
    setSendOpen(false);
    if (appUser) {
      await loadData(appUser.id, mode);
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
    await loadData(appUser.id, mode);
    setDeposited(true);
    setDepositLoading(false);
  };

  const sendModalTitle = mode === 'crypto' ? `Send ${selectedAsset}` : 'Send USD';
  const receiveModalTitle = mode === 'crypto' ? `Receive ${selectedAsset}` : 'Receive USD';

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
              <div className="mb-4">
                <CryptoAssetSelector selected={selectedAsset} onSelect={handleAssetChange} />
              </div>
              <CryptoBalanceCard
                balanceEth={cryptoBalanceEth}
                balanceUsdc={cryptoBalanceUsdc}
                selectedAsset={selectedAsset}
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
          <Modal open={sendOpen} onClose={() => setSendOpen(false)} title={sendModalTitle} sidebarOpen>
            {mode === 'crypto' ? (
              <CryptoSendFlow
                appUser={appUser}
                balanceEth={cryptoBalanceEth}
                balanceUsdc={cryptoBalanceUsdc}
                selectedAsset={selectedAsset}
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
          <Modal open={receiveOpen} onClose={() => setReceiveOpen(false)} title={receiveModalTitle} sidebarOpen>
            {mode === 'crypto' ? (
              <CryptoReceive
                walletAddress={appUser.walletAddress}
                selectedAsset={selectedAsset}
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
                  style={{ backgroundColor: config.primaryColor }}
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
      ) : null}
    </AuthGuard>
  );
}
